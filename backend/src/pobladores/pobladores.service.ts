import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poblador } from './poblador.entity';
import { CrearPobladorDto } from './dto/crear-poblador.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';

@Injectable()
export class PobladoresService {
  constructor(
    @InjectRepository(Poblador)
    private pobladorRepository: Repository<Poblador>,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(dto: CrearPobladorDto, usuarioActual?: any) {
    const poblador = this.pobladorRepository.create({
      ...dto,
      tipo: dto.tipoId ? { id: dto.tipoId } : undefined,
    });
    const resultado = await this.pobladorRepository.save(poblador);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'pobladores',
      descripcion: `Creó el poblador: ${dto.nombre} ${dto.apellido} (DNI: ${dto.dni})`,
    });
    return resultado;
  }

  async listar() {
    return this.pobladorRepository.find({
      relations: ['tipo'],
      order: { apellido: 'ASC' },
    });
  }

  async buscarPorId(id: number) {
    const poblador = await this.pobladorRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.rol', 'tipo'],
    });
    if (!poblador) throw new NotFoundException('Poblador no encontrado');
    return poblador;
  }

  async buscarPorDni(dni: string) {
    const poblador = await this.pobladorRepository.findOne({ where: { dni } });
    if (!poblador) throw new NotFoundException('Poblador no encontrado');
    return poblador;
  }

  async actualizar(id: number, datos: Partial<CrearPobladorDto>, usuarioActual?: any) {
    await this.buscarPorId(id);
    const { tipoId, ...resto } = datos;
    await this.pobladorRepository.update(id, {
      ...resto,
      tipo: tipoId ? { id: tipoId } : undefined,
    });
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'pobladores',
      descripcion: `Editó el poblador ID: ${id}`,
    });
    return this.buscarPorId(id);
  }

  async eliminar(id: number, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.pobladorRepository.update(id, { activo: false });
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.ELIMINAR,
      modulo: 'pobladores',
      descripcion: `Desactivó el poblador ID: ${id}`,
    });
    return { message: 'Poblador desactivado correctamente' };
  }
}