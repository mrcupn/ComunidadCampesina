import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotivoOperacion, TipoMovimiento } from './motivo-operacion.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CrearMotivoOperacionDto {
  @IsString()
  nombre: string;

  @IsEnum(TipoMovimiento)
  tipoMovimiento: TipoMovimiento;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

@Injectable()
export class MotivoOperacionService {
  constructor(
    @InjectRepository(MotivoOperacion)
    private motivoRepository: Repository<MotivoOperacion>,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(dto: CrearMotivoOperacionDto, usuarioActual?: any) {
    const motivo = this.motivoRepository.create(dto);
    const resultado = await this.motivoRepository.save(motivo);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'motivo-operacion',
      descripcion: `Creó el motivo: ${dto.nombre} (${dto.tipoMovimiento})`,
    });
    return resultado;
  }

  async listar() {
    return this.motivoRepository.find({ where: { activo: true } });
  }

  async buscarPorId(id: number) {
    const motivo = await this.motivoRepository.findOne({ where: { id } });
    if (!motivo) throw new NotFoundException('Motivo no encontrado');
    return motivo;
  }

  async actualizar(id: number, dto: Partial<CrearMotivoOperacionDto>, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.motivoRepository.update(id, dto);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'motivo-operacion',
      descripcion: `Editó el motivo ID: ${id}`,
    });
    return this.buscarPorId(id);
  }

  async eliminar(id: number, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.motivoRepository.update(id, { activo: false });
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.ELIMINAR,
      modulo: 'motivo-operacion',
      descripcion: `Desactivó el motivo ID: ${id}`,
    });
    return { message: 'Motivo desactivado correctamente' };
  }
}