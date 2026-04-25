import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PagoGanado, PagoGanadoDetalle, PagoGanadoAbono, EstadoPago } from './pago-ganado.entity';
import { OperacionAnimalDetalle } from './operacion-animal-detalle.entity';
import { OperacionAnimal } from './operacion-animal.entity';
import { PobladorAnimalStock } from './poblador-animal-stock.entity';
import { Poblador } from '../pobladores/poblador.entity';
import { TipoMovimiento } from '../motivo-operacion/motivo-operacion.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';

export class GenerarPagoDto {
    @IsNumber()
    pobladorId: number;

    @IsNumber()
    anio: number;
}

export class RegistrarAbonoDto {
    @IsNumber()
    pagoId: number;

    @IsNumber()
    monto: number;

    @IsString()
    @IsOptional()
    observacion?: string;
}

@Injectable()
export class PagosService {
    constructor(
        @InjectRepository(PagoGanado)
        private pagoRepository: Repository<PagoGanado>,
        @InjectRepository(PagoGanadoDetalle)
        private pagoDetalleRepository: Repository<PagoGanadoDetalle>,
        @InjectRepository(PagoGanadoAbono)
        private abonoRepository: Repository<PagoGanadoAbono>,
        @InjectRepository(OperacionAnimal)
        private operacionRepository: Repository<OperacionAnimal>,
        @InjectRepository(OperacionAnimalDetalle)
        private operacionDetalleRepository: Repository<OperacionAnimalDetalle>,
        @InjectRepository(PobladorAnimalStock)
        private stockRepository: Repository<PobladorAnimalStock>,
        @InjectRepository(Poblador)
        private pobladorRepository: Repository<Poblador>,
        private auditoriaService: AuditoriaService,
    ) { }

    async generarPago(dto: GenerarPagoDto, usuarioId: number, usuarioActual?: any) {
        // Verificar que no exista ya un pago para ese año
        const pagoExistente = await this.pagoRepository.findOne({
            where: { poblador: { id: dto.pobladorId }, anio: dto.anio },
        });
        if (pagoExistente) {
            throw new BadRequestException(`Ya existe un pago generado para el año ${dto.anio}`);
        }

        // Período junio-junio
        const fechaInicio = new Date(`${dto.anio}-06-01T00:00:00`);
        const fechaFin = new Date(`${dto.anio + 1}-05-31T23:59:59`);

        // Obtener todas las operaciones del período
        const operaciones = await this.operacionRepository.find({
            where: {
                poblador: { id: dto.pobladorId },
                fecha: Between(fechaInicio, fechaFin),
            },
            relations: ['detalles'],
            order: { fecha: 'DESC' },
        });

        if (operaciones.length === 0) {
            throw new BadRequestException('No hay operaciones registradas en ese período');
        }

        // Calcular stock al final del período por animal
        const stockMap: Record<string, number> = {};
        // Procesar en orden cronológico (invertir)
        const operacionesOrdenadas = [...operaciones].reverse();
        for (const op of operacionesOrdenadas) {
            for (const det of op.detalles) {
                if (!stockMap[det.animalNombre]) stockMap[det.animalNombre] = 0;
                if (det.tipoMovimiento === TipoMovimiento.AGREGAR) {
                    stockMap[det.animalNombre] += det.cantidad;
                } else {
                    stockMap[det.animalNombre] -= det.cantidad;
                    if (stockMap[det.animalNombre] < 0) stockMap[det.animalNombre] = 0;
                }
            }
        }

        // Obtener el valorGanadoUnitario de la última operación del período
        const ultimaOperacion = operaciones[0]; // ya están en DESC
        const ultimoDetalle = ultimaOperacion.detalles[0];
        // Obtener el valorGanadoUnitario del último detalle con valor > 0
        let valorGanadoUnitario = 0;
        for (const op of operaciones) { // ya están en DESC
            const detConValor = op.detalles.find((d) => Number(d.valorGanadoUnitario) > 0);
            if (detConValor) {
                valorGanadoUnitario = Number(detConValor.valorGanadoUnitario);
                break;
            }
        }

        // Calcular total de animales
        const totalAnimales = Object.values(stockMap).reduce((acc, val) => acc + val, 0);
        const totalMonto = totalAnimales * valorGanadoUnitario;

        // Crear el pago
        const pago = this.pagoRepository.create({
            poblador: { id: dto.pobladorId },
            anio: dto.anio,
            totalAnimales,
            valorGanadoUnitario,
            totalMonto,
            totalPagado: 0,
            estado: EstadoPago.PENDIENTE,
            registradoPor: { id: usuarioId },
        });
        await this.pagoRepository.save(pago);

        // Guardar detalle de animales
        for (const [animalNombre, cantidad] of Object.entries(stockMap)) {
            if (cantidad > 0) {
                const detalle = this.pagoDetalleRepository.create({
                    pago,
                    animalNombre,
                    cantidad,
                });
                await this.pagoDetalleRepository.save(detalle);
            }
        }

        await this.auditoriaService.registrar({
            usuarioId: usuarioActual?.id,
            usuarioNombre: usuarioActual?.nombre,
            accion: AccionAuditoria.CREAR,
            modulo: 'pagos',
            descripcion: `Generó pago anual ${dto.anio} para poblador ID: ${dto.pobladorId} por S/ ${totalMonto}`,
        });

        return this.buscarPorId(pago.id);
    }

    async registrarAbono(dto: RegistrarAbonoDto, usuarioId: number, usuarioActual?: any) {
        const pago = await this.buscarPorId(dto.pagoId);

        if (pago.estado === EstadoPago.PAGADO) {
            throw new BadRequestException('Este pago ya está completado');
        }

        const totalPagado = Number(pago.totalPagado) + dto.monto;
        if (totalPagado > Number(pago.totalMonto)) {
            throw new BadRequestException(
                `El monto excede el total. Máximo a abonar: S/ ${(Number(pago.totalMonto) - Number(pago.totalPagado)).toFixed(2)}`
            );
        }

        // Guardar abono
        const abono = this.abonoRepository.create({
            pago: { id: dto.pagoId },
            monto: dto.monto,
            observacion: dto.observacion,
            fecha: new Date(),
            registradoPor: { id: usuarioId },
        });
        await this.abonoRepository.save(abono);

        // Actualizar pago
        const nuevoEstado = totalPagado >= Number(pago.totalMonto)
            ? EstadoPago.PAGADO
            : EstadoPago.PARCIAL;

        await this.pagoRepository.update(dto.pagoId, {
            totalPagado,
            estado: nuevoEstado,
        });

        await this.auditoriaService.registrar({
            usuarioId: usuarioActual?.id,
            usuarioNombre: usuarioActual?.nombre,
            accion: AccionAuditoria.CREAR,
            modulo: 'pagos',
            descripcion: `Registró abono de S/ ${dto.monto} al pago ID: ${dto.pagoId}`,
        });

        return this.buscarPorId(dto.pagoId);
    }

    async listar() {
        return this.pagoRepository.find({
            relations: ['poblador', 'detalles', 'abonos', 'registradoPor'],
            order: { anio: 'DESC', createdAt: 'DESC' },
        });
    }

    async listarPorPoblador(pobladorId: number) {
        return this.pagoRepository.find({
            where: { poblador: { id: pobladorId } },
            relations: ['detalles', 'abonos'],
            order: { anio: 'DESC' },
        });
    }

    async buscarPorId(id: number) {
        const pago = await this.pagoRepository.findOne({
            where: { id },
            relations: ['poblador', 'detalles', 'abonos', 'abonos.registradoPor', 'registradoPor'],
        });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        return pago;
    }

    async reportePorAnio(anio: number) {
        const fechaInicio = new Date(anio, 5, 1, 0, 0, 0); // junio = mes 5 (0-indexed)
        const fechaFin = new Date(anio + 1, 4, 31, 23, 59, 59); // mayo = mes 4

        const operaciones = await this.operacionRepository.find({
            where: { fecha: Between(fechaInicio, fechaFin) },
            relations: ['poblador', 'poblador.tipo', 'detalles'],
            order: { fecha: 'DESC' },
        });

        if (operaciones.length === 0) return [];

        const porPoblador = new Map<number, any>();

        for (const op of operaciones) {
            const pid = op.poblador.id;
            if (!porPoblador.has(pid)) {
                porPoblador.set(pid, {
                    poblador: op.poblador,
                    operaciones: [],
                });
            }
            porPoblador.get(pid).operaciones.push(op);
        }

        const resultado: any[] = [];

        for (const [, data] of porPoblador) {
            const { poblador, operaciones: ops } = data as any;

            const stockMap: Record<string, number> = {};
            const opsOrdenadas = [...ops].reverse();
            for (const op of opsOrdenadas) {
                for (const det of op.detalles) {
                    if (!stockMap[det.animalNombre]) stockMap[det.animalNombre] = 0;
                    if (det.tipoMovimiento === TipoMovimiento.AGREGAR) {
                        stockMap[det.animalNombre] += det.cantidad;
                    } else {
                        stockMap[det.animalNombre] -= det.cantidad;
                        if (stockMap[det.animalNombre] < 0) stockMap[det.animalNombre] = 0;
                    }
                }
            }

            let valorGanadoUnitario = 0;
            for (const op of ops) {
                const detConValor = op.detalles.find((d: any) => Number(d.valorGanadoUnitario) > 0);
                if (detConValor) {
                    valorGanadoUnitario = Number(detConValor.valorGanadoUnitario);
                    break;
                }
            }

            const totalAnimales = Object.values(stockMap).reduce((acc, val) => acc + val, 0);
            const totalMonto = totalAnimales * valorGanadoUnitario;

            const pagoExistente = await this.pagoRepository.findOne({
                where: { poblador: { id: poblador.id }, anio },
                relations: ['abonos'],
            });

            const totalPagado = pagoExistente ? Number(pagoExistente.totalPagado) : 0;
            const estado = pagoExistente ? pagoExistente.estado : 'pendiente';
            const abonos = pagoExistente ? pagoExistente.abonos.length : 0;

            resultado.push({
                poblador: {
                    id: poblador.id,
                    nombre: `${poblador.apellido}, ${poblador.nombre}`,
                    dni: poblador.dni,
                    tipo: poblador.tipo?.nombre ?? '-',
                },
                anio,
                valorGanadoUnitario,
                totalAnimales,
                totalMonto,
                totalPagado,
                saldo: totalMonto - totalPagado,
                estado,
                animales: Object.entries(stockMap)
                    .filter(([, cantidad]) => cantidad > 0)
                    .map(([animalNombre, cantidad]) => ({
                        animalNombre,
                        cantidad,
                        subtotal: cantidad * valorGanadoUnitario,
                    })),
                abonos,
                pagoGenerado: !!pagoExistente,
            });
        }

        const totalGeneral = resultado.reduce((acc, r) => acc + r.totalMonto, 0);
        const totalPagadoGeneral = resultado.reduce((acc, r) => acc + r.totalPagado, 0);
        const totalSaldoGeneral = resultado.reduce((acc, r) => acc + r.saldo, 0);

        return {
            resumen: {
                totalPobladores: resultado.length,
                totalGeneral,
                totalPagadoGeneral,
                totalSaldoGeneral,
            },
            detalle: resultado.sort((a, b) => a.poblador.nombre.localeCompare(b.poblador.nombre)),
        };

    }

}