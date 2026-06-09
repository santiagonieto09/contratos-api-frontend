import { useAuth } from '@/context/AuthContext'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            C
          </div>
          <span className="text-lg font-semibold tracking-tight">Contratos</span>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {user && (
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              {user.email}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        )}
      </div>

      {menuOpen && user && (
        <div className="border-t bg-white px-4 py-4 lg:hidden">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            {user.email}
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      )}
    </header>
  )
}
