import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { MetodoPago, Cuota } from '@/types'
import { Save, Loader2, Calculator } from 'lucide-react'

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
  const [errors, setErrors] = useState('')
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setCuotas(null)
  }

  const handleProyectar = async () => {
    setProyectando(true)
    setErrors('')
    try {
      const res = await contratoService.proyectar({
        valorTotal: Number(form.valorTotal),
        numeroMeses: Number(form.numeroMeses),
        metodoPago: form.metodoPago,
        fechaContrato: form.fechaContrato,
      })
      setCuotas(res.cuotas)
    } catch {
      setErrors('Error al calcular proyección')
    } finally {
      setProyectando(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors('')
    setLoading(true)
    try {
      const res = await contratoService.crear({
        numeroContrato: form.numeroContrato,
        fechaContrato: form.fechaContrato,
        valorTotal: Number(form.valorTotal),
        metodoPago: form.metodoPago,
        numeroMeses: Number(form.numeroMeses),
      })
      navigate(`/contratos/${res.contrato.id}`)
    } catch (err: unknown) {
      const api = err as { response?: { data?: { error?: string } } }
      setErrors(api.response?.data?.error || 'Error al crear contrato')
    } finally {
      setLoading(false)
    }
  }

  const totalCuotas = cuotas?.reduce((s, c) => s + c.total, 0) ?? 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Contrato</h1>
        <p className="text-sm text-gray-500">Ingresa los datos del contrato</p>
      </div>

      {errors && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Número de Contrato
            </label>
            <input
              type="text"
              name="numeroContrato"
              value={form.numeroContrato}
              onChange={handleChange}
              required
              placeholder="Ej: CT-001"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Fecha del Contrato
            </label>
            <input
              type="date"
              name="fechaContrato"
              value={form.fechaContrato}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Valor Total ($)
            </label>
            <input
              type="number"
              name="valorTotal"
              value={form.valorTotal}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="1000.00"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Número de Meses
            </label>
            <input
              type="number"
              name="numeroMeses"
              value={form.numeroMeses}
              onChange={handleChange}
              required
              min="1"
              max="120"
              placeholder="12"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Método de Pago
            </label>
            {loadingMetodos ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="animate-spin" size={16} /> Cargando...
              </div>
            ) : (
              <select
                name="metodoPago"
                value={form.metodoPago}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                {metodos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {form.valorTotal && form.numeroMeses && form.metodoPago && (
          <button
            type="button"
            onClick={handleProyectar}
            disabled={proyectando}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
          >
            {proyectando ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Calculator size={18} />
            )}
            {proyectando ? 'Calculando...' : 'Vista Previa de Cuotas'}
          </button>
        )}

        {cuotas && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Proyección - {cuotas.length} cuota{cuotas.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm font-bold text-indigo-700">
                Total: ${totalCuotas.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left font-medium text-gray-500">
                    <th className="pb-1">#</th>
                    <th className="pb-1 text-right">Base</th>
                    <th className="pb-1 text-right">Interés</th>
                    <th className="pb-1 text-right">Tarifa</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((c) => (
                    <tr key={c.numeroCuota}>
                      <td className="py-0.5">{c.numeroCuota}</td>
                      <td className="py-0.5 text-right">
                        ${c.valorBase.toFixed(2)}
                      </td>
                      <td className="py-0.5 text-right">${c.interes.toFixed(2)}</td>
                      <td className="py-0.5 text-right">
                        ${c.tarifaPago.toFixed(2)}
                      </td>
                      <td className="py-0.5 text-right font-medium">
                        ${c.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? 'Creando...' : 'Crear Contrato'}
        </button>
      </form>
    </div>
  )
}
