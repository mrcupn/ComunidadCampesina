import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Settings } from 'lucide-react';

type TabType = 'tipos' | 'animales' | 'motivos';

const tabs = [
  { id: 'tipos', label: 'Tipos de poblador' },
  { id: 'animales', label: 'Animales' },
  { id: 'motivos', label: 'Motivos de operación' },
];

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<TabType>('tipos');
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);

  // Campos del form
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valorGanado, setValorGanado] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('agregar');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const endpoint: Record<TabType, string> = {
    tipos: '/tipo-poblador',
    animales: '/animales',
    motivos: '/motivo-operacion',
  };

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint[tab]);
      setDatos(res.data);
    } catch {
      console.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
    setFormOpen(false);
    setEditando(null);
  }, [tab]);

  const abrirNuevo = () => {
    setEditando(null);
    setNombre('');
    setDescripcion('');
    setValorGanado('');
    setTipoMovimiento('agregar');
    setError('');
    setFormOpen(true);
  };

  const abrirEditar = (item: any) => {
    setEditando(item);
    setNombre(item.nombre);
    setDescripcion(item.descripcion ?? '');
    setValorGanado(item.valorGanado ?? '');
    setTipoMovimiento(item.tipoMovimiento ?? 'agregar');
    setError('');
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      const data: any = { nombre, descripcion: descripcion || undefined };
      if (tab === 'tipos') data.valorGanado = +valorGanado || 0;
      if (tab === 'motivos') data.tipoMovimiento = tipoMovimiento;

      if (editando) {
        await api.patch(`${endpoint[tab]}/${editando.id}`, data);
      } else {
        await api.post(endpoint[tab], data);
      }
      fetchDatos();
      setFormOpen(false);
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={22} className="text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-400 text-sm mt-0.5">Catálogos del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as TabType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Formulario inline */}
      {formOpen && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-sm font-medium text-slate-700">
            {editando ? 'Editar' : 'Nuevo'} {tabs.find(t => t.id === tab)?.label}
          </p>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Nombre <span className="text-red-500">*</span></Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="w-48" />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="w-64" />
            </div>
            {tab === 'tipos' && (
              <div className="space-y-1.5">
                <Label>Valor ganado</Label>
                <Input type="number" value={valorGanado} onChange={(e) => setValorGanado(e.target.value)} placeholder="0.00" className="w-32" />
              </div>
            )}
            {tab === 'motivos' && (
              <div className="space-y-1.5">
                <Label>Tipo movimiento</Label>
                <select
                  value={tipoMovimiento}
                  onChange={(e) => setTipoMovimiento(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm w-36"
                >
                  <option value="agregar">Agregar</option>
                  <option value="descontar">Descontar</option>
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saving} className="bg-slate-900 hover:bg-slate-700 text-white">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">{tabs.find(t => t.id === tab)?.label}</p>
          <Button onClick={abrirNuevo} className="bg-slate-900 hover:bg-slate-700 text-white gap-2 h-8 text-xs">
            <Plus size={14} />
            Nuevo
          </Button>
        </div>
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Nombre</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Descripción</th>
              {tab === 'tipos' && <th className="text-left px-5 py-3 text-slate-500 font-medium">Valor ganado</th>}
              {tab === 'motivos' && <th className="text-left px-5 py-3 text-slate-500 font-medium">Movimiento</th>}
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400">Cargando...</td></tr>
            ) : datos.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400">No hay registros</td></tr>
            ) : (
              datos.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{item.nombre}</td>
                  <td className="px-5 py-3 text-slate-500">{item.descripcion ?? '-'}</td>
                  {tab === 'tipos' && <td className="px-5 py-3 text-slate-500">S/ {item.valorGanado}</td>}
                  {tab === 'motivos' && (
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.tipoMovimiento === 'agregar' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {item.tipoMovimiento}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => abrirEditar(item)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}