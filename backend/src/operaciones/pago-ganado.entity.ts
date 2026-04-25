import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Poblador } from '../pobladores/poblador.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADO = 'pagado',
}

@Entity('pagos_ganado')
export class PagoGanado {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Poblador)
  poblador: Poblador;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAnimales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorGanadoUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalMonto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPagado: number;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estado: EstadoPago;

  @ManyToOne(() => Usuario, { nullable: true })
  registradoPor: Usuario;

  @OneToMany(() => PagoGanadoDetalle, (d) => d.pago, { cascade: true })
  detalles: PagoGanadoDetalle[];

  @OneToMany(() => PagoGanadoAbono, (a) => a.pago, { cascade: true })
  abonos: PagoGanadoAbono[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('pagos_ganado_detalle')
export class PagoGanadoDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PagoGanado, (p) => p.detalles)
  pago: PagoGanado;

  @Column({ length: 100 })
  animalNombre: string;

  @Column({ type: 'int' })
  cantidad: number;
}

@Entity('pagos_ganado_abono')
export class PagoGanadoAbono {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PagoGanado, (p) => p.abonos)
  pago: PagoGanado;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  registradoPor: Usuario;

  @CreateDateColumn()
  createdAt: Date;
}