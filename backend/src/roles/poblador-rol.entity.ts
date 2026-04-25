import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Poblador } from '../pobladores/poblador.entity';
import { RolCatalogo } from './rol-catalogo.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('poblador_roles')
export class PobladorRol {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Poblador, (p) => p.roles)
  poblador: Poblador;

  @ManyToOne(() => RolCatalogo, (r) => r.pobladorRoles)
  rol: RolCatalogo;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date', nullable: true })
  fechaFin: Date;

  @Column({ length: 255, nullable: true })
  observacion: string;

  @ManyToOne(() => Usuario, { nullable: true })
  asignadoPor: Usuario;

  @CreateDateColumn()
  createdAt: Date;
}