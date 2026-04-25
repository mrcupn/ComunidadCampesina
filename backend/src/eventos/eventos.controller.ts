import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventosService } from './eventos.service';
import { CrearEventoDto } from './dto/crear-evento.dto';
import { EstadoEvento, TipoEvento } from './evento.entity';

@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(private eventosService: EventosService) {}

  @Post()
  crear(@Body() dto: CrearEventoDto, @Request() req) {
    return this.eventosService.crear(dto, req.user.id, req.user);
  }

  @Get()
  listar(@Query('tipo') tipo?: TipoEvento) {
    return this.eventosService.listar(tipo);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.eventosService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: Partial<CrearEventoDto>, @Request() req) {
    return this.eventosService.actualizar(id, dto, req.user);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: number, @Body('estado') estado: EstadoEvento, @Request() req) {
    return this.eventosService.cambiarEstado(id, estado, req.user);
  }
}