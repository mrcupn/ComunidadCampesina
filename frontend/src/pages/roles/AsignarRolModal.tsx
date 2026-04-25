import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { RolCatalogo, Poblador } from '@/types';
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

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: RolCatalogo[];
}

export default function AsignarRolModal({ open, onClose, onSuccess, roles }: Props) {
  const [pobladores, setPobladores] = useState<Poblador[]>([]);
  const [pobladorId, setPobladorId] = useState('');
  const [rolId, setRolId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api.get('/pobladores').then((res) => {
        setPobladores(res.data.filter((p: Poblador) => p.activo));
      });
      setFechaInicio(new Date().toISOString().slice(0, 10));
      setPobladorId('');
      setRolId('');
      setObservacion('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!pobladorId || !rolId || !fechaInicio) {
      setError('Poblador, rol y fecha son obligatorios');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/roles/asignar', {
        pobladorId: +pobladorId,
        rolId: +rolId,
        fechaInicio,
        observacion: observacion || undefined,
      });
      onSuccess();
      onClose();
    } catch {
      setError('Error al asignar el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar rol</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
            <Label>Rol <span className="text-red-500">*</span></Label>
            <select
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Seleccionar rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Fecha de inicio <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Observación <span className="text-slate-400 text-xs">(opcional)</span></Label>
            <Input
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: Elegido en asamblea ordinaria"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="bg-slate-900 hover:bg-slate-700 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}