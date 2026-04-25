import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Animal } from './animal.entity';
import { AnimalesService } from './animales.service';
import { AnimalesController } from './animales.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Animal]), AuditoriaModule],
  providers: [AnimalesService],
  controllers: [AnimalesController],
  exports: [TypeOrmModule, AnimalesService],
})
export class AnimalesModule {}