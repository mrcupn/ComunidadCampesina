import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPoblador } from './tipo-poblador.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CrearTipoPobladorDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  valorGanado?: number;
}

@Injectable()
export class TipoPobladorService {
  constructor(
    @InjectRepository(TipoPoblador)
    private tipoPobladorRepository: Repository<TipoPoblador>,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(dto: CrearTipoPobladorDto, usuarioActual?: any) {
    const tipo = this.tipoPobladorRepository.create(dto);
    const resultado = await this.tipoPobladorRepository.save(tipo);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'tipo-poblador',
      descripcion: `Creó el tipo de poblador: ${dto.nombre}`,
    });
    return resultado;
  }

  async listar() {
    return this.tipoPobladorRepository.find({ where: { activo: true } });
  }

  async buscarPorId(id: number) {
    const tipo = await this.tipoPobladorRepository.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de poblador no encontrado');
    return tipo;
  }

  async actualizar(id: number, dto: Partial<CrearTipoPobladorDto>, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.tipoPobladorRepository.update(id, dto);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'tipo-poblador',
      descripcion: `Editó el tipo de poblador ID: ${id}`,
    });
    return this.buscarPorId(id);
  }

  async eliminar(id: number, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.tipoPobladorRepository.update(id, { activo: false });
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.ELIMINAR,
      modulo: 'tipo-poblador',
      descripcion: `Desactivó el tipo de poblador ID: ${id}`,
    });
    return { message: 'Tipo desactivado correctamente' };
  }
}