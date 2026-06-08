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
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useMsal } from '@azure/msal-react'

const navItems = [
  { to: '/dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/inventario',     label: 'Inventario',       icon: Monitor },
  { to: '/prestamos',      label: 'Préstamos',        icon: BookOpen },
  { to: '/mantenimientos', label: 'Mantenimientos',   icon: Wrench },
  { to: '/movimientos',    label: 'Movimientos',      icon: ArrowLeftRight },
  { to: '/ubicaciones',    label: 'Ubicaciones',      icon: MapPin },
  { to: '/usuarios',       label: 'Usuarios',         icon: Users },
  { to: '/reportes',       label: 'Reportes y Auditoría', icon: BarChart2 },
]

export default function Sidebar() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { instance, accounts } = useMsal()

  const handleLogout = () => {
    clearAuth()
    if (accounts.length > 0) {
      instance.logoutRedirect().catch(console.error)
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <aside className="w-64 flex flex-col border-r bg-sidebar h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">
          FISEI <span className="text-[#be1e34]">·</span> INVENTARIO
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Sistema de Gestión Tecnológica</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group font-medium',
                isActive
                  ? 'bg-[#fff1f3] text-[#be1e34] shadow-sm ring-1 ring-[#ffcdd5]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#be1e34]'
              )
            }
          >
            <Icon size={18} className={cn("transition-transform duration-200", "group-hover:scale-110")} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full font-medium text-gray-600 hover:bg-red-50 hover:text-[#be1e34] transition-all duration-200 group"
        >
          <LogOut size={18} className="transition-transform duration-200 group-hover:scale-110" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}