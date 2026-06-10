import { useState, useEffect } from 'react'
import { contratoService } from '@/services/contratoService'
import type { MetodoPago, Cuota } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Calculator, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CuotasTable } from '@/components/CuotasTable'

export default function ProjectionSimulator() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [form, setForm] = useState({
    valorTotal: '',
    numeroMeses: '',
    metodoPago: '',
  })
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

  useEffect(() => {
    let cancelled = false
    contratoService
      .metodosPago()
      .then((m) => {
        if (cancelled) return
        setMetodos(m)
        if (m.length > 0) setForm((f) => ({ ...f, metodoPago: m[0]!.id }))
      })
      .finally(() => {
        if (!cancelled) setLoadingMetodos(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await contratoService.proyectar({
        valorTotal: Number(form.valorTotal),
        numeroMeses: Number(form.numeroMeses),
        metodoPago: form.metodoPago,
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
        onSubmit={handleSubmit}
        className="mx-auto max-w-lg space-y-5 rounded-lg border border-outline-variant/30 bg-surface-bright p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Valor total ($)"
            type="number"
            name="valorTotal"
            value={form.valorTotal}
            onChange={(e) => { setForm({ ...form, valorTotal: e.target.value }); setResultado(null) }}
            required
            min="0"
            step="0.01"
            placeholder="1000.00"
          />
          <Input
            label="Número de meses"
            type="number"
            name="numeroMeses"
            value={form.numeroMeses}
            onChange={(e) => { setForm({ ...form, numeroMeses: e.target.value }); setResultado(null) }}
            required
            min="1"
            max="120"
            placeholder="12"
          />
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-on-surface-variant">
              Método de pago
            </label>
            {loadingMetodos ? (
              <div className="flex h-9 items-center gap-2 text-sm text-on-surface-variant">
                <Loader2 className="animate-spin" size={14} />
                Cargando...
              </div>
            ) : (
              <Select
                value={form.metodoPago}
                onValueChange={(v) => { setForm({ ...form, metodoPago: v }); setResultado(null) }}
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
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Calculator size={16} />}
          {loading ? 'Calculando...' : 'Calcular proyección'}
        </Button>
      </form>

      {resultado && (
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Projection details */}
          <div className="rounded-lg border border-outline-variant/30 bg-surface-bright p-6">
            <h2 className="mb-5 text-base font-semibold text-on-surface">
              Detalles de la proyección
            </h2>
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

          {/* Summary */}
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

          {/* Diferencia */}
          <div className="rounded-md bg-primary-container/50 px-5 py-3 text-center">
            <p className="text-sm font-medium text-on-primary-container">
              Diferencia sobre valor original:{' '}
              <span className="font-bold tabular-nums">
                ${formatCurrency(resultado.resumen.diferenciaSobreValorOriginal)}
              </span>
            </p>
          </div>

          {/* Full installments table */}
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
