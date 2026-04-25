import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class AsignarRolDto {
  @IsNumber()
  pobladorId: number;

  @IsNumber()
  rolId: number;

  @IsDateString()
  fechaInicio: Date;

  @IsString()
  @IsOptional()
  observacion?: string;
}