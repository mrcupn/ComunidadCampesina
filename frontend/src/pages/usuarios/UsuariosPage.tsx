import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { Usuario } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil } from 'lucide-react';
import UsuarioModal from './UsuarioModal';
import { useAuthStore } from '@/store/authStore';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const usuario = useAuthStore((s) => s.usuario);
    const esAdmin = usuario?.rol === 'admin';

    const fetchUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch {
            console.error('Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleNuevo = () => {
        setUsuarioSeleccionado(null);
        setModalOpen(true);
    };

    const handleEditar = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalOpen(true);
    };

    const filtrados = usuarios.filter((u) =>
        `${u.nombre} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
                    <p className="text-slate-400 text-sm mt-1">Gestión de usuarios del sistema</p>
                </div>
                {esAdmin && (
                    <Button onClick={handleNuevo} className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
                        <Plus size={16} />
                        Nuevo usuario
                    </Button>
                )}
            </div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Buscar por nombre o correo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 bg-white border-slate-200"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Nombre</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Correo</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Rol</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Estado</th>
                            <th className="text-left px-6 py-3 text-slate-500 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-400">Cargando...</td>
                            </tr>
                        ) : filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron usuarios</td>
                            </tr>
                        ) : (
                            filtrados.map((u) => (
                                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{u.nombre}</td>
                                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.rol === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {esAdmin && (
                                            <button
                                                onClick={() => handleEditar(u)}
                                                className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors"
                                            >
                                                <Pencil size={13} />
                                                Editar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <UsuarioModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchUsuarios}
                usuario={usuarioSeleccionado}
            />
        </div>
    );
}