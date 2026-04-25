import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Auditoria, AccionAuditoria } from './auditoria.entity';

export interface RegistrarAuditoriaDto {
  usuarioId?: number;
  usuarioNombre?: string;
  accion: AccionAuditoria;
  modulo: string;
  descripcion?: string;
  ip?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) {}

  async registrar(dto: RegistrarAuditoriaDto) {
    const auditoria = this.auditoriaRepository.create(dto);
    return this.auditoriaRepository.save(auditoria);
  }

  async listar(filtros?: { modulo?: string; accion?: string; fechaInicio?: string; fechaFin?: string }) {
    const query = this.auditoriaRepository.createQueryBuilder('a')
      .orderBy('a.createdAt', 'DESC');

    if (filtros?.modulo) {
      query.andWhere('a.modulo = :modulo', { modulo: filtros.modulo });
    }
    if (filtros?.accion) {
      query.andWhere('a.accion = :accion', { accion: filtros.accion });
    }
    if (filtros?.fechaInicio && filtros?.fechaFin) {
      query.andWhere('a.createdAt BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio: new Date(filtros.fechaInicio),
        fechaFin: new Date(filtros.fechaFin + 'T23:59:59'),
      });
    }

    return query.getMany();
  }
}