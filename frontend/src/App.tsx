import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PobladoresPage from '@/pages/pobladores/PobladoresPage';
import EventosPage from '@/pages/eventos/EventosPage';
import AsistenciasPage from '@/pages/asistencias/AsistenciasPage';
import RolesPage from '@/pages/roles/RolesPage';
import ReportesPage from '@/pages/reportes/ReportesPage';
import UsuariosPage from '@/pages/usuarios/UsuariosPage';
import ConfiguracionPage from '@/pages/configuracion/ConfiguracionPage';
import OperacionesPage from '@/pages/operaciones/OperacionesPage';
import PagosPage from '@/pages/pagos/PagosPage';
import AuditoriaPage from '@/pages/auditoria/AuditoriaPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pobladores" element={<PobladoresPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/asistencias" element={<AsistenciasPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/operaciones" element={<OperacionesPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/pagos" element={<PagosPage />} />
          <Route path="/auditoria" element={<AuditoriaPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}