import { useState, useEffect } from 'react'
import { contratoService } from '@/services/contratoService'
import type { MetodoPago, Cuota } from '@/types'
import { Calculator, Loader2, BarChart3 } from 'lucide-react'

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
    setResultado(null)
  }

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Simulador de Proyección</h1>
        <p className="text-sm text-gray-500">
          Calcula cuotas antes de crear un contrato
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-3">
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
                    {m.nombre} ({m.tasaInteres} interés / {m.tasaTarifa} tarifa)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Calculator size={18} />}
          {loading ? 'Calculando...' : 'Calcular Proyección'}
        </button>
      </form>

      {resultado && (
        <>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={22} />
              <h2 className="text-lg font-semibold">Detalles de la Proyección</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Valor Original</p>
                <p className="text-lg font-bold">
                  ${resultado.proyeccion.valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Método de Pago</p>
                <p className="text-lg font-bold capitalize">
                  {resultado.proyeccion.metodoPago}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Tasa Interés</p>
                <p className="text-lg font-bold">{resultado.proyeccion.tasaInteres}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Tasa Tarifa</p>
                <p className="text-lg font-bold">{resultado.proyeccion.tasaTarifa}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total Cuotas</p>
              <p className="mt-1 text-xl font-bold">
                {resultado.resumen.totalCuotas}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total Interés</p>
              <p className="mt-1 text-xl font-bold text-orange-600">
                ${resultado.resumen.totalInteres.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total Tarifa</p>
              <p className="mt-1 text-xl font-bold text-blue-600">
                ${resultado.resumen.totalTarifa.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total a Pagar</p>
              <p className="mt-1 text-xl font-bold text-indigo-600">
                ${resultado.resumen.totalAPagar.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 p-4 text-center">
            <p className="text-sm text-indigo-700">
              Diferencia sobre valor original:{' '}
              <span className="font-bold">
                ${resultado.resumen.diferenciaSobreValorOriginal.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Tabla de Cuotas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3 text-right">Valor Base</th>
                    <th className="px-6 py-3 text-right">Interés</th>
                    <th className="px-6 py-3 text-right">Tarifa</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resultado.cuotas.map((c) => (
                    <tr key={c.numeroCuota} className="transition hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{c.numeroCuota}</td>
                      <td className="px-6 py-3 text-right">
                        ${c.valorBase.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-orange-600">
                        ${c.interes.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-blue-600">
                        ${c.tarifaPago.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-indigo-600">
                        ${c.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">
                        {c.fechaPago}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
