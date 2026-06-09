import { NavLink } from 'react-router-dom'
import { FileText, PlusCircle, BarChart3, LayoutDashboard } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contratos/nuevo', label: 'Nuevo Contrato', icon: PlusCircle },
  { to: '/proyeccion', label: 'Proyección', icon: BarChart3 },
  { to: '/contratos', label: 'Mis Contratos', icon: FileText },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
