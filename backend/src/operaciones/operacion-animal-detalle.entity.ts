import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OperacionAnimal } from './operacion-animal.entity';
import { TipoMovimiento } from '../motivo-operacion/motivo-operacion.entity';

@Entity('operaciones_animal_detalle')
export class OperacionAnimalDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OperacionAnimal, (o) => o.detalles)
  operacion: OperacionAnimal;

  @Column({ length: 100 })
  animalNombre: string;

  @Column({ length: 100 })
  motivoNombre: string;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipoMovimiento: TipoMovimiento;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
valorGanadoUnitario: number;
}