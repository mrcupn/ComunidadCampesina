import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { AuditoriaService } from './auditoria.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get()
  listar(
    @Query('modulo') modulo?: string,
    @Query('accion') accion?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.auditoriaService.listar({ modulo, accion, fechaInicio, fechaFin });
  }
}