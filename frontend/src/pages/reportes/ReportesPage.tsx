import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart2, Users, Calendar, Shield, Cherry, Banknote } from 'lucide-react';
import type { RolCatalogo } from '@/types';

type TabType = 'asistencia_fechas' | 'asistencia_poblador' | 'roles_historial' | 'ausencias' | 'stock_animales' | 'pagos_anio';

const tabs = [
    { id: 'asistencia_fechas', label: 'Asistencia por fechas', icon: Calendar },
    { id: 'asistencia_poblador', label: 'Asistencia por poblador', icon: Users },
    { id: 'roles_historial', label: 'Historial de roles', icon: Shield },
    { id: 'ausencias', label: 'Más ausencias', icon: BarChart2 },
    { id: 'stock_animales', label: 'Stock de animales', icon: Cherry },
    { id: 'pagos_anio', label: 'Pagos por año', icon: Banknote },
];

export default function ReportesPage() {
    const [tab, setTab] = useState<TabType>('asistencia_fechas');
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<any[]>([]);

    // Filtros
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tipo, setTipo] = useState('');
    const [pobladorId, setPobladorId] = useState('');
    const [rolId, setRolId] = useState('');
    const [roles, setRoles] = useState<RolCatalogo[]>([]);

    const buscar = async () => {
        setLoading(true);
        setResultados([]);
        try {
            let res;
            if (tab === 'asistencia_fechas') {
                res = await api.get('/reportes/asistencia/fechas', {
                    params: { fechaInicio, fechaFin, tipo: tipo || undefined },
                });
            } else if (tab === 'asistencia_poblador') {
                const pobladorRes = await api.get(`/pobladores/dni/${pobladorId}`);
                res = await api.get(`/reportes/asistencia/poblador/${pobladorRes.data.id}`);
            } else if (tab === 'roles_historial') {
                res = await api.get('/reportes/roles/historial', {
                    params: { fechaInicio, fechaFin, rolId: rolId || undefined },
                });
            } else if (tab === 'stock_animales') {
                const pobladorRes = await api.get(`/pobladores/dni/${pobladorId}`);
                res = await api.get(`/operaciones/stock/${pobladorRes.data.id}`);
            } else if (tab === 'pagos_anio') {
                res = await api.get(`/pagos/reporte/${pobladorId}`);
                setResultados([res.data]);
            }
            else {
                res = await api.get('/reportes/pobladores/ausencias');
            }
            setResultados(Array.isArray(res.data) ? res.data : [res.data]);
        } catch {
            console.error('Error en reporte');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get('/roles').then((res) => setRoles(res.data));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
                <p className="text-slate-400 text-sm mt-1">Consultas y estadísticas del sistema</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id as TabType); setResultados([]); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Icon size={15} />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-wrap gap-4 items-end">
                    {(tab === 'asistencia_fechas' || tab === 'roles_historial') && (
                        <>
                            <div className="space-y-1.5">
                                <Label>Fecha inicio</Label>
                                <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-40" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Fecha fin</Label>
                                <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-40" />
                            </div>
                        </>
                    )}

                    {tab === 'asistencia_fechas' && (
                        <div className="space-y-1.5">
                            <Label>Tipo</Label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm w-36"
                            >
                                <option value="">Todos</option>
                                <option value="faena">Faena</option>
                                <option value="asamblea">Asamblea</option>
                            </select>
                        </div>
                    )}

                    {tab === 'asistencia_poblador' && (
                        <div className="space-y-1.5">
                            <Label>DNI del poblador</Label>
                            <Input
                                value={pobladorId}
                                onChange={(e) => setPobladorId(e.target.value)}
                                placeholder="Ej: 12345678"
                                className="w-40"
                                maxLength={8}
                            />
                        </div>
                    )}

                    {tab === 'roles_historial' && (
                        <div className="space-y-1.5">
                            <Label>Rol (opcional)</Label>
                            <select
                                value={rolId}
                                onChange={(e) => setRolId(e.target.value)}
                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm w-48"
                            >
                                <option value="">Todos los roles</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {tab === 'stock_animales' && (
                        <div className="space-y-1.5">
                            <Label>DNI del poblador</Label>
                            <Input
                                value={pobladorId}
                                onChange={(e) => setPobladorId(e.target.value)}
                                placeholder="Ej: 12345678"
                                className="w-40"
                                maxLength={8}
                            />
                        </div>
                    )}

                    {tab === 'pagos_anio' && (
                        <div className="space-y-1.5">
                            <Label>Año ganadero</Label>
                            <Input
                                type="number"
                                value={pobladorId}
                                onChange={(e) => setPobladorId(e.target.value)}
                                placeholder="Ej: 2024"
                                className="w-36"
                            />
                            <p className="text-xs text-slate-400">
                                Período: junio {pobladorId} — mayo {+pobladorId + 1}
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={buscar}
                        disabled={loading}
                        className="bg-slate-900 hover:bg-slate-700 text-white"
                    >
                        {loading ? 'Buscando...' : 'Consultar'}
                    </Button>
                </div>
            </div>

            {/* Resultados */}
            {resultados.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-700">{resultados.length} resultado(s)</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {tab === 'asistencia_fechas' && resultados.map((r, i) => (
                            <div key={i} className="px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{r.titulo}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {new Date(r.fecha).toLocaleDateString('es-PE')} · {r.tipo} · {r.lugar ?? 'Sin lugar'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-emerald-600 font-medium">✓ {r.resumen.presentes} presentes</span>
                                    <span className="text-red-500 font-medium">✗ {r.resumen.ausentes} ausentes</span>
                                    <span className="text-amber-500 font-medium">~ {r.resumen.justificados} justificados</span>
                                </div>
                            </div>
                        ))}

                        {tab === 'asistencia_poblador' && resultados.map((r, i) => (
                            <div key={i} className="px-5 py-4">
                                <div className="flex gap-6 mb-3">
                                    <span className="text-emerald-600 text-sm font-medium">✓ {r.resumen?.presentes} presentes</span>
                                    <span className="text-red-500 text-sm font-medium">✗ {r.resumen?.ausentes} ausentes</span>
                                    <span className="text-amber-500 text-sm font-medium">~ {r.resumen?.justificados} justificados</span>
                                </div>
                                <div className="space-y-2">
                                    {r.detalle?.map((d: any, j: number) => (
                                        <div key={j} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700">{d.evento?.titulo}</span>
                                            <span className={`text-xs font-medium ${d.estado === 'presente' ? 'text-emerald-600' :
                                                d.estado === 'ausente' ? 'text-red-500' : 'text-amber-500'
                                                }`}>{d.estado}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {tab === 'roles_historial' && resultados.map((r, i) => (
                            <div key={i} className="px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {r.poblador?.apellido}, {r.poblador?.nombre}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {new Date(r.fechaInicio).toLocaleDateString('es-PE')} —{' '}
                                        {r.fechaFin ? new Date(r.fechaFin).toLocaleDateString('es-PE') : 'Vigente'}
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    {r.rol?.nombre}
                                </span>
                            </div>
                        ))}

                        {tab === 'ausencias' && resultados.map((r, i) => (
                            <div key={i} className="px-5 py-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-800">{r.apellido}, {r.nombre}</p>
                                <span className="text-red-500 text-sm font-medium">{r.totalausencias} ausencias</span>
                            </div>
                        ))}

                        {tab === 'stock_animales' && resultados.map((r, i) => (
                            <div key={i} className="px-5 py-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-800">{r.animalNombre}</p>
                                <span className="text-slate-700 font-medium text-sm">{r.cantidad} cabezas</span>
                            </div>
                        ))}

                        {tab === 'pagos_anio' && resultados.length > 0 && (() => {
                            const data = resultados[0];
                            return (
                                <div className="divide-y divide-slate-100">
                                    {/* Resumen global */}
                                    <div className="px-5 py-4 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Total pobladores</p>
                                            <p className="text-lg font-bold text-slate-800">{data.resumen.totalPobladores}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Total deuda</p>
                                            <p className="text-lg font-bold text-slate-800">S/ {data.resumen.totalGeneral.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Total cobrado</p>
                                            <p className="text-lg font-bold text-emerald-600">S/ {data.resumen.totalPagadoGeneral.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Total por cobrar</p>
                                            <p className="text-lg font-bold text-red-500">S/ {data.resumen.totalSaldoGeneral.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Detalle por poblador */}
                                    {data.detalle.map((r: any, i: number) => (
                                        <div key={i} className="px-5 py-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{r.poblador.nombre}</p>
                                                    <p className="text-xs text-slate-400">DNI: {r.poblador.dni} · Tipo: {r.poblador.tipo}</p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.estado === 'pagado' ? 'bg-emerald-100 text-emerald-700' :
                                                        r.estado === 'parcial' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-600'
                                                    }`}>
                                                    {r.estado}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-slate-100">
                                                            <th className="text-left px-3 py-2 text-slate-500">Animal</th>
                                                            <th className="text-left px-3 py-2 text-slate-500">Cantidad</th>
                                                            <th className="text-left px-3 py-2 text-slate-500">Precio unit.</th>
                                                            <th className="text-left px-3 py-2 text-slate-500">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {r.animales.map((a: any, j: number) => (
                                                            <tr key={j} className="border-b border-slate-100 last:border-0">
                                                                <td className="px-3 py-2 text-slate-700">{a.animalNombre}</td>
                                                                <td className="px-3 py-2 text-slate-700">{a.cantidad}</td>
                                                                <td className="px-3 py-2 text-slate-700">S/ {r.valorGanadoUnitario.toFixed(2)}</td>
                                                                <td className="px-3 py-2 font-medium text-slate-800">S/ {a.subtotal.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="flex items-center justify-between text-sm px-1">
                                                <div className="flex gap-4">
                                                    <span className="text-slate-500">Total: <span className="font-medium text-slate-800">S/ {r.totalMonto.toFixed(2)}</span></span>
                                                    <span className="text-slate-500">Pagado: <span className="font-medium text-emerald-600">S/ {r.totalPagado.toFixed(2)}</span></span>
                                                    <span className="text-slate-500">Saldo: <span className="font-medium text-red-500">S/ {r.saldo.toFixed(2)}</span></span>
                                                </div>
                                                <span className="text-xs text-slate-400">{r.abonos} abono(s)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                    </div>
                </div>
            )}
        </div>
    );
}