import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { MetodoPago, Cuota } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Calculator, Save, CircleHelp } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MAX_MESES_PLAZO, formatCurrency } from '@/lib/utils'
import type { ApiErrorResponse } from '@/types'
import { CuotasTable } from '@/components/CuotasTable'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const MAX_VALOR = 999_999_999.99

const contractSchema = z.object({
  numeroContrato: z.string()
    .min(1, 'El número de contrato es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9\-_\/]+$/, 'Solo letras, números, guiones y slash'),
  fechaContrato: z.string()
    .min(1, 'La fecha es requerida'),
  valorTotal: z.string()
    .min(1, 'El valor total es requerido')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Debe ser mayor a 0')
    .refine((v) => Number(v) <= MAX_VALOR, `Valor máximo ${MAX_VALOR.toLocaleString('es-CO')}`),
  metodoPago: z.string()
    .min(1, 'Selecciona un método de pago'),
  numeroMeses: z.string()
    .min(1, 'El número de meses es requerido')
    .refine(
      (v) => {
        const n = Number(v)
        return !isNaN(n) && Number.isInteger(n) && n >= 1 && n <= MAX_MESES_PLAZO
      },
      `Debe ser un número entero entre 1 y ${MAX_MESES_PLAZO}`
    ),
})

type ContractForm = z.infer<typeof contractSchema>

const today = new Date().toISOString().split('T')[0] ?? ''

export default function CreateContract() {
  const navigate = useNavigate()
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMetodos, setLoadingMetodos] = useState(true)
  const [cuotas, setCuotas] = useState<Cuota[] | null>(null)
  const [proyectando, setProyectando] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      numeroContrato: '',
      fechaContrato: new Date().toISOString().split('T')[0] ?? '',
      valorTotal: '',
      metodoPago: '',
      numeroMeses: '',
    },
  })

  const valorTotal = watch('valorTotal')
  const numeroMeses = watch('numeroMeses')
  const metodoPago = watch('metodoPago')

  useEffect(() => {
    let cancelled = false
    contratoService
      .metodosPago()
      .then((m) => {
        if (!cancelled) setMetodos(m)
      })
      .finally(() => {
        if (!cancelled) setLoadingMetodos(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleProyectar = async () => {
    setProyectando(true)
    try {
      const res = await contratoService.proyectar({
        valorTotal: Number(valorTotal),
        numeroMeses: Number(numeroMeses),
        metodoPago: metodoPago,
        fechaContrato: new Date().toISOString().split('T')[0],
      })
      setCuotas(res.cuotas)
    } catch {
      toast.error('Error al calcular proyección')
    } finally {
      setProyectando(false)
    }
  }

  const onSubmit = async (data: ContractForm) => {
    setLoading(true)
    try {
      const res = await contratoService.crear({
        numeroContrato: data.numeroContrato,
        fechaContrato: data.fechaContrato,
        valorTotal: Number(data.valorTotal),
        metodoPago: data.metodoPago,
        numeroMeses: Number(data.numeroMeses),
      })
      toast.success('Contrato creado correctamente')
      navigate(`/contratos/${res.contrato.id}`)
    } catch (err: unknown) {
      const api = err as ApiErrorResponse
      toast.error(api.response?.data?.error || 'Error al crear contrato')
    } finally {
      setLoading(false)
    }
  }

  const totalCuotas = cuotas?.reduce((s, c) => s + c.total, 0) ?? 0
  const canPreview = valorTotal && numeroMeses && metodoPago

  return (
    <div className="container-form space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">
          Nuevo contrato
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Ingresa los datos del contrato para generar la proyección de cuotas
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-outline-variant/30 bg-surface-bright p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Número de contrato"
              description="Ej: CT-001, CONTR-2024/01"
              type="text"
              placeholder="Ej: CT-001"
              maxLength={30}
              error={errors.numeroContrato?.message}
              {...register('numeroContrato')}
            />
            <Input
              label="Fecha del contrato"
              description="No puede ser anterior a hoy"
              type="date"
              min={today}
              error={errors.fechaContrato?.message}
              {...register('fechaContrato')}
            />
            <Input
              label="Valor total ($)"
              description="Monto total del contrato, mayor a 0"
              type="number"
              placeholder="1000.00"
              min="0.01"
              step="0.01"
              error={errors.valorTotal?.message}
              {...register('valorTotal')}
            />
            <Input
              label="Número de meses"
              description={`Plazo entre 1 y ${MAX_MESES_PLAZO} meses`}
              type="number"
              placeholder="12"
              min="1"
              max={String(MAX_MESES_PLAZO)}
              error={errors.numeroMeses?.message}
              {...register('numeroMeses')}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-on-surface-variant">
                  Método de pago
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center rounded-full text-on-surface-variant cursor-help">
                      <CircleHelp size={14} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Selecciona la forma de pago del contrato
                  </TooltipContent>
                </Tooltip>
              </div>
              {loadingMetodos ? (
                <div className="flex h-9 items-center gap-2 text-sm text-on-surface-variant">
                  <Loader2 className="animate-spin" size={14} />
                  Cargando...
                </div>
              ) : (
                <Controller
                  name="metodoPago"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        setCuotas(null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodos.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.metodoPago?.message && (
                <p className="text-xs text-error" role="alert">
                  {errors.metodoPago.message}
                </p>
              )}
            </div>
          </div>

          {canPreview && (
            <div className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleProyectar}
                disabled={proyectando}
                className="w-full"
              >
                {proyectando ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Calculator size={16} />
                )}
                {proyectando ? 'Calculando...' : 'Vista previa de cuotas'}
              </Button>
            </div>
          )}

          {cuotas && (
            <div className="mt-5 rounded-md border border-outline-variant/30 bg-surface-low p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-on-surface">
                  {cuotas.length} cuota{cuotas.length !== 1 ? 's' : ''} proyectada{cuotas.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm font-semibold text-data-total tabular-nums">
                  Total: ${formatCurrency(totalCuotas)}
                </p>
              </div>
              <div className="max-h-44 overflow-y-auto">
                <CuotasTable cuotas={cuotas} showFecha={false} />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {loading ? 'Creando contrato...' : 'Crear contrato'}
        </Button>
      </form>
    </div>
  )
}
