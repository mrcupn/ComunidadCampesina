import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosSeeder } from './usuarios.seeder';
import { UsuariosController } from './usuarios.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]),AuditoriaModule],
  providers: [UsuariosService, UsuariosSeeder],
  controllers: [UsuariosController],
  exports: [TypeOrmModule, UsuariosService],
})
export class UsuariosModule {}