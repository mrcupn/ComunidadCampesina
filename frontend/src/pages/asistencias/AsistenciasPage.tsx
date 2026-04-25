import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { Evento, Poblador, Asistencia } from '@/types';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import JustificacionModal from './JustificacionModal';

const estadoConfig = {
    presente: { label: 'Presente', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
    ausente: { label: 'Ausente', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
    justificado: { label: 'Justificado', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
};

export default function AsistenciasPage() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [pobladores, setPobladores] = useState<Poblador[]>([]);
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);

    const [justificacionModal, setJustificacionModal] = useState<{
        open: boolean;
        pobladorId: number;
        nombrePoblador: string;
    }>({ open: false, pobladorId: 0, nombrePoblador: '' });

    useEffect(() => {
        const fetchData = async () => {
            const [eventosRes, pobladoresRes] = await Promise.all([
                api.get('/eventos'),
                api.get('/pobladores'),
            ]);
            setEventos(eventosRes.data);
            setPobladores(pobladoresRes.data.filter((p: Poblador) => p.activo));
        };
        fetchData();
    }, []);

    const seleccionarEvento = async (evento: Evento) => {
        setEventoSeleccionado(evento);
        setLoading(true);
        try {
            const res = await api.get(`/asistencias/evento/${evento.id}`);
            setAsistencias(res.data);
        } catch {
            setAsistencias([]);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoPoblador = (pobladorId: number) => {
        const asistencia = asistencias.find((a) => a.poblador.id === pobladorId);
        return asistencia?.estado ?? null;
    };

    const registrarAsistencia = async (poblador: Poblador, estado: string) => {
        if (!eventoSeleccionado) return;

        if (estado === 'justificado') {
            setJustificacionModal({
                open: true,
                pobladorId: poblador.id,
                nombrePoblador: `${poblador.apellido}, ${poblador.nombre}`,
            });
            return;
        }

        try {
            await api.post('/asistencias', {
                eventoId: eventoSeleccionado.id,
                pobladorId: poblador.id,
                estado,
            });
            const res = await api.get(`/asistencias/evento/${eventoSeleccionado.id}`);
            setAsistencias(res.data);
        } catch {
            console.error('Error registrando asistencia');
        }
    };

    const estadoBadge: Record<string, string> = {
        programado: 'bg-blue-100 text-blue-700',
        en_curso: 'bg-amber-100 text-amber-700',
        finalizado: 'bg-slate-100 text-slate-500',
        cancelado: 'bg-red-100 text-red-600',
    };

    const filtrados = pobladores.filter((p) =>
        `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    const resumen = {
        presentes: asistencias.filter((a) => a.estado === 'presente').length,
        ausentes: asistencias.filter((a) => a.estado === 'ausente').length,
        justificados: asistencias.filter((a) => a.estado === 'justificado').length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Asistencias</h1>
                <p className="text-slate-400 text-sm mt-1">Registra la asistencia por evento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Lista de eventos */}
                <div className="md:col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Seleccionar evento</p>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                        {eventos.map((e) => {
                            const bloqueado = e.estado !== 'en_curso' && e.estado !== 'finalizado';
                            return (
                                <button
                                    key={e.id}
                                    onClick={() => !bloqueado && seleccionarEvento(e)}
                                    className={`w-full text-left px-4 py-3 transition-colors ${bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
                                        } ${eventoSeleccionado?.id === e.id ? 'bg-slate-100' : ''}`}
                                >
                                    <p className="text-sm font-medium text-slate-800 truncate">{e.titulo}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-slate-400">
                                            {new Date(e.fecha).toLocaleDateString('es-PE')} · {e.tipo}
                                        </p>
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${estadoBadge[e.estado]}`}>
                                            {e.estado.replace('_', ' ')}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Lista de pobladores */}
                <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    {!eventoSeleccionado ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm py-20">
                            Selecciona un evento para registrar asistencia
                        </div>
                    ) : (
                        <>
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
                                <p className="text-sm font-medium text-slate-700 truncate">{eventoSeleccionado.titulo}</p>
                                <div className="flex items-center gap-3 text-xs shrink-0">
                                    <span className="text-emerald-600 font-medium">✓ {resumen.presentes}</span>
                                    <span className="text-red-500 font-medium">✗ {resumen.ausentes}</span>
                                    <span className="text-amber-500 font-medium">~ {resumen.justificados}</span>
                                </div>
                            </div>

                            <div className="px-4 py-3 border-b border-slate-100">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        placeholder="Buscar poblador..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="pl-8 h-8 text-sm bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                                {loading ? (
                                    <div className="text-center py-10 text-slate-400 text-sm">Cargando...</div>
                                ) : (
                                    filtrados.map((p) => {
                                        const estado = getEstadoPoblador(p.id);

                                        const soloLectura = eventoSeleccionado?.estado === 'finalizado';
                                        return (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{p.apellido}, {p.nombre}</p>
                                                    <p className="text-xs text-slate-400">{p.dni}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {soloLectura ? (
                                                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${estado ? estadoConfig[estado].bg + ' ' + estadoConfig[estado].color : 'border-slate-200 text-slate-400'
                                                            }`}>
                                                            {estado ? estadoConfig[estado].label : 'Sin registro'}
                                                        </span>
                                                    ) : (
                                                        (['presente', 'ausente', 'justificado'] as const).map((e) => {
                                                            const config = estadoConfig[e];
                                                            const Icon = config.icon;
                                                            const activo = estado === e;
                                                            return (
                                                                <button
                                                                    key={e}
                                                                    onClick={() => registrarAsistencia(p, e)}
                                                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${activo ? config.bg + ' ' + config.color : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                                                        }`}
                                                                >
                                                                    <Icon size={13} />
                                                                    {config.label}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <JustificacionModal
                open={justificacionModal.open}
                onClose={() => setJustificacionModal({ ...justificacionModal, open: false })}
                onSuccess={async () => {
                    const res = await api.get(`/asistencias/evento/${eventoSeleccionado!.id}`);
                    setAsistencias(res.data);
                }}
                eventoId={eventoSeleccionado?.id ?? 0}
                pobladorId={justificacionModal.pobladorId}
                nombrePoblador={justificacionModal.nombrePoblador}
            />

        </div>

    );

}

