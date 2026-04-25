import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './asistencia.entity';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia]), AuditoriaModule],
  providers: [AsistenciasService],
  controllers: [AsistenciasController],
  exports: [TypeOrmModule, AsistenciasService],
})
export class AsistenciasModule {}