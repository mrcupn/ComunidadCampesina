import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperacionAnimal } from './operacion-animal.entity';
import { OperacionAnimalDetalle } from './operacion-animal-detalle.entity';
import { PobladorAnimalStock } from './poblador-animal-stock.entity';
import { PagoGanado, PagoGanadoDetalle, PagoGanadoAbono } from './pago-ganado.entity';
import { Poblador } from '../pobladores/poblador.entity';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperacionAnimal,
      OperacionAnimalDetalle,
      PobladorAnimalStock,
      Poblador,
      PagoGanado,
      PagoGanadoDetalle,
      PagoGanadoAbono,
    ]),
    AuditoriaModule,
  ],
  providers: [OperacionesService, PagosService],
  controllers: [OperacionesController, PagosController],
  exports: [TypeOrmModule, OperacionesService, PagosService],
})
export class OperacionesModule {}