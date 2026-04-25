import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PagosService, GenerarPagoDto, RegistrarAbonoDto } from './pagos.service';

@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
    constructor(private pagosService: PagosService) { }

    @Post('generar')
    generar(@Body() dto: GenerarPagoDto, @Request() req) {
        return this.pagosService.generarPago(dto, req.user.id, req.user);
    }

    @Post('abono')
    abonar(@Body() dto: RegistrarAbonoDto, @Request() req) {
        return this.pagosService.registrarAbono(dto, req.user.id, req.user);
    }

    @Get()
    listar() {
        return this.pagosService.listar();
    }

    @Get(':id')
    buscarPorId(@Param('id') id: number) {
        return this.pagosService.buscarPorId(id);
    }

    @Get('poblador/:pobladorId')
    listarPorPoblador(@Param('pobladorId') pobladorId: number) {
        return this.pagosService.listarPorPoblador(pobladorId);
    }

    @Get('reporte/:anio')
    reportePorAnio(@Param('anio') anio: number) {
        return this.pagosService.reportePorAnio(anio);
    }
}