import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';
import { TipoEvento } from '../eventos/evento.entity';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Get('asistencia/fechas')
  reporteAsistenciaPorFechas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('tipo') tipo?: TipoEvento,
  ) {
    return this.reportesService.reporteAsistenciaPorFechas(fechaInicio, fechaFin, tipo);
  }

  @Get('asistencia/poblador/:pobladorId')
  reporteAsistenciaPorPoblador(@Query('pobladorId') pobladorId: number) {
    return this.reportesService.reporteAsistenciaPorPoblador(pobladorId);
  }

  @Get('roles/historial')
  reporteHistorialRoles(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('rolId') rolId?: number,
  ) {
    return this.reportesService.reporteHistorialRoles(fechaInicio, fechaFin, rolId);
  }

  @Get('pobladores/ausencias')
  reportePobladoresMasAusencias() {
    return this.reportesService.reportePobladoresMasAusencias();
  }
}