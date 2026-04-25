import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolSistema } from './usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private auditoriaService: AuditoriaService,
  ) {}

  async crearUsuario(nombre: string, email: string, password: string, rol: RolSistema = RolSistema.DIGITADOR, usuarioActual?: any) {
    const hash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepository.create({ nombre, email, password: hash, rol });
    const resultado = await this.usuarioRepository.save(usuario);
    if (usuarioActual) {
      await this.auditoriaService.registrar({
        usuarioId: usuarioActual.id,
        usuarioNombre: usuarioActual.nombre,
        accion: AccionAuditoria.CREAR,
        modulo: 'usuarios',
        descripcion: `Creó el usuario: ${nombre} (${email})`,
      });
    }
    return resultado;
  }

  async listar() {
    return this.usuarioRepository.find({
      select: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt'],
    });
  }

  async buscarPorId(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt'],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

   async actualizar(id: number, datos: Partial<Usuario>, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.usuarioRepository.update(id, datos);
    if (usuarioActual) {
      await this.auditoriaService.registrar({
        usuarioId: usuarioActual.id,
        usuarioNombre: usuarioActual.nombre,
        accion: AccionAuditoria.EDITAR,
        modulo: 'usuarios',
        descripcion: `Editó el usuario ID: ${id}`,
      });
    }
    return this.buscarPorId(id);
  }

  async eliminar(id: number, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.usuarioRepository.update(id, { activo: false });
    if (usuarioActual) {
      await this.auditoriaService.registrar({
        usuarioId: usuarioActual.id,
        usuarioNombre: usuarioActual.nombre,
        accion: AccionAuditoria.ELIMINAR,
        modulo: 'usuarios',
        descripcion: `Desactivó el usuario ID: ${id}`,
      });
    }
    return { message: 'Usuario desactivado correctamente' };
  }
}