import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Usuario } from '@/types'
import { authService } from '@/services/authService'

interface AuthContextType {
  user: Usuario | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const token = sessionStorage.getItem('token')
    if (token) {
      authService
        .perfil()
        .then((u) => {
          if (!cancelled) setUser(u)
        })
        .catch(() => sessionStorage.removeItem('token'))
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    } else {
      setLoading(false)
    }
    return () => { cancelled = true }
  }, [])

  const login = (token: string) => {
    sessionStorage.setItem('token', token)
    authService.perfil().then(setUser)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const u = await authService.perfil()
      setUser(u)
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
