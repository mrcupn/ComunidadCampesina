import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

interface Detalle {
  animalNombre: string;
  motivoNombre: string;
  tipoMovimiento: string;
  cantidad: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NuevaOperacionModal({ open, onClose, onSuccess }: Props) {
  const [pobladores, setPobladores] = useState<any[]>([]);
  const [animales, setAnimales] = useState<any[]>([]);
  const [motivos, setMotivos] = useState<any[]>([]);
  const [pobladorId, setPobladorId] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      Promise.all([
        api.get('/pobladores'),
        api.get('/animales'),
        api.get('/motivo-operacion'),
      ]).then(([p, a, m]) => {
        setPobladores(p.data.filter((x: any) => x.activo));
        setAnimales(a.data);
        setMotivos(m.data);
      });
      setFecha(new Date().toISOString().slice(0, 16));
      setPobladorId('');
      setObservacion('');
      setDetalles([]);
      setError('');
    }
  }, [open]);

  const agregarDetalle = () => {
    setDetalles([...detalles, {
      animalNombre: animales[0]?.nombre ?? '',
      motivoNombre: motivos[0]?.nombre ?? '',
      tipoMovimiento: motivos[0]?.tipoMovimiento ?? 'agregar',
      cantidad: 1,
    }]);
  };

  const actualizarDetalle = (index: number, campo: string, valor: string | number) => {
    const nuevos = [...detalles];
    if (campo === 'motivoNombre') {
      const motivo = motivos.find((m) => m.nombre === valor);
      nuevos[index] = {
        ...nuevos[index],
        motivoNombre: valor as string,
        tipoMovimiento: motivo?.tipoMovimiento ?? 'agregar',
      };
    } else {
      nuevos[index] = { ...nuevos[index], [campo]: valor };
    }
    setDetalles(nuevos);
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!pobladorId) { setError('Selecciona un poblador'); return; }
    if (detalles.length === 0) { setError('Agrega al menos un animal'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/operaciones', {
        pobladorId: +pobladorId,
        fecha,
        observacion: observacion || undefined,
        detalles,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva operación de ganado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cabecera */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Poblador <span className="text-red-500">*</span></Label>
              <select
                value={pobladorId}
                onChange={(e) => setPobladorId(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Seleccionar poblador</option>
                {pobladores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.apellido}, {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha <span className="text-red-500">*</span></Label>
              <Input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observación</Label>
            <Input value={observacion} onChange={(e) => setObservacion(e.target.value)} placeholder="Observación general de la operación" />
          </div>

          {/* Detalles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Animales <span className="text-red-500">*</span></Label>
              <button
                onClick={agregarDetalle}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Plus size={13} />
                Agregar animal
              </button>
            </div>

            {detalles.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4 border border-dashed border-slate-200 rounded-lg">
                No hay animales agregados
              </p>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-2">
                  <p className="col-span-4 text-xs text-slate-400 font-medium">Animal</p>
                  <p className="col-span-4 text-xs text-slate-400 font-medium">Motivo</p>
                  <p className="col-span-2 text-xs text-slate-400 font-medium">Cantidad</p>
                  <p className="col-span-2 text-xs text-slate-400 font-medium">Mov.</p>
                </div>
                {detalles.map((d, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2">
                    <div className="col-span-4">
                      <select
                        value={d.animalNombre}
                        onChange={(e) => actualizarDetalle(i, 'animalNombre', e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                      >
                        {animales.map((a) => (
                          <option key={a.id} value={a.nombre}>{a.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <select
                        value={d.motivoNombre}
                        onChange={(e) => actualizarDetalle(i, 'motivoNombre', e.target.value)}
                        className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                      >
                        {motivos.map((m) => (
                          <option key={m.id} value={m.nombre}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={d.cantidad}
                        onChange={(e) => actualizarDetalle(i, 'cantidad', +e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <span className={`text-xs font-medium ${
                        d.tipoMovimiento === 'agregar' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {d.tipoMovimiento === 'agregar' ? '+' : '-'}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => eliminarDetalle(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="bg-slate-900 hover:bg-slate-700 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar operación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}