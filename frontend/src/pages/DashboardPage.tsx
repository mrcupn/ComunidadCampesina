import { useEffect, useState } from 'react';
import { Users, Calendar, ClipboardList, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/axios';
import { useAuthStore } from '@/store/authStore';

interface Stats {
  totalPobladores: number;
  totalEventos: number;
  totalAsistencias: number;
  rolesVigentes: number;
}

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [stats, setStats] = useState<Stats>({
    totalPobladores: 0,
    totalEventos: 0,
    totalAsistencias: 0,
    rolesVigentes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pobladores, eventos, asistencias, roles] = await Promise.all([
          api.get('/pobladores'),
          api.get('/eventos'),
          api.get('/asistencias/evento/1'),
          api.get('/roles/vigentes'),
        ]);
        setStats({
          totalPobladores: pobladores.data.length,
          totalEventos: eventos.data.length,
          totalAsistencias: asistencias.data.length,
          rolesVigentes: roles.data.length,
        });
      } catch {
        console.error('Error cargando stats');
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Pobladores', value: stats.totalPobladores, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Eventos', value: stats.totalEventos, icon: Calendar, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Asistencias', value: stats.totalAsistencias, icon: ClipboardList, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Roles vigentes', value: stats.rolesVigentes, icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {usuario?.nombre} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Resumen general del sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {card.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon size={18} className={card.color} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}