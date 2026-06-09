import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const res = await authService.register(data.email, data.password)
      login(res.token)
      toast.success('Cuenta creada correctamente')
      navigate('/dashboard')
    } catch (err: unknown) {
      const api = err as { response?: { data?: { error?: string } } }
      toast.error(api.response?.data?.error || 'Error al registrarse')
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
          <h1 className="text-xl font-semibold text-on-surface">Crear cuenta</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Regístrate para gestionar tus contratos
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              error={errors.password?.message}
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

          <div className="relative">
            <Input
              label="Confirmar contraseña"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
