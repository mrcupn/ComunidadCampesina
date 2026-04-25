export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface TipoPoblador {
  id: number;
  nombre: string;
  descripcion?: string;
  valorGanado: number;
  activo: boolean;
}

export interface Poblador {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  telefono?: string;
  fechaNacimiento?: string;
  sexo?: 'M' | 'F';
  activo: boolean;
  tipo?: TipoPoblador;
  createdAt: string;
}

export interface RolCatalogo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface PobladorRol {
  id: number;
  poblador: Poblador;
  rol: RolCatalogo;
  fechaInicio: string;
  fechaFin?: string;
  observacion?: string;
}

export interface Evento {
  id: number;
  tipo: 'faena' | 'asamblea';
  titulo: string;
  descripcion?: string;
  fecha: string;
  lugar?: string;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  createdAt: string;
}

export interface Asistencia {
  id: number;
  evento: Evento;
  poblador: Poblador;
  estado: 'presente' | 'ausente' | 'justificado';
  justificacion?: string;
  horaRegistro?: string;
}