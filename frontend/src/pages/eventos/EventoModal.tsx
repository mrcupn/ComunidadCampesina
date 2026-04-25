import { useEffect, useState } from 'react';
import type { Evento } from '@/types';
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
    evento?: Evento | null;
}

interface FormData {
    tipo: string;
    titulo: string;
    descripcion: string;
    fecha: string;
    lugar: string;
    estado: string;
}

const inicial: FormData = {
    tipo: 'faena',
    titulo: '',
    descripcion: '',
    fecha: '',
    lugar: '',
    estado: 'programado',
};

export default function EventoModal({ open, onClose, onSuccess, evento }: Props) {
    const [form, setForm] = useState<FormData>(inicial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (evento) {
            setForm({
                tipo: evento.tipo,
                titulo: evento.titulo,
                descripcion: evento.descripcion ?? '',
                fecha: evento.fecha ? new Date(evento.fecha).toISOString().slice(0, 16) : '',
                lugar: evento.lugar ?? '',
                estado: evento.estado,
            });
        } else {
            setForm(inicial);
        }
        setError('');
    }, [evento, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const data = {
                tipo: form.tipo,
                titulo: form.titulo,
                descripcion: form.descripcion || undefined,
                fecha: form.fecha,
                lugar: form.lugar || undefined,
            };

            if (evento) {
                await api.patch(`/eventos/${evento.id}`, data);
                // Si cambió el estado, usar el endpoint correcto
                if (form.estado !== evento.estado) {
                    await api.patch(`/eventos/${evento.id}/estado`, { estado: form.estado });
                }
            } else {
                await api.post('/eventos', data);
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
                    <DialogTitle>{evento ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Tipo</Label>
                            <select
                                name="tipo"
                                value={form.tipo}
                                onChange={handleChange}
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="faena">Faena</option>
                                <option value="asamblea">Asamblea</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Estado</Label>
                            <select
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="programado">Programado</option>
                                <option value="en_curso">En curso</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Título</Label>
                        <Input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej: Limpieza del canal" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Descripción</Label>
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción del evento..."
                            rows={3}
                            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Fecha y hora</Label>
                            <Input name="fecha" type="datetime-local" value={form.fecha} onChange={handleChange} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Lugar</Label>
                            <Input name="lugar" value={form.lugar} onChange={handleChange} placeholder="Local comunal" />
                        </div>
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