import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Poblador } from '../pobladores/poblador.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { OperacionAnimalDetalle } from './operacion-animal-detalle.entity';

@Entity('operaciones_animal')
export class OperacionAnimal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Poblador)
  poblador: Poblador;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  observacion: string;

  @ManyToOne(() => Usuario, { nullable: true })
  registradoPor: Usuario;

  @OneToMany(() => OperacionAnimalDetalle, (d) => d.operacion, { cascade: true })
  detalles: OperacionAnimalDetalle[];

  @CreateDateColumn()
  createdAt: Date;
}