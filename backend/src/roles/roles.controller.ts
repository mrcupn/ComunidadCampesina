import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService } from './roles.service';
import { CrearRolDto } from './dto/crear-rol.dto';
import { AsignarRolDto } from './dto/asignar-rol.dto';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  crearRol(@Body() dto: CrearRolDto, @Request() req) {
    return this.rolesService.crearRol(dto, req.user);
  }

  @Get()
  listarRoles() {
    return this.rolesService.listarRoles();
  }

  @Post('asignar')
  asignarRol(@Body() dto: AsignarRolDto, @Request() req) {
    return this.rolesService.asignarRol(dto, req.user.id, req.user);
  }

  @Patch('cerrar/:id')
  cerrarRol(@Param('id') id: number, @Request() req) {
    return this.rolesService.cerrarRol(id, req.user);
  }

  @Get('vigentes')
  rolesVigentes() {
    return this.rolesService.rolesVigentes();
  }

  @Get('historial/poblador/:pobladorId')
  historialPorPoblador(@Param('pobladorId') pobladorId: number) {
    return this.rolesService.historialPorPoblador(pobladorId);
  }

  @Get('historial/rol/:rolId')
  historialPorRol(@Param('rolId') rolId: number) {
    return this.rolesService.historialPorRol(rolId);
  }
}