import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  Home, Users, UserCheck, Calendar,
  ClipboardList, BarChart2, LogOut,
  Shield, Menu, X, ChevronLeft, ChevronRight,
  Cherry, Settings, Banknote, ClipboardCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Inicio', icon: Home, path: '/' },
  { label: 'Pobladores', icon: Users, path: '/pobladores' },
  { label: 'Roles', icon: Shield, path: '/roles' },
  { label: 'Eventos', icon: Calendar, path: '/eventos' },
  { label: 'Asistencias', icon: ClipboardList, path: '/asistencias' },
  { label: 'Ganado', icon: Cherry, path: '/operaciones' },
  { label: 'Pagos', icon: Banknote, path: '/pagos' },
  { label: 'Reportes', icon: BarChart2, path: '/reportes' },
  { label: 'Auditoría', icon: ClipboardCheck, path: '/auditoria' },
  { label: 'Usuarios', icon: UserCheck, path: '/usuarios' },
  { label: 'Configuración', icon: Settings, path: '/configuracion' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn('flex items-center justify-between p-5', collapsed && !mobile && 'px-3')}>
        {(!collapsed || mobile) && (
          <div>
            <h1 className="text-base font-bold text-slate-800">Comunidad</h1>
            <p className="text-xs text-slate-400">Sistema de gestión</p>
          </div>
        )}
        {mobile ? (
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-700 ml-auto">
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-700 ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                collapsed && !mobile ? 'justify-center px-2' : '',
                active
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className={cn('p-3 space-y-2', collapsed && !mobile && 'items-center')}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{usuario?.nombre}</p>
              <p className="text-xs text-slate-400 truncate">{usuario?.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50',
            collapsed && !mobile && 'justify-center px-2'
          )}
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar móvil */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 md:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent mobile />
      </div>

      {/* Sidebar desktop */}
      <aside className={cn(
        'hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}