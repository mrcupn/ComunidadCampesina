import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Evento, TipoEvento } from '../eventos/evento.entity';
import { Asistencia, EstadoAsistencia } from '../asistencias/asistencia.entity';
import { PobladorRol } from '../roles/poblador-rol.entity';
import { Poblador } from '../pobladores/poblador.entity';

@Injectable()
export class ReportesService {
    constructor(
        @InjectRepository(Evento)
        private eventoRepository: Repository<Evento>,
        @InjectRepository(Asistencia)
        private asistenciaRepository: Repository<Asistencia>,
        @InjectRepository(PobladorRol)
        private pobladorRolRepository: Repository<PobladorRol>,
        @InjectRepository(Poblador)
        private pobladorRepository: Repository<Poblador>,
    ) { }

    // Reporte de asistencia por rango de fechas y tipo de evento
    async reporteAsistenciaPorFechas(fechaInicio: string, fechaFin: string, tipo?: TipoEvento) {
        const where: any = {
            fecha: Between(new Date(fechaInicio), new Date(fechaFin)),
        };
        if (tipo) where.tipo = tipo;

        const eventos = await this.eventoRepository.find({
            where,
            relations: ['asistencias', 'asistencias.poblador'],
            order: { fecha: 'ASC' },
        });

        return eventos.map((evento) => {
            const total = evento.asistencias.length;
            const presentes = evento.asistencias.filter(a => a.estado === EstadoAsistencia.PRESENTE).length;
            const ausentes = evento.asistencias.filter(a => a.estado === EstadoAsistencia.AUSENTE).length;
            const justificados = evento.asistencias.filter(a => a.estado === EstadoAsistencia.JUSTIFICADO).length;

            return {
                id: evento.id,
                titulo: evento.titulo,
                tipo: evento.tipo,
                fecha: evento.fecha,
                lugar: evento.lugar,
                estado: evento.estado,
                resumen: { total, presentes, ausentes, justificados },
            };
        });
    }

    // Reporte de asistencia por poblador
    async reporteAsistenciaPorPoblador(pobladorId: number) {
        const asistencias = await this.asistenciaRepository.find({
            where: { poblador: { id: pobladorId } },
            relations: ['evento'],
            order: { createdAt: 'DESC' },
        });

        const total = asistencias.length;
        const presentes = asistencias.filter(a => a.estado === EstadoAsistencia.PRESENTE).length;
        const ausentes = asistencias.filter(a => a.estado === EstadoAsistencia.AUSENTE).length;
        const justificados = asistencias.filter(a => a.estado === EstadoAsistencia.JUSTIFICADO).length;

        return {
            resumen: { total, presentes, ausentes, justificados },
            detalle: asistencias,
        };
    }

    // Reporte de historial de roles por rango de fechas
    async reporteHistorialRoles(fechaInicio: string, fechaFin: string, rolId?: number) {
        const where: any = {
            fechaInicio: Between(new Date(fechaInicio), new Date(fechaFin)),
        };
        if (rolId) where.rol = { id: rolId };

        return this.pobladorRolRepository.find({
            where,
            relations: ['poblador', 'rol', 'asignadoPor'],
            order: { fechaInicio: 'DESC' },
        });
    }

    // Pobladores con mas ausencias
    async reportePobladoresMasAusencias() {
        return this.asistenciaRepository
            .createQueryBuilder('a')
            .select('p.id', 'pobladorId')
            .addSelect('p.nombre', 'nombre')
            .addSelect('p.apellido', 'apellido')
            .addSelect('COUNT(a.id)', 'totalAusencias')
            .innerJoin('a.poblador', 'p')
            .where('a.estado = :estado', { estado: EstadoAsistencia.AUSENTE })
            .groupBy('p.id')
            .addGroupBy('p.nombre')
            .addGroupBy('p.apellido')
            .orderBy('COUNT(a.id)', 'DESC')
            .getRawMany();
    }
}