import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Monitor,
  BookOpen,
  Wrench,
  MapPin,
  Users,
  BarChart2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/inventario',     label: 'Inventario',       icon: Monitor },
  { to: '/prestamos',      label: 'Préstamos',        icon: BookOpen },
  { to: '/mantenimientos', label: 'Mantenimientos',   icon: Wrench },
  { to: '/ubicaciones',    label: 'Ubicaciones',      icon: MapPin },
  { to: '/usuarios',       label: 'Usuarios',         icon: Users },
  { to: '/reportes',       label: 'Reportes',         icon: BarChart2 },
]

export default function Sidebar() {
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <aside className="w-64 flex flex-col border-r bg-sidebar h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          FISEI - PRÉSTAMOS
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gestión de Inventario</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t">
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}