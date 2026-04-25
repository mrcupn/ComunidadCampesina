import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento, EstadoEvento, TipoEvento } from './evento.entity';
import { CrearEventoDto } from './dto/crear-evento.dto';
import { Asistencia, EstadoAsistencia } from '../asistencias/asistencia.entity';
import { Poblador } from '../pobladores/poblador.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private eventoRepository: Repository<Evento>,
    @InjectRepository(Asistencia)
    private asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Poblador)
    private pobladorRepository: Repository<Poblador>,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(dto: CrearEventoDto, usuarioId: number, usuarioActual?: any) {
    const evento = this.eventoRepository.create({
      ...dto,
      creadoPor: { id: usuarioId },
    });
    const resultado = await this.eventoRepository.save(evento);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'eventos',
      descripcion: `Creó el evento: ${dto.titulo} (${dto.tipo})`,
    });
    return resultado;
  }

  async listar(tipo?: TipoEvento) {
    const where = tipo ? { tipo } : {};
    return this.eventoRepository.find({
      where,
      relations: ['creadoPor'],
      order: { fecha: 'DESC' },
    });
  }

  async buscarPorId(id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['creadoPor', 'asistencias', 'asistencias.poblador'],
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    return evento;
  }

  async cambiarEstado(id: number, estado: EstadoEvento, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.eventoRepository.update(id, { estado });

    if (estado === EstadoEvento.FINALIZADO) {
      const pobladores = await this.pobladorRepository.find({ where: { activo: true } });
      const asistencias = await this.asistenciaRepository.find({
        where: { evento: { id } },
        relations: ['poblador'],
      });
      const conRegistro = new Set(asistencias.map((a) => a.poblador.id));
      const sinRegistro = pobladores.filter((p) => !conRegistro.has(p.id));
      if (sinRegistro.length > 0) {
        const nuevasAsistencias = sinRegistro.map((p) =>
          this.asistenciaRepository.create({
            evento: { id },
            poblador: { id: p.id },
            estado: EstadoAsistencia.AUSENTE,
            horaRegistro: new Date(),
          }),
        );
        await this.asistenciaRepository.save(nuevasAsistencias);
      }
    }

    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'eventos',
      descripcion: `Cambió estado del evento ID: ${id} a ${estado}`,
    });

    return this.buscarPorId(id);
  }

  async actualizar(id: number, datos: Partial<CrearEventoDto>, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.eventoRepository.update(id, datos);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'eventos',
      descripcion: `Editó el evento ID: ${id}`,
    });
    return this.buscarPorId(id);
  }
}