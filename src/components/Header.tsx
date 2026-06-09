import { useAuth } from '@/context/AuthContext'
import { LogOut, User, Menu, X, Bell } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar } from './Avatar'

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
              Contratos
            </span>
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container lg:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {user && (
          <div className="hidden items-center gap-2 lg:flex">
            <button
              className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={16} />
            </button>
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
        <div className="border-t border-outline-variant/50 bg-surface-bright px-4 py-3 lg:hidden">
          <div className="mb-3 flex items-center gap-2 text-sm text-on-surface-variant">
            <User size={16} />
            {user.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-error"
          >
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </div>
      )}
    </header>
  )
}
