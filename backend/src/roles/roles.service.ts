import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RolCatalogo } from './rol-catalogo.entity';
import { PobladorRol } from './poblador-rol.entity';
import { CrearRolDto } from './dto/crear-rol.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolCatalogo)
    private rolRepository: Repository<RolCatalogo>,
    @InjectRepository(PobladorRol)
    private pobladorRolRepository: Repository<PobladorRol>,
    private auditoriaService: AuditoriaService,
  ) {}

  // --- Catálogo de roles ---
  async crearRol(dto: CrearRolDto, usuarioActual?: any) {
    const rol = this.rolRepository.create(dto);
    const resultado = await this.rolRepository.save(rol);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'roles',
      descripcion: `Creó el rol: ${dto.nombre}`,
    });
    return resultado;
  }

  async listarRoles() {
    return this.rolRepository.find({ where: { activo: true } });
  }

  // --- Asignación de roles ---
 async asignarRol(dto: AsignarRolDto, usuarioId: number, usuarioActual?: any) {
    const rolVigente = await this.pobladorRolRepository.findOne({
      where: {
        poblador: { id: dto.pobladorId },
        rol: { id: dto.rolId },
        fechaFin: IsNull(),
      },
    });

    if (rolVigente) {
      rolVigente.fechaFin = new Date();
      await this.pobladorRolRepository.save(rolVigente);
    }

    const nuevaAsignacion = this.pobladorRolRepository.create({
      poblador: { id: dto.pobladorId },
      rol: { id: dto.rolId },
      fechaInicio: dto.fechaInicio,
      observacion: dto.observacion,
      asignadoPor: { id: usuarioId },
    });
    const resultado = await this.pobladorRolRepository.save(nuevaAsignacion);

    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'roles',
      descripcion: `Asignó rol ID: ${dto.rolId} al poblador ID: ${dto.pobladorId}`,
    });
    return resultado;
  }

  async cerrarRol(pobladorRolId: number, usuarioActual?: any) {
    const asignacion = await this.pobladorRolRepository.findOne({
      where: { id: pobladorRolId },
    });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    asignacion.fechaFin = new Date();
    const resultado = await this.pobladorRolRepository.save(asignacion);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'roles',
      descripcion: `Cerró la asignación de rol ID: ${pobladorRolId}`,
    });
    return resultado;
  }

  async historialPorPoblador(pobladorId: number) {
    return this.pobladorRolRepository.find({
      where: { poblador: { id: pobladorId } },
      relations: ['rol', 'asignadoPor'],
      order: { fechaInicio: 'DESC' },
    });
  }

  async historialPorRol(rolId: number) {
    return this.pobladorRolRepository.find({
      where: { rol: { id: rolId } },
      relations: ['poblador', 'asignadoPor'],
      order: { fechaInicio: 'DESC' },
    });
  }

  async rolesVigentes() {
    return this.pobladorRolRepository.find({
      where: { fechaFin: IsNull() },
      relations: ['poblador', 'rol'],
    });
  }
}