import { useEffect, useState } from 'react';
import type { Poblador, TipoPoblador } from '@/types';
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
    poblador?: Poblador | null;
}

interface FormData {
    dni: string;
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string;
    fechaNacimiento: string;
    sexo: string;
}

const inicial: FormData = {
    dni: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    fechaNacimiento: '',
    sexo: '',
};

export default function PobladorModal({ open, onClose, onSuccess, poblador }: Props) {
    const [form, setForm] = useState<FormData>(inicial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tipos, setTipos] = useState<TipoPoblador[]>([]);
    const [tipoId, setTipoId] = useState('');

    useEffect(() => {
        api.get('/tipo-poblador').then((res) => setTipos(res.data));

        if (poblador) {
            setForm({
                dni: poblador.dni,
                nombre: poblador.nombre,
                apellido: poblador.apellido,
                direccion: poblador.direccion ?? '',
                telefono: poblador.telefono ?? '',
                fechaNacimiento: poblador.fechaNacimiento ?? '',
                sexo: poblador.sexo ?? '',
            });
            setTipoId(poblador.tipo ? String(poblador.tipo.id) : '');
        } else {
            setForm(inicial);
            setTipoId('');
        }
        setError('');
    }, [poblador, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const data = {
                ...form,
                sexo: form.sexo || undefined,
                direccion: form.direccion || undefined,
                telefono: form.telefono || undefined,
                fechaNacimiento: form.fechaNacimiento || undefined,
                tipoId: tipoId ? +tipoId : undefined,
            };

            if (poblador) {
                await api.patch(`/pobladores/${poblador.id}`, data);
            } else {
                await api.post('/pobladores', data);
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
            <DialogContent className="w-[95vw] max-w-lg sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{poblador ? 'Editar poblador' : 'Nuevo poblador'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>DNI</Label>
                            <Input
                                name="dni"
                                value={form.dni}
                                onChange={handleChange}
                                placeholder="12345678"
                                maxLength={8}
                                disabled={!!poblador}
                                className={!!poblador ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Sexo</Label>
                            <select
                                name="sexo"
                                value={form.sexo}
                                onChange={handleChange}
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="">Seleccionar</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Nombre</Label>
                            <Input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Juan" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Apellido</Label>
                            <Input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Quispe" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Dirección</Label>
                        <Input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Jr. Los Andes 123" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Teléfono</Label>
                            <Input name="telefono" value={form.telefono} onChange={handleChange} placeholder="987654321" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha de nacimiento</Label>
                            <Input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tipo de poblador</Label>
                        <select
                            value={tipoId}
                            onChange={(e) => setTipoId(e.target.value)}
                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                            <option value="">Sin tipo</option>
                            {tipos.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

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