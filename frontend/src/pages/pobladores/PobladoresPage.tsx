import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { Poblador } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil } from 'lucide-react';
import PobladorModal from './PobladorModal';

export default function PobladoresPage() {
    const [pobladores, setPobladores] = useState<Poblador[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [pobladorSeleccionado, setPobladorSeleccionado] = useState<Poblador | null>(null);

    const fetchPobladores = async () => {
        try {
            const res = await api.get('/pobladores');
            setPobladores(res.data);
        } catch {
            console.error('Error cargando pobladores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPobladores();
    }, []);

    const handleNuevo = () => {
        setPobladorSeleccionado(null);
        setModalOpen(true);
    };

    const handleEditar = (poblador: Poblador) => {
        setPobladorSeleccionado(poblador);
        setModalOpen(true);
    };

    const filtrados = pobladores.filter((p) =>
        `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    const calcularAntiguedad = (fecha: string) => {
        const inicio = new Date(fecha);
        const hoy = new Date();
        let años = hoy.getFullYear() - inicio.getFullYear();
        let meses = hoy.getMonth() - inicio.getMonth();
        let dias = hoy.getDate() - inicio.getDate();

        if (dias < 0) meses--;
        if (meses < 0) { años--; meses += 12; }

        const totalMeses = años * 12 + meses;

        if (totalMeses < 1) {
            const diffMs = hoy.getTime() - inicio.getTime();
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return `${diffDias} día${diffDias !== 1 ? 's' : ''}`;
        }
        if (años < 1) return `${meses} mes${meses !== 1 ? 'es' : ''}`;
        if (meses === 0) return `${años} año${años !== 1 ? 's' : ''}`;
        return `${años} año${años !== 1 ? 's' : ''}, ${meses} mes${meses !== 1 ? 'es' : ''}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pobladores</h1>
                    <p className="text-slate-400 text-sm mt-1">Gestión de pobladores de la comunidad</p>
                </div>
                <Button onClick={handleNuevo} className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
                    <Plus size={16} />
                    Nuevo poblador
                </Button>
            </div>

            {/* Buscador */}
            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Buscar por nombre o DNI..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 bg-white border-slate-200"
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Nombre</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">DNI</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Teléfono</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Sexo</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Inscripción</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Antigüedad</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Tipo</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Estado</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-400">Cargando...</td>
                            </tr>
                        ) : filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron pobladores</td>
                            </tr>
                        ) : (
                            filtrados.map((p) => (
                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {p.apellido}, {p.nombre}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{p.dni}</td>
                                    <td className="px-6 py-4 text-slate-500">{p.telefono ?? '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">{p.sexo ?? '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(p.createdAt).toLocaleDateString('es-PE')}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {calcularAntiguedad(p.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.tipo ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {p.tipo.nombre}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">Sin tipo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.activo
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-600'
                                                }`}>
                                                {p.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEditar(p)}
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

            <PobladorModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchPobladores}
                poblador={pobladorSeleccionado}
            />
        </div>
    );
}