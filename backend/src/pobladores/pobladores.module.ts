import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poblador } from './poblador.entity';
import { PobladoresService } from './pobladores.service';
import { PobladoresController } from './pobladores.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Poblador]), AuditoriaModule],
  providers: [PobladoresService],
  controllers: [PobladoresController],
  exports: [TypeOrmModule, PobladoresService],
})
export class PobladoresModule {}