import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import type { ApiError } from '@/types'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      login(res.token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const api = err as { response?: { data?: ApiError } }
      setError(api.response?.data?.error || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg border border-outline-variant/50 bg-surface-bright p-7 shadow-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-lg font-bold text-on-primary">
            C
          </div>
          <h1 className="text-xl font-semibold text-on-surface">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ingresa a tu panel de contratos
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-error-container px-3 py-2.5 text-sm text-on-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}
