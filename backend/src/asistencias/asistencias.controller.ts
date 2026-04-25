import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AsistenciasService } from './asistencias.service';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';

@UseGuards(JwtAuthGuard)
@Controller('asistencias')
export class AsistenciasController {
  constructor(private asistenciasService: AsistenciasService) {}

  @Post()
  registrar(@Body() dto: RegistrarAsistenciaDto, @Request() req) {
    return this.asistenciasService.registrar(dto, req.user.id, req.user);
  }

  @Get('evento/:eventoId')
  listarPorEvento(@Param('eventoId') eventoId: number) {
    return this.asistenciasService.listarPorEvento(eventoId);
  }

  @Get('poblador/:pobladorId')
  listarPorPoblador(@Param('pobladorId') pobladorId: number) {
    return this.asistenciasService.listarPorPoblador(pobladorId);
  }

  @Get('evento/:eventoId/resumen')
  resumenEvento(@Param('eventoId') eventoId: number) {
    return this.asistenciasService.resumenEvento(eventoId);
  }
}