import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from '../eventos/evento.entity';
import { Asistencia } from '../asistencias/asistencia.entity';
import { PobladorRol } from '../roles/poblador-rol.entity';
import { Poblador } from '../pobladores/poblador.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Asistencia, PobladorRol, Poblador])],
  providers: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule {}