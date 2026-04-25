import { useEffect, useState } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Plus, Cherry } from 'lucide-react';
import NuevaOperacionModal from './NuevaOperacionModal';
import DetalleOperacionModal from './DetalleOperacionModal';

export default function OperacionesPage() {
    const [operaciones, setOperaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    // estado
    const [operacionSeleccionada, setOperacionSeleccionada] = useState<any | null>(null);

    const fetchOperaciones = async () => {
        try {
            const res = await api.get('/operaciones');
            setOperaciones(res.data);
        } catch {
            console.error('Error cargando operaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperaciones();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Cherry size={22} className="text-slate-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Ganado</h1>
                        <p className="text-slate-400 text-sm mt-0.5">Operaciones de animales por poblador</p>
                    </div>
                </div>
                <Button onClick={() => setModalOpen(true)} className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
                    <Plus size={16} />
                    Nueva operación
                </Button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">#</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">Poblador</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">Fecha</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">Observación</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">Animales</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">Registrado por</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando...</td></tr>
                        ) : operaciones.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay operaciones registradas</td></tr>
                        ) : (
                            operaciones.map((op) => (
                                <tr key={op.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 text-slate-400">#{op.id}</td>
                                    <td className="px-5 py-3 font-medium text-slate-800">
                                        {op.poblador.apellido}, {op.poblador.nombre}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">
                                        {new Date(op.fecha).toLocaleDateString('es-PE')}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{op.observacion ?? '-'}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {op.detalles.map((d: any, i: number) => (
                                                <span
                                                    key={i}
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${d.tipoMovimiento === 'agregar'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-600'
                                                        }`}
                                                >
                                                    {d.tipoMovimiento === 'agregar' ? '+' : '-'}{d.cantidad} {d.animalNombre}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{op.registradoPor?.nombre ?? '-'}</td>
                                    <td className="px-5 py-3">
                                        <button
                                            onClick={() => setOperacionSeleccionada(op)}
                                            className="text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors"
                                        >
                                            Ver detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NuevaOperacionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchOperaciones}
            />

            <DetalleOperacionModal
                open={!!operacionSeleccionada}
                onClose={() => setOperacionSeleccionada(null)}
                operacion={operacionSeleccionada}
            />

        </div>


    );
}