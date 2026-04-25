import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PobladorRol } from '../roles/poblador-rol.entity';
import { Asistencia } from '../asistencias/asistencia.entity';
import { ManyToOne, JoinColumn } from 'typeorm';
import { TipoPoblador } from '../tipo-poblador/tipo-poblador.entity';


export enum Sexo {
    MASCULINO = 'M',
    FEMENINO = 'F',
}

@Entity('pobladores')
export class Poblador {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 8, unique: true })
    dni: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    apellido: string;

    @Column({ length: 200, nullable: true })
    direccion: string;

    @Column({ length: 15, nullable: true })
    telefono: string;

    @Column({ type: 'date', nullable: true })
    fechaNacimiento: Date;

    @Column({ type: 'enum', enum: Sexo, nullable: true })
    sexo: Sexo;

    @Column({ default: true })
    activo: boolean;

    @OneToMany(() => PobladorRol, (pr) => pr.poblador)
    roles: PobladorRol[];

    @ManyToOne(() => TipoPoblador, { nullable: true })
    @JoinColumn()
    tipo: TipoPoblador;

    @OneToMany(() => Asistencia, (a) => a.poblador)
    asistencias: Asistencia[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}