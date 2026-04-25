import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Plus, Banknote } from 'lucide-react';
import GenerarPagoModal from './GenerarPagoModal';
import DetallePagoModal from './DetallePagoModal';

const estadoStyles: Record<string, string> = {
  pendiente: 'bg-red-100 text-red-600',
  parcial: 'bg-amber-100 text-amber-700',
  pagado: 'bg-emerald-100 text-emerald-700',
};

export default function PagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generarOpen, setGenerarOpen] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<any | null>(null);

  const fetchPagos = async () => {
    try {
      const res = await api.get('/pagos');
      setPagos(res.data);
    } catch {
      console.error('Error cargando pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote size={22} className="text-slate-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pagos de ganado</h1>
            <p className="text-slate-400 text-sm mt-0.5">Cobros anuales por tenencia de animales</p>
          </div>
        </div>
        <Button onClick={() => setGenerarOpen(true)} className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
          <Plus size={16} />
          Generar pago
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-slate-500 font-medium">#</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Poblador</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Año</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Animales</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Precio unit.</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Total</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Pagado</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Saldo</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Estado</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-10 text-slate-400">Cargando...</td></tr>
            ) : pagos.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-slate-400">No hay pagos registrados</td></tr>
            ) : (
              pagos.map((p) => {
                const saldo = Number(p.totalMonto) - Number(p.totalPagado);
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-400">#{p.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {p.poblador.apellido}, {p.poblador.nombre}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{p.anio}</td>
                    <td className="px-5 py-3 text-slate-500">{p.totalAnimales}</td>
                    <td className="px-5 py-3 text-slate-500">S/ {Number(p.valorGanadoUnitario).toFixed(2)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">S/ {Number(p.totalMonto).toFixed(2)}</td>
                    <td className="px-5 py-3 text-emerald-600 font-medium">S/ {Number(p.totalPagado).toFixed(2)}</td>
                    <td className="px-5 py-3 text-red-500 font-medium">S/ {saldo.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoStyles[p.estado]}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setPagoSeleccionado(p)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <GenerarPagoModal
        open={generarOpen}
        onClose={() => setGenerarOpen(false)}
        onSuccess={fetchPagos}
      />

      <DetallePagoModal
        open={!!pagoSeleccionado}
        onClose={() => setPagoSeleccionado(null)}
        pago={pagoSeleccionado}
        onSuccess={fetchPagos}
      />
    </div>
  );
}