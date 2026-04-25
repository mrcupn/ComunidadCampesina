import { IsOptional, IsString } from 'class-validator';

export class CrearRolDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}