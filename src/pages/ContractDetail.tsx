import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato, Cuota, ResumenCuotas } from '@/types'
import {
  ArrowLeft,
  Loader2,
  Wallet,
  Calendar,
  CreditCard,
  BarChart3,
} from 'lucide-react'

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [resumen, setResumen] = useState<ResumenCuotas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      contratoService.obtener(id),
      contratoService.obtenerCuotas(id),
    ])
      .then(([c, cu]) => {
        setContrato(c)
        setCuotas(cu.cuotas)
        setResumen(cu.resumen)
      })
      .catch(() => setError('Error al cargar el contrato'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    )
  }

  if (error || !contrato) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || 'Contrato no encontrado'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/contratos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Volver a contratos
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{contrato.numeroContrato}</h1>
            <p className="text-sm text-gray-500">
              Creado el {contrato.creadoEn}
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium capitalize text-indigo-700">
            {contrato.metodoPago}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
            <Wallet className="text-indigo-600" size={22} />
            <div>
              <p className="text-xs text-gray-500">Valor Total</p>
              <p className="text-lg font-bold">
                ${contrato.valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
            <Calendar className="text-indigo-600" size={22} />
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-lg font-bold">{contrato.fechaContrato}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
            <CreditCard className="text-indigo-600" size={22} />
            <div>
              <p className="text-xs text-gray-500">Meses</p>
              <p className="text-lg font-bold">{contrato.numeroMeses}</p>
            </div>
          </div>
        </div>
      </div>

      {resumen && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Cuotas</p>
            <p className="mt-1 text-xl font-bold">{resumen.totalCuotas}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Interés</p>
            <p className="mt-1 text-xl font-bold text-orange-600">
              ${resumen.totalInteres.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Tarifa</p>
            <p className="mt-1 text-xl font-bold text-blue-600">
              ${resumen.totalTarifa.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total a Pagar</p>
            <p className="mt-1 text-xl font-bold text-indigo-600">
              ${resumen.totalAPagar.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 size={20} />
            Proyección de Cuotas
          </h2>
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
                <th className="px-6 py-3 text-right">Fecha de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cuotas.map((c) => (
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
    </div>
  )
}
