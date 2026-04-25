import { IsDateString, IsNumber,IsOptional, IsString, Length } from 'class-validator';
import { IsEnum } from 'class-validator';
import { Sexo } from '../poblador.entity';

export class CrearPobladorDto {
  @IsString()
  @Length(8, 8)
  dni: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;


  @IsEnum(Sexo)
  @IsOptional()
  sexo?: Sexo;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: Date;

  @IsNumber()
  @IsOptional()
  tipoId?: number;
}