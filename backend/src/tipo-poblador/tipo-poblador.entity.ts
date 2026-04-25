import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Poblador } from '../pobladores/poblador.entity';

@Entity('tipos_poblador')
export class TipoPoblador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorGanado: number;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Poblador, (p) => p.tipo)
  pobladores: Poblador[];

  @CreateDateColumn()
  createdAt: Date;
}