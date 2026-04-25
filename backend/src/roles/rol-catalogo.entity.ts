import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PobladorRol } from './poblador-rol.entity';

@Entity('roles_catalogo')
export class RolCatalogo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => PobladorRol, (pr) => pr.rol)
  pobladorRoles: PobladorRol[];

  @CreateDateColumn()
  createdAt: Date;
}