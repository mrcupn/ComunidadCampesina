import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MotivoOperacionService, CrearMotivoOperacionDto } from './motivo-operacion.service';

@UseGuards(JwtAuthGuard)
@Controller('motivo-operacion')
export class MotivoOperacionController {
  constructor(private motivoOperacionService: MotivoOperacionService) {}

  @Post()
  crear(@Body() dto: CrearMotivoOperacionDto, @Request() req) {
    return this.motivoOperacionService.crear(dto, req.user);
  }

  @Get()
  listar() {
    return this.motivoOperacionService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.motivoOperacionService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: Partial<CrearMotivoOperacionDto>, @Request() req) {
    return this.motivoOperacionService.actualizar(id, dto, req.user);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number, @Request() req) {
    return this.motivoOperacionService.eliminar(id, req.user);
  }
}