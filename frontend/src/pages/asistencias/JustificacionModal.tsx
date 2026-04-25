import { useState } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
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
  eventoId: number;
  pobladorId: number;
  nombrePoblador: string;
}

export default function JustificacionModal({ open, onClose, onSuccess, eventoId, pobladorId, nombrePoblador }: Props) {
  const [justificacion, setJustificacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!justificacion.trim()) {
      setError('La justificación es obligatoria');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/asistencias', {
        eventoId,
        pobladorId,
        estado: 'justificado',
        justificacion,
      });
      onSuccess();
      onClose();
      setJustificacion('');
    } catch {
      setError('Error al guardar la justificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Justificación de inasistencia</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-500">
            Poblador: <span className="font-medium text-slate-800">{nombrePoblador}</span>
          </p>

          <div className="space-y-1.5">
            <Label>Motivo de justificación <span className="text-red-500">*</span></Label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Describe el motivo de la inasistencia..."
              rows={4}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Documento de respaldo <span className="text-slate-400 text-xs">(opcional)</span></Label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
            <p className="text-xs text-slate-400">PDF, JPG o PNG. Solo referencia local por ahora.</p>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="bg-slate-900 hover:bg-slate-700 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar justificación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}