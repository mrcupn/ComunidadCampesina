import { useEffect, useState } from 'react';
import api from '@/api/axios';
import type { RolCatalogo, PobladorRol } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import RolModal from './RolModal';
import AsignarRolModal from './AsignarRolModal';

export default function RolesPage() {
  const [roles, setRoles] = useState<RolCatalogo[]>([]);
  const [vigentes, setVigentes] = useState<PobladorRol[]>([]);
  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [asignarModalOpen, setAsignarModalOpen] = useState(false);

  const fetchData = async () => {
    const [rolesRes, vigentesRes] = await Promise.all([
      api.get('/roles'),
      api.get('/roles/vigentes'),
    ]);
    setRoles(rolesRes.data);
    setVigentes(vigentesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
          <p className="text-slate-400 text-sm mt-1">Catálogo y asignaciones de roles</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setRolModalOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus size={16} />
            Nuevo rol
          </Button>
          <Button
            onClick={() => setAsignarModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-700 text-white gap-2"
          >
            <Shield size={16} />
            Asignar rol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Catálogo de roles */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">Catálogo de roles</p>
          </div>
          <div className="divide-y divide-slate-50">
            {roles.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No hay roles registrados</p>
            ) : (
              roles.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Shield size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.nombre}</p>
                    {r.descripcion && (
                      <p className="text-xs text-slate-400">{r.descripcion}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Roles vigentes */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">Roles vigentes</p>
          </div>
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Poblador</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Desde</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vigentes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No hay roles vigentes</td>
                </tr>
              ) : (
                vigentes.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {v.poblador.apellido}, {v.poblador.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {v.rol.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(v.fechaInicio).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          await api.patch(`/roles/cerrar/${v.id}`);
                          fetchData();
                        }}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Cerrar rol
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RolModal
        open={rolModalOpen}
        onClose={() => setRolModalOpen(false)}
        onSuccess={fetchData}
      />

      <AsignarRolModal
        open={asignarModalOpen}
        onClose={() => setAsignarModalOpen(false)}
        onSuccess={fetchData}
        roles={roles}
      />
    </div>
  );
}