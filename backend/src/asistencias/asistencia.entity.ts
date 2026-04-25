import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Poblador } from '../pobladores/poblador.entity';
import { Evento } from '../eventos/evento.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoAsistencia {
    PRESENTE = 'presente',
    AUSENTE = 'ausente',
    JUSTIFICADO = 'justificado',
}

@Entity('asistencias')
export class Asistencia {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Evento, (e) => e.asistencias)
    evento: Evento;

    @ManyToOne(() => Poblador, (p) => p.asistencias)
    poblador: Poblador;

    @Column({ type: 'enum', enum: EstadoAsistencia, default: EstadoAsistencia.AUSENTE })
    estado: EstadoAsistencia;

    @Column({ type: 'text', nullable: true })
    justificacion?: string;

    @Column({ type: 'timestamp', nullable: true })
    horaRegistro: Date;

    @ManyToOne(() => Usuario, { nullable: true })
    registradoPor: Usuario;

    @CreateDateColumn()
    createdAt: Date;
}