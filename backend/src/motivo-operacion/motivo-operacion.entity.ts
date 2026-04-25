import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoMovimiento {
  AGREGAR = 'agregar',
  DESCONTAR = 'descontar',
}

@Entity('motivos_operacion')
export class MotivoOperacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipoMovimiento: TipoMovimiento;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}