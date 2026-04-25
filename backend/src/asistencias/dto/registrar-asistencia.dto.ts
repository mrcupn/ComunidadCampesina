import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoAsistencia } from '../asistencia.entity';

export class RegistrarAsistenciaDto {
  @IsNumber()
  eventoId: number;

  @IsNumber()
  pobladorId: number;

  @IsEnum(EstadoAsistencia)
  @IsOptional()
  estado?: EstadoAsistencia;

  @IsString()
  @IsOptional()
  justificacion?: string;
}