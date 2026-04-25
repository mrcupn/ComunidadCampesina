import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './evento.entity';
import { Asistencia } from '../asistencias/asistencia.entity';
import { Poblador } from '../pobladores/poblador.entity';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Asistencia, Poblador]), AuditoriaModule],
  providers: [EventosService],
  controllers: [EventosController],
  exports: [TypeOrmModule, EventosService],
})
export class EventosModule {}