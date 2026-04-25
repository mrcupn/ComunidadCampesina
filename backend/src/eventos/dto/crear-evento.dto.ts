import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoEvento } from '../evento.entity';

export class CrearEventoDto {
  @IsEnum(TipoEvento)
  tipo: TipoEvento;

  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  fecha: Date;

  @IsString()
  @IsOptional()
  lugar?: string;
}