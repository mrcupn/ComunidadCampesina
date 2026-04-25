import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoPoblador } from './tipo-poblador.entity';
import { TipoPobladorService } from './tipo-poblador.service';
import { TipoPobladorController } from './tipo-poblador.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([TipoPoblador]), AuditoriaModule],
  providers: [TipoPobladorService],
  controllers: [TipoPobladorController],
  exports: [TypeOrmModule, TipoPobladorService],
})
export class TipoPobladorModule {}