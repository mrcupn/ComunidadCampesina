import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  operacion: any | null;
}

export default function DetalleOperacionModal({ open, onClose, operacion }: Props) {
  if (!operacion) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de operación #{operacion.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info general */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Poblador</span>
              <span className="font-medium text-slate-800">
                {operacion.poblador.apellido}, {operacion.poblador.nombre}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha</span>
              <span className="text-slate-700">
                {new Date(operacion.fecha).toLocaleDateString('es-PE', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registrado por</span>
              <span className="text-slate-700">{operacion.registradoPor?.nombre ?? '-'}</span>
            </div>
            {operacion.observacion && (
              <div className="flex justify-between">
                <span className="text-slate-500">Observación</span>
                <span className="text-slate-700">{operacion.observacion}</span>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="rounded-lg border border-slate-100 overflow-hidden w-full">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Animal</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Motivo</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Cantidad</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Mov.</th>
                </tr>
              </thead>
              <tbody>
                {operacion.detalles.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{d.animalNombre}</td>
                    <td className="px-4 py-2.5 text-slate-500">{d.motivoNombre}</td>
                    <td className="px-4 py-2.5 text-slate-700">{d.cantidad}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        d.tipoMovimiento === 'agregar'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {d.tipoMovimiento === 'agregar' ? '+ Ingreso' : '- Egreso'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}