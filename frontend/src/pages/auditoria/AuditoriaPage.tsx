import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';

const accionStyles: Record<string, string> = {
  CREAR: 'bg-emerald-100 text-emerald-700',
  EDITAR: 'bg-blue-100 text-blue-700',
  ELIMINAR: 'bg-red-100 text-red-600',
  LOGIN: 'bg-violet-100 text-violet-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
  CONSULTAR: 'bg-amber-100 text-amber-700',
};

const modulos = [
  'auth', 'usuarios', 'pobladores', 'roles', 'eventos',
  'asistencias', 'operaciones', 'pagos', 'animales',
  'tipo-poblador', 'motivo-operacion',
];

const acciones = ['CREAR', 'EDITAR', 'ELIMINAR', 'LOGIN', 'LOGOUT', 'CONSULTAR'];

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modulo, setModulo] = useState('');
  const [accion, setAccion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const fetchAuditoria = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auditoria', {
        params: {
          modulo: modulo || undefined,
          accion: accion || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        },
      });
      setRegistros(res.data);
    } catch {
      console.error('Error cargando auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditoria();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck size={22} className="text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auditoría</h1>
          <p className="text-slate-400 text-sm mt-0.5">Registro de todas las acciones del sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <Label>Módulo</Label>
            <select
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm w-44"
            >
              <option value="">Todos</option>
              {modulos.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Acción</Label>
            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm w-36"
            >
              <option value="">Todas</option>
              {acciones.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha inicio</Label>
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-40" />
          </div>
          <div className="space-y-1.5">
            <Label>Fecha fin</Label>
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-40" />
          </div>
          <Button onClick={fetchAuditoria} disabled={loading} className="bg-slate-900 hover:bg-slate-700 text-white">
            {loading ? 'Cargando...' : 'Filtrar'}
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-700">{registros.length} registro(s)</p>
        </div>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Fecha</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Usuario</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Acción</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Módulo</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Descripción</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando...</td></tr>
            ) : registros.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay registros</td></tr>
            ) : (
              registros.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {new Date(r.createdAt).toLocaleString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">
                    {r.usuarioNombre ?? 'Sistema'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accionStyles[r.accion] ?? 'bg-slate-100 text-slate-600'}`}>
                      {r.accion}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.modulo}</td>
                  <td className="px-5 py-3 text-slate-600">{r.descripcion ?? '-'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{r.ip ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}