import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Poblador } from '../pobladores/poblador.entity';

@Entity('poblador_animal_stock')
export class PobladorAnimalStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Poblador)
  poblador: Poblador;

  @Column({ length: 100 })
  animalNombre: string;

  @Column({ type: 'int', default: 0 })
  cantidad: number;

  @UpdateDateColumn()
  updatedAt: Date;
}