import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
    private auditoriaService: AuditoriaService,
  ) { }

  async login(email: string, password: string, ipAddress?: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      select: ['id', 'nombre', 'email', 'password', 'rol', 'activo'],
    });

    if (!usuario || !usuario.activo) {
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.LOGIN,
        modulo: 'auth',
        descripcion: `Intento de login fallido con email: ${email}`,
        ip: ipAddress,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      await this.auditoriaService.registrar({
        accion: AccionAuditoria.LOGIN,
        modulo: 'auth',
        descripcion: `Intento de login fallido con email: ${email}`,
        ip: ipAddress,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.auditoriaService.registrar({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      accion: AccionAuditoria.LOGIN,
      modulo: 'auth',
      descripcion: `Login exitoso`,
      ip: ipAddress,
    });

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}