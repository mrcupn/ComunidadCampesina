import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotivoOperacion } from './motivo-operacion.entity';
import { MotivoOperacionService } from './motivo-operacion.service';
import { MotivoOperacionController } from './motivo-operacion.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([MotivoOperacion]), AuditoriaModule],
  providers: [MotivoOperacionService],
  controllers: [MotivoOperacionController],
  exports: [TypeOrmModule, MotivoOperacionService],
})
export class MotivoOperacionModule {}