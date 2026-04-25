import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { Evento } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar } from 'lucide-react';
import EventoModal from './EventoModal';

const estadoStyles: Record<string, string> = {
  programado: 'bg-blue-100 text-blue-700',
  en_curso: 'bg-amber-100 text-amber-700',
  finalizado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-red-100 text-red-600',
};

const tipoStyles: Record<string, string> = {
  faena: 'bg-violet-100 text-violet-700',
  asamblea: 'bg-slate-100 text-slate-700',
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  const fetchEventos = async () => {
    try {
      const res = await api.get('/eventos');
      setEventos(res.data);
    } catch {
      console.error('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleNuevo = () => {
    setEventoSeleccionado(null);
    setModalOpen(true);
  };

  const handleEditar = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setModalOpen(true);
  };

  const filtrados = eventos.filter((e) =>
    `${e.titulo} ${e.tipo} ${e.lugar ?? ''}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <p className="text-slate-400 text-sm mt-1">Faenas y asambleas de la comunidad</p>
        </div>
        <Button onClick={handleNuevo} className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
          <Plus size={16} />
          Nuevo evento
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por título o lugar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9 bg-white border-slate-200"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Título</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Tipo</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Fecha</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Lugar</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Estado</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">Cargando...</td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron eventos</td>
              </tr>
            ) : (
              filtrados.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-slate-400" />
                      {e.titulo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoStyles[e.tipo]}`}>
                      {e.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(e.fecha).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{e.lugar ?? '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoStyles[e.estado]}`}>
                      {e.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditar(e)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EventoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchEventos}
        evento={eventoSeleccionado}
      />
    </div>
  );
}