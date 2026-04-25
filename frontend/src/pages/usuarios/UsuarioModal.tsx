import { useEffect, useState } from 'react';
import type { Usuario } from '@/types';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  usuario?: Usuario | null;
}

interface FormData {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
}

const inicial: FormData = {
  nombre: '',
  email: '',
  password: '',
  rol: 'digitador',
  activo: true,
};

export default function UsuarioModal({ open, onClose, onSuccess, usuario }: Props) {
  const [form, setForm] = useState<FormData>(inicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        activo: usuario.activo,
      });
    } else {
      setForm(inicial);
    }
    setError('');
  }, [usuario, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (usuario) {
        const data: any = { nombre: form.nombre, rol: form.rol, activo: form.activo };
        await api.patch(`/usuarios/${usuario.id}`, data);
      } else {
        await api.post('/usuarios', {
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
        });
      }
      onSuccess();
      onClose();
    } catch {
      setError('Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nombre <span className="text-red-500">*</span></Label>
            <Input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" />
          </div>

          <div className="space-y-1.5">
            <Label>Correo electrónico <span className="text-red-500">*</span></Label>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              disabled={!!usuario}
              className={!!usuario ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
            />
          </div>

          {!usuario && (
            <div className="space-y-1.5">
              <Label>Contraseña <span className="text-red-500">*</span></Label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Rol <span className="text-red-500">*</span></Label>
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="digitador">Digitador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {usuario && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="activo"
                id="activo"
                checked={form.activo}
                onChange={handleChange}
                className="rounded border-slate-300"
              />
              <Label htmlFor="activo" className="cursor-pointer">Usuario activo</Label>
            </div>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="bg-slate-900 hover:bg-slate-700 text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}