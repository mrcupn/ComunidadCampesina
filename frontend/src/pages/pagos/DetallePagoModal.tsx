import { useState } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  pago: any | null;
  onSuccess: () => void;
}

const estadoStyles: Record<string, string> = {
  pendiente: 'bg-red-100 text-red-600',
  parcial: 'bg-amber-100 text-amber-700',
  pagado: 'bg-emerald-100 text-emerald-700',
};

export default function DetallePagoModal({ open, onClose, pago, onSuccess }: Props) {
  const [monto, setMonto] = useState('');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!pago) return null;

  const saldo = Number(pago.totalMonto) - Number(pago.totalPagado);

  const handleAbono = async () => {
    if (!monto || +monto <= 0) { setError('Ingresa un monto válido'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/pagos/abono', {
        pagoId: pago.id,
        monto: +monto,
        observacion: observacion || undefined,
      });
      setMonto('');
      setObservacion('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al registrar abono');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de pago #{pago.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info general */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Poblador</span>
              <span className="font-medium text-slate-800">
                {pago.poblador.apellido}, {pago.poblador.nombre}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Año ganadero</span>
              <span className="text-slate-700">junio {pago.anio} — mayo {pago.anio + 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total animales</span>
              <span className="text-slate-700">{pago.totalAnimales} cabezas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Precio unitario</span>
              <span className="text-slate-700">S/ {Number(pago.valorGanadoUnitario).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total a pagar</span>
              <span className="font-medium text-slate-800">S/ {Number(pago.totalMonto).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total pagado</span>
              <span className="font-medium text-emerald-600">S/ {Number(pago.totalPagado).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo</span>
              <span className="font-medium text-red-500">S/ {saldo.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoStyles[pago.estado]}`}>
                {pago.estado}
              </span>
            </div>
          </div>

          {/* Detalle animales */}
          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-500">Animales registrados</p>
            </div>
            <div className="divide-y divide-slate-50">
              {pago.detalles?.map((d: any, i: number) => (
                <div key={i} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-slate-700">{d.animalNombre}</span>
                  <span className="font-medium text-slate-800">{d.cantidad} cabezas</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de abonos */}
          {pago.abonos?.length > 0 && (
            <div className="rounded-lg border border-slate-100 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-500">Historial de abonos</p>
              </div>
              <div className="divide-y divide-slate-50">
                {pago.abonos.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2 text-sm">
                    <div>
                      <p className="text-slate-700">S/ {Number(a.monto).toFixed(2)}</p>
                      {a.observacion && <p className="text-xs text-slate-400">{a.observacion}</p>}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(a.fecha).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registrar abono */}
          {pago.estado !== 'pagado' && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700">Registrar abono</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Monto <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder={`Máx. S/ ${saldo.toFixed(2)}`}
                    min={0.01}
                    max={saldo}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Observación</Label>
                  <Input
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <Button
                className="w-full bg-slate-900 hover:bg-slate-700 text-white"
                onClick={handleAbono}
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar abono'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}