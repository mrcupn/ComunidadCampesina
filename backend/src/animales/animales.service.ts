import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from './animal.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AccionAuditoria } from '../auditoria/auditoria.entity';
import { IsString, IsOptional } from 'class-validator';

export class CrearAnimalDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

@Injectable()
export class AnimalesService {
  constructor(
    @InjectRepository(Animal)
    private animalRepository: Repository<Animal>,
    private auditoriaService: AuditoriaService,
  ) {}

  async crear(dto: CrearAnimalDto, usuarioActual?: any) {
    const animal = this.animalRepository.create(dto);
    const resultado = await this.animalRepository.save(animal);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.CREAR,
      modulo: 'animales',
      descripcion: `Creó el animal: ${dto.nombre}`,
    });
    return resultado;
  }

  async listar() {
    return this.animalRepository.find({ where: { activo: true } });
  }

  async buscarPorId(id: number) {
    const animal = await this.animalRepository.findOne({ where: { id } });
    if (!animal) throw new NotFoundException('Animal no encontrado');
    return animal;
  }

  async actualizar(id: number, dto: Partial<CrearAnimalDto>, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.animalRepository.update(id, dto);
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.EDITAR,
      modulo: 'animales',
      descripcion: `Editó el animal ID: ${id}`,
    });
    return this.buscarPorId(id);
  }

  async eliminar(id: number, usuarioActual?: any) {
    await this.buscarPorId(id);
    await this.animalRepository.update(id, { activo: false });
    await this.auditoriaService.registrar({
      usuarioId: usuarioActual?.id,
      usuarioNombre: usuarioActual?.nombre,
      accion: AccionAuditoria.ELIMINAR,
      modulo: 'animales',
      descripcion: `Desactivó el animal ID: ${id}`,
    });
    return { message: 'Animal desactivado correctamente' };
  }
}