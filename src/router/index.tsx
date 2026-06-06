import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from './ProtectedRoute'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import InventarioPage from '@/pages/inventario/InventarioPage'
import PrestamosPage from '@/pages/prestamos/PrestamosPage'
import MantenimientosPage from '@/pages/mantenimientos/MantenimientosPage'
import UbicacionesPage from '@/pages/ubicaciones/UbicacionesPage'
import UsuariosPage from '@/pages/usuarios/UsuariosPage'
import ReportesPage from '@/pages/reportes/ReportesPage'
import MovimientosPage from '@/pages/movimientos/MovimientosPage'
import AuditoriaPage from '@/pages/auditoria/AuditoriaPage'
import LoginPage from '@/pages/auth/LoginPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="prestamos" element={<PrestamosPage />} />
            <Route path="mantenimientos" element={<MantenimientosPage />} />
            <Route path="ubicaciones" element={<UbicacionesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="movimientos" element={<MovimientosPage />} />
            <Route path="auditoria" element={<AuditoriaPage />} />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}