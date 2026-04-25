import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperacionAnimal } from './operacion-animal.entity';
import { OperacionAnimalDetalle } from './operacion-animal-detalle.entity';
import { PobladorAnimalStock } from './poblador-animal-stock.entity';
import { TipoMovimiento } from '../motivo-operacion/motivo-operacion.entity';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Poblador } from '../pobladores/poblador.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';

export class DetalleOperacionDto {
    @IsString()
    animalNombre: string;

    @IsString()
    motivoNombre: string;

    @IsString()
    tipoMovimiento: TipoMovimiento;

    @IsNumber()
    cantidad: number;
}

export class CrearOperacionDto {
    @IsNumber()
    pobladorId: number;

    @IsDateString()
    fecha: string;

    @IsString()
    @IsOptional()
    observacion?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetalleOperacionDto)
    detalles: DetalleOperacionDto[];
}

@Injectable()
export class OperacionesService {
    constructor(
        @InjectRepository(OperacionAnimal)
        private operacionRepository: Repository<OperacionAnimal>,
        @InjectRepository(OperacionAnimalDetalle)
        private detalleRepository: Repository<OperacionAnimalDetalle>,
        @InjectRepository(PobladorAnimalStock)
        private stockRepository: Repository<PobladorAnimalStock>,
        @InjectRepository(Poblador)
        private pobladorRepository: Repository<Poblador>,
        private auditoriaService: AuditoriaService,
    ) { }

    async crear(dto: CrearOperacionDto, usuarioId: number, usuarioActual?: any) {


        const poblador = await this.pobladorRepository.findOne({
            where: { id: dto.pobladorId },
            relations: ['tipo'],
        });
        const valorGanadoUnitario = poblador?.tipo?.valorGanado ?? 0;

        // Validar stock antes de guardar
        for (const detalle of dto.detalles) {
            if (detalle.tipoMovimiento === TipoMovimiento.DESCONTAR) {
                const stock = await this.stockRepository.findOne({
                    where: {
                        poblador: { id: dto.pobladorId },
                        animalNombre: detalle.animalNombre,
                    },
                });
                const cantidadActual = stock?.cantidad ?? 0;
                if (cantidadActual - detalle.cantidad < 0) {
                    throw new BadRequestException(
                        `Stock insuficiente de ${detalle.animalNombre}. Disponible: ${cantidadActual}`
                    );
                }
            }
        }

        // Crear operación
        const operacion = this.operacionRepository.create({
            poblador: { id: dto.pobladorId },
            fecha: new Date(dto.fecha),
            observacion: dto.observacion,
            registradoPor: { id: usuarioId },
        });
        await this.operacionRepository.save(operacion);

        // Guardar detalles y actualizar stock
        for (const detalle of dto.detalles) {
            const det = this.detalleRepository.create({
                operacion,
                animalNombre: detalle.animalNombre,
                motivoNombre: detalle.motivoNombre,
                tipoMovimiento: detalle.tipoMovimiento,
                cantidad: detalle.cantidad,
                valorGanadoUnitario,
            });
            await this.detalleRepository.save(det);

            // Actualizar stock
            let stock = await this.stockRepository.findOne({
                where: {
                    poblador: { id: dto.pobladorId },
                    animalNombre: detalle.animalNombre,
                },
            });

            if (!stock) {
                stock = this.stockRepository.create({
                    poblador: { id: dto.pobladorId },
                    animalNombre: detalle.animalNombre,
                    cantidad: 0,
                });
            }

            if (detalle.tipoMovimiento === TipoMovimiento.AGREGAR) {
                stock.cantidad += detalle.cantidad;
            } else {
                stock.cantidad -= detalle.cantidad;
            }

            await this.stockRepository.save(stock);
        }

        await this.auditoriaService.registrar({
            usuarioId: usuarioActual?.id,
            usuarioNombre: usuarioActual?.nombre,
            accion: AccionAuditoria.CREAR,
            modulo: 'operaciones',
            descripcion: `Registró operación de ganado para poblador ID: ${dto.pobladorId} con ${dto.detalles.length} animales`,
        });

        return this.buscarPorId(operacion.id);
    }

    async listar() {
        return this.operacionRepository.find({
            relations: ['poblador', 'detalles', 'registradoPor'],
            order: { fecha: 'DESC' },
        });
    }

    async buscarPorId(id: number) {
        const operacion = await this.operacionRepository.findOne({
            where: { id },
            relations: ['poblador', 'detalles', 'registradoPor'],
        });
        if (!operacion) throw new NotFoundException('Operación no encontrada');
        return operacion;
    }

    async listarPorPoblador(pobladorId: number) {
        return this.operacionRepository.find({
            where: { poblador: { id: pobladorId } },
            relations: ['detalles'],
            order: { fecha: 'DESC' },
        });
    }

    async stockPorPoblador(pobladorId: number) {
        return this.stockRepository.find({
            where: { poblador: { id: pobladorId } },
            order: { animalNombre: 'ASC' },
        });
    }
}