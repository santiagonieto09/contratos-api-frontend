import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { MetodoPago, Cuota } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Calculator, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateContract() {
  const navigate = useNavigate()
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [form, setForm] = useState({
    numeroContrato: '',
    fechaContrato: new Date().toISOString().split('T')[0] ?? '',
    valorTotal: '',
    metodoPago: '',
    numeroMeses: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingMetodos, setLoadingMetodos] = useState(true)
  const [cuotas, setCuotas] = useState<Cuota[] | null>(null)
  const [proyectando, setProyectando] = useState(false)

  useEffect(() => {
    contratoService
      .metodosPago()
      .then((m) => {
        setMetodos(m)
        if (m.length > 0) setForm((f) => ({ ...f, metodoPago: m[0]!.id }))
      })
      .finally(() => setLoadingMetodos(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setCuotas(null)
  }

  const handleProyectar = async () => {
    setProyectando(true)
    try {
      const res = await contratoService.proyectar({
        valorTotal: Number(form.valorTotal),
        numeroMeses: Number(form.numeroMeses),
        metodoPago: form.metodoPago,
        fechaContrato: form.fechaContrato,
      })
      setCuotas(res.cuotas)
    } catch {
      toast.error('Error al calcular proyección')
    } finally {
      setProyectando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await contratoService.crear({
        numeroContrato: form.numeroContrato,
        fechaContrato: form.fechaContrato,
        valorTotal: Number(form.valorTotal),
        metodoPago: form.metodoPago,
        numeroMeses: Number(form.numeroMeses),
      })
      toast.success('Contrato creado correctamente')
      navigate(`/contratos/${res.contrato.id}`)
    } catch (err: unknown) {
      const api = err as { response?: { data?: { error?: string } } }
      toast.error(api.response?.data?.error || 'Error al crear contrato')
    } finally {
      setLoading(false)
    }
  }

  const totalCuotas = cuotas?.reduce((s, c) => s + c.total, 0) ?? 0
  const canPreview = form.valorTotal && form.numeroMeses && form.metodoPago

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-outline-variant/30 bg-surface-bright p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Número de contrato"
              type="text"
              name="numeroContrato"
              value={form.numeroContrato}
              onChange={handleChange}
              required
              placeholder="Ej: CT-001"
            />
            <Input
              label="Fecha del contrato"
              type="date"
              name="fechaContrato"
              value={form.fechaContrato}
              onChange={handleChange}
              required
            />
            <Input
              label="Valor total ($)"
              type="number"
              name="valorTotal"
              value={form.valorTotal}
              onChange={handleChange}
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
              onChange={handleChange}
              required
              min="1"
              max="120"
              placeholder="12"
            />
            <div className="space-y-1.5">
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
                  onValueChange={(v) => setForm({ ...form, metodoPago: v })}
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
                  Total: ${totalCuotas.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="max-h-44 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                      <th className="pb-1 font-medium">#</th>
                      <th className="pb-1 text-right font-medium">Base</th>
                      <th className="pb-1 text-right font-medium">Interés</th>
                      <th className="pb-1 text-right font-medium">Tarifa</th>
                      <th className="pb-1 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotas.map((c) => (
                      <tr key={c.numeroCuota}>
                        <td className="py-0.5 text-on-surface tabular-nums">{c.numeroCuota}</td>
                        <td className="py-0.5 text-right tabular-nums">${c.valorBase.toFixed(2)}</td>
                        <td className="py-0.5 text-right text-data-interest tabular-nums">${c.interes.toFixed(2)}</td>
                        <td className="py-0.5 text-right text-data-fee tabular-nums">${c.tarifaPago.toFixed(2)}</td>
                        <td className="py-0.5 text-right font-medium text-data-total tabular-nums">${c.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
