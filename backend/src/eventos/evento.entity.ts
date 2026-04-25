import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Asistencia } from '../asistencias/asistencia.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum TipoEvento {
  FAENA = 'faena',
  ASAMBLEA = 'asamblea',
}

export enum EstadoEvento {
  PROGRAMADO = 'programado',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoEvento })
  tipo: TipoEvento;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ length: 200, nullable: true })
  lugar: string;

  @Column({ type: 'enum', enum: EstadoEvento, default: EstadoEvento.PROGRAMADO })
  estado: EstadoEvento;

  @ManyToOne(() => Usuario, { nullable: true })
  creadoPor: Usuario;

  @OneToMany(() => Asistencia, (a) => a.evento)
  asistencias: Asistencia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}