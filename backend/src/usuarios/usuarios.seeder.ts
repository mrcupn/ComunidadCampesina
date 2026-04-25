import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolSistema } from './usuario.entity';

@Injectable()
export class UsuariosSeeder implements OnApplicationBootstrap {
  constructor(
    private usuariosService: UsuariosService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async onApplicationBootstrap() {
    const existe = await this.usuarioRepository.findOne({
      where: { email: 'admin@comunidad.com' },
    });

    if (!existe) {
      await this.usuariosService.crearUsuario(
        'Administrador',
        'admin@comunidad.com',
        'admin123',
        RolSistema.ADMIN,
      );
      console.log('✅ Usuario admin creado: admin@comunidad.com / admin123');
    }
  }
}