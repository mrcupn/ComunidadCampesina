import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { RolSistema } from './usuario.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Roles, RolesGuard } from '../auth/roles.guard';

export class CrearUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(RolSistema)
  @IsOptional()
  rol?: RolSistema;
}

export class ActualizarUsuarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsEnum(RolSistema)
  @IsOptional()
  rol?: RolSistema;

  @IsOptional()
  activo?: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  crear(@Body() dto: CrearUsuarioDto, @Request() req) {
    return this.usuariosService.crearUsuario(dto.nombre, dto.email, dto.password, dto.rol, req.user);
  }

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  actualizar(@Param('id') id: number, @Body() dto: ActualizarUsuarioDto, @Request() req) {
    return this.usuariosService.actualizar(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  eliminar(@Param('id') id: number, @Request() req) {
    return this.usuariosService.eliminar(id, req.user);
  }
}