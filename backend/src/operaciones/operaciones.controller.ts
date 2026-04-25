import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OperacionesService, CrearOperacionDto } from './operaciones.service';

@UseGuards(JwtAuthGuard)
@Controller('operaciones')
export class OperacionesController {
  constructor(private operacionesService: OperacionesService) {}

@Post()
crear(@Body() dto: CrearOperacionDto, @Request() req) {
  return this.operacionesService.crear(dto, req.user.id, req.user);
}

  @Get()
  listar() {
    return this.operacionesService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.operacionesService.buscarPorId(id);
  }

  @Get('poblador/:pobladorId')
  listarPorPoblador(@Param('pobladorId') pobladorId: number) {
    return this.operacionesService.listarPorPoblador(pobladorId);
  }

  @Get('stock/:pobladorId')
  stockPorPoblador(@Param('pobladorId') pobladorId: number) {
    return this.operacionesService.stockPorPoblador(pobladorId);
  }
}