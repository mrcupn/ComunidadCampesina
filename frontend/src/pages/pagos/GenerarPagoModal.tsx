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

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerarPagoModal({ open, onClose, onSuccess }: Props) {
  const [pobladores, setPobladores] = useState<any[]>([]);
  const [pobladorId, setPobladorId] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api.get('/pobladores').then((res) => {
        setPobladores(res.data.filter((p: any) => p.activo));
      });
      setPobladorId('');
      setAnio(new Date().getFullYear().toString());
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!pobladorId) { setError('Selecciona un poblador'); return; }
    if (!anio) { setError('Ingresa el año'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/pagos/generar', {
        pobladorId: +pobladorId,
        anio: +anio,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al generar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generar pago anual</DialogTitle>
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
            <Label>Año ganadero <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="2025"
              min={2000}
              max={2100}
            />
            <p className="text-xs text-slate-400">
              Período: junio {anio} — mayo {+anio + 1}
            </p>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="bg-slate-900 hover:bg-slate-700 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generando...' : 'Generar pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}