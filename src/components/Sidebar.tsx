import { NavLink } from 'react-router-dom'
import { FileText, PlusCircle, BarChart3, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contratos/nuevo', label: 'Nuevo Contrato', icon: PlusCircle },
  { to: '/proyeccion', label: 'Proyección', icon: BarChart3 },
  { to: '/contratos', label: 'Mis Contratos', icon: FileText },
]

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-outline-variant/50 bg-surface-bright lg:block">
      <nav className="flex flex-col gap-0.5 p-3 pt-5" aria-label="Navegación principal">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/contratos'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ease-out-expo cursor-pointer',
                isActive
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              )
            }
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
