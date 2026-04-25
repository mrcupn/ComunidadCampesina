import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolCatalogo } from './rol-catalogo.entity';
import { PobladorRol } from './poblador-rol.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([RolCatalogo, PobladorRol]), AuditoriaModule],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}