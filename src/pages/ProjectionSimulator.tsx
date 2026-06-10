import { useState, useEffect } from 'react'
import { contratoService } from '@/services/contratoService'
import type { MetodoPago, Cuota } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Calculator, TrendingUp, CircleHelp } from 'lucide-react'
import { formatCurrency, MAX_MESES_PLAZO } from '@/lib/utils'
import { CuotasTable } from '@/components/CuotasTable'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { DownloadButton } from '@/components/DownloadButton'
import type { DownloadPayload } from '@/services/downloadService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const MAX_VALOR = 999_999_999.99

const proyeccionSchema = z.object({
  valorTotal: z.string()
    .min(1, 'El valor total es requerido')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Debe ser mayor a 0')
    .refine((v) => Number(v) <= MAX_VALOR, `Valor máximo ${MAX_VALOR.toLocaleString('es-CO')}`),
  numeroMeses: z.string()
    .min(1, 'El número de meses es requerido')
    .refine(
      (v) => {
        const n = Number(v)
        return !isNaN(n) && Number.isInteger(n) && n >= 1 && n <= MAX_MESES_PLAZO
      },
      `Debe ser un número entero entre 1 y ${MAX_MESES_PLAZO}`
    ),
  metodoPago: z.string()
    .min(1, 'Selecciona un método de pago'),
})

type ProyeccionForm = z.infer<typeof proyeccionSchema>

export default function ProjectionSimulator() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [loadingMetodos, setLoadingMetodos] = useState(true)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    proyeccion: {
      valorTotal: number
      numeroMeses: number
      metodoPago: string
      tasaInteres: string
      tasaTarifa: string
    }
    cuotas: Cuota[]
    resumen: {
      totalCuotas: number
      totalInteres: number
      totalTarifa: number
      totalAPagar: number
      diferenciaSobreValorOriginal: number
    }
  } | null>(null)
  const [error, setError] = useState('')

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProyeccionForm>({
    resolver: zodResolver(proyeccionSchema),
    defaultValues: {
      valorTotal: '',
      numeroMeses: '',
      metodoPago: '',
    },
  })

  useEffect(() => {
    let cancelled = false
    contratoService
      .metodosPago()
      .then((m) => {
        if (cancelled) return
        setMetodos(m)
        if (m.length > 0) {
          reset({ metodoPago: m[0]!.id })
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMetodos(false)
      })
    return () => { cancelled = true }
  }, [reset])

  const onSubmit = async (data: ProyeccionForm) => {
    setLoading(true)
    setError('')
    setResultado(null)
    try {
      const res = await contratoService.proyectar({
        valorTotal: Number(data.valorTotal),
        numeroMeses: Number(data.numeroMeses),
        metodoPago: data.metodoPago,
      })
      setResultado(res)
    } catch {
      setError('Error al calcular proyección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
          <TrendingUp size={20} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">
          Simulador de proyección
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Calcula cuotas antes de crear un contrato.
        </p>
      </div>

      {error && (
        <div className="mx-auto max-w-md rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-5 rounded-lg border border-outline-variant/30 bg-surface-bright p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="valorTotal"
            control={control}
            render={({ field }) => (
              <Input
                label="Valor total ($)"
                description="Monto total del contrato, mayor a 0"
                type="number"
                placeholder="1000.00"
                min="0.01"
                step="0.01"
                error={errors.valorTotal?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="numeroMeses"
            control={control}
            render={({ field }) => (
              <Input
                label="Número de meses"
                description={`Plazo entre 1 y ${MAX_MESES_PLAZO} meses`}
                type="number"
                placeholder="12"
                min="1"
                max={String(MAX_MESES_PLAZO)}
                error={errors.numeroMeses?.message}
                {...field}
              />
            )}
          />
          <div className="space-y-1.5 sm:col-span-2">
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
                      setResultado(null)
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Calculator size={16} />}
          {loading ? 'Calculando...' : 'Calcular proyección'}
        </Button>
      </form>

      {resultado && (
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-lg border border-outline-variant/30 bg-surface-bright p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-on-surface">
                Detalles de la proyección
              </h2>
              <DownloadButton
                payload={{
                  title: 'Proyección de Contrato',
                  filename: `proyeccion-${Date.now()}`,
                  infoRows: [
                    { label: 'Valor Original', value: `$${formatCurrency(resultado.proyeccion.valorTotal)}` },
                    { label: 'Número de Meses', value: resultado.proyeccion.numeroMeses.toString() },
                    { label: 'Método de Pago', value: resultado.proyeccion.metodoPago },
                    { label: 'Tasa Interés', value: resultado.proyeccion.tasaInteres },
                    { label: 'Tasa Tarifa', value: resultado.proyeccion.tasaTarifa },
                  ],
                  summaryRows: [
                    { label: 'Total Cuotas', value: resultado.resumen.totalCuotas.toString(), color: undefined },
                    { label: 'Total Interés', value: resultado.resumen.totalInteres.toFixed(2), color: '#D92D20' },
                    { label: 'Total Tarifa', value: resultado.resumen.totalTarifa.toFixed(2), color: '#B42318' },
                    { label: 'Total a Pagar', value: resultado.resumen.totalAPagar.toFixed(2), color: '#039855' },
                  ],
                  cuotas: resultado.cuotas,
                }}
              />
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Valor original
                </p>
                <p className="mt-0.5 text-lg font-semibold text-on-surface tabular-nums">
                  ${formatCurrency(resultado.proyeccion.valorTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Método de pago
                </p>
                <p className="mt-0.5 text-lg font-semibold text-on-surface capitalize">
                  {resultado.proyeccion.metodoPago}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Tasa interés
                </p>
                <p className="mt-0.5 text-lg font-semibold text-data-interest tabular-nums">
                  {resultado.proyeccion.tasaInteres}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Tasa tarifa
                </p>
                <p className="mt-0.5 text-lg font-semibold text-data-fee tabular-nums">
                  {resultado.proyeccion.tasaTarifa}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total cuotas
              </p>
              <p className="mt-0.5 text-xl font-semibold text-on-surface tabular-nums">
                {resultado.resumen.totalCuotas}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total interés
              </p>
              <p className="mt-0.5 text-xl font-semibold text-data-interest tabular-nums">
                ${formatCurrency(resultado.resumen.totalInteres)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total tarifa
              </p>
              <p className="mt-0.5 text-xl font-semibold text-data-fee tabular-nums">
                ${formatCurrency(resultado.resumen.totalTarifa)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Total a pagar
              </p>
              <p className="mt-0.5 text-xl font-semibold text-data-total tabular-nums">
                ${formatCurrency(resultado.resumen.totalAPagar)}
              </p>
            </div>
          </div>

          <div className="rounded-md bg-primary-container/50 px-5 py-3 text-center">
            <p className="text-sm font-medium text-on-primary-container">
              Diferencia sobre valor original:{' '}
              <span className="font-bold tabular-nums">
                ${formatCurrency(resultado.resumen.diferenciaSobreValorOriginal)}
              </span>
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-base font-semibold text-on-surface">
              Tabla de cuotas
            </h2>
            <CuotasTable cuotas={resultado.cuotas} />
          </div>
        </div>
      )}
    </div>
  )
}
