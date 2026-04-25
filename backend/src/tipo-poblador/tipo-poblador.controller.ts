import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TipoPobladorService, CrearTipoPobladorDto } from './tipo-poblador.service';

@UseGuards(JwtAuthGuard)
@Controller('tipo-poblador')
export class TipoPobladorController {
  constructor(private tipoPobladorService: TipoPobladorService) {}

  @Post()
  crear(@Body() dto: CrearTipoPobladorDto, @Request() req) {
    return this.tipoPobladorService.crear(dto, req.user);
  }

  @Get()
  listar() {
    return this.tipoPobladorService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.tipoPobladorService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: Partial<CrearTipoPobladorDto>, @Request() req) {
    return this.tipoPobladorService.actualizar(id, dto, req.user);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number, @Request() req) {
    return this.tipoPobladorService.eliminar(id, req.user);
  }
}