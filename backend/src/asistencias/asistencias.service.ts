import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia, EstadoAsistencia } from './asistencia.entity';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private asistenciaRepository: Repository<Asistencia>,
    private auditoriaService: AuditoriaService,
  ) {}

  async registrar(dto: RegistrarAsistenciaDto, usuarioId: number, usuarioActual?: any) {
    let asistencia = await this.asistenciaRepository.findOne({
      where: {
        evento: { id: dto.eventoId },
        poblador: { id: dto.pobladorId },
      },
    });

    if (asistencia) {
      asistencia.estado = dto.estado ?? EstadoAsistencia.PRESENTE;
      asistencia.justificacion = dto.justificacion ?? undefined;
      asistencia.horaRegistro = new Date();
      asistencia.registradoPor = { id: usuarioId } as any;
      await this.asistenciaRepository.save(asistencia);
    } else {
      asistencia = this.asistenciaRepository.create({
        evento: { id: dto.eventoId },
        poblador: { id: dto.pobladorId },
        estado: dto.estado ?? EstadoAsistencia.PRESENTE,
        justificacion: dto.justificacion,
        horaRegistro: new Date(),
        registradoPor: { id: usuarioId } as any,
      });
      await this.asistenciaRepository.save(asistencia);
    }

    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'asistencias',
      descripcion: `Registró asistencia del poblador ID: ${dto.pobladorId} en evento ID: ${dto.eventoId} como ${dto.estado ?? 'presente'}`,
    });

    return asistencia;
  }

  async listarPorEvento(eventoId: number) {
    return this.asistenciaRepository.find({
      where: { evento: { id: eventoId } },
      relations: ['poblador'],
      order: { poblador: { apellido: 'ASC' } },
    });
  }

  async listarPorPoblador(pobladorId: number) {
    return this.asistenciaRepository.find({
      where: { poblador: { id: pobladorId } },
      relations: ['evento'],
      order: { createdAt: 'DESC' },
    });
  }

  async resumenEvento(eventoId: number) {
    const asistencias = await this.listarPorEvento(eventoId);
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === EstadoAsistencia.PRESENTE).length;
    const ausentes = asistencias.filter(a => a.estado === EstadoAsistencia.AUSENTE).length;
    const justificados = asistencias.filter(a => a.estado === EstadoAsistencia.JUSTIFICADO).length;
    return { total, presentes, ausentes, justificados };
  }
}