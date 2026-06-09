import { useAuth } from '@/context/AuthContext'
import { LogOut, User, Menu, X, FileText, PlusCircle, BarChart3, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar } from './Avatar'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contratos/nuevo', label: 'Nuevo Contrato', icon: PlusCircle },
  { to: '/proyeccion', label: 'Proyección', icon: BarChart3 },
  { to: '/contratos', label: 'Mis Contratos', icon: FileText },
]

export function Header() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/50 bg-surface-bright/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-(--breakpoint-2xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-on-primary">
              C
            </div>
            <span className="text-base font-semibold tracking-tight text-on-surface">
              Gestión de Contratos
            </span>
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container lg:hidden cursor-pointer"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {user && (
          <div className="hidden items-center gap-2 lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                  aria-label="Menú de usuario"
                >
                  <Avatar email={user.email} size="sm" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-error focus:text-error focus:bg-error-container">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {menuOpen && user && (
        <div className="border-t border-outline-variant/50 bg-surface-bright px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-0.5" aria-label="Navegación principal">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/contratos'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out-expo cursor-pointer',
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
          <div className="mt-4 border-t border-outline-variant/50 pt-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-on-surface-variant">
              <User size={16} />
              <span className="truncate">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-error hover:bg-error-container transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
