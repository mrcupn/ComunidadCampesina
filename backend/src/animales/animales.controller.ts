import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnimalesService, CrearAnimalDto } from './animales.service';

@UseGuards(JwtAuthGuard)
@Controller('animales')
export class AnimalesController {
  constructor(private animalesService: AnimalesService) {}

  @Post()
  crear(@Body() dto: CrearAnimalDto, @Request() req) {
    return this.animalesService.crear(dto, req.user);
  }

  @Get()
  listar() {
    return this.animalesService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.animalesService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: Partial<CrearAnimalDto>, @Request() req) {
    return this.animalesService.actualizar(id, dto, req.user);
  }

  @Delete(':id')
  eliminar(@Param('id') id: number, @Request() req) {
    return this.animalesService.eliminar(id, req.user);
  }
}