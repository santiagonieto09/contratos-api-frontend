import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/Logo'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const passwordRequirements = [
  'Mínimo 6 caracteres',
  'No debe ser una contraseña comprometida',
]

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, '\u200B'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authService.login(data.email, data.password)
      login(res.token)
      toast.success('Sesión iniciada correctamente')
      navigate('/dashboard')
    } catch (err: unknown) {
      const api = err as { response?: { status?: number; data?: { mensaje?: string; error?: string; detalles?: Record<string, string> } } }
      const data = api.response?.data
      if (data?.detalles) {
        for (const [field, message] of Object.entries(data.detalles)) {
          setError(field as keyof LoginForm, { message })
        }
      }
      const msg =
        data?.mensaje ||
        data?.error ||
        (api.response?.status === 404 ? 'Usuario no registrado' : 'Credenciales inválidas')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg border border-outline-variant/50 bg-surface-bright p-7 shadow-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-on-primary">
            <Logo className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-on-surface">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ingresa a tu panel de contratos
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, () => toast.error('Corrige los errores en el formulario'))} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              error={errors.password ? (
                <ul className="mt-1 space-y-0.5">
                  {passwordRequirements.map((req) => (
                    <li key={req} className="flex items-center gap-1.5 text-[11px]">
                      <span className="inline-block h-1 w-1 rounded-full bg-error" />
                      {req}
                    </li>
                  ))}
                </ul>
              ) : undefined}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
