import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PobladoresService } from './pobladores.service';
import { CrearPobladorDto } from './dto/crear-poblador.dto';

@UseGuards(JwtAuthGuard)
@Controller('pobladores')
export class PobladoresController {
  constructor(private pobladoresService: PobladoresService) {}

  @Post()
  crear(@Body() dto: CrearPobladorDto, @Request() req) {
    return this.pobladoresService.crear(dto, req.user);
  }

  @Get()
  listar() {
    return this.pobladoresService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.pobladoresService.buscarPorId(id);
  }

  @Get('dni/:dni')
  buscarPorDni(@Param('dni') dni: string) {
    return this.pobladoresService.buscarPorDni(dni);
  }

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: Partial<CrearPobladorDto>, @Request() req) {
    return this.pobladoresService.actualizar(id, dto, req.user);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number, @Request() req) {
    return this.pobladoresService.eliminar(id, req.user);
  }
}