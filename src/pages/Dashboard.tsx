import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato, MetodoPago } from '@/types'
import {
  FileText,
  PlusCircle,
  BarChart3,
  ArrowRight,
  Wallet,
  Loader2,
} from 'lucide-react'

export default function Dashboard() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([contratoService.listar(), contratoService.metodosPago()])
      .then(([c, m]) => {
        setContratos(c.contratos)
        setMetodos(m)
      })
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  const totalValor = contratos.reduce((s, c) => s + c.valorTotal, 0)
  const totalMeses = contratos.reduce((s, c) => s + c.numeroMeses, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Resumen de tus contratos</p>
        </div>
        <Link
          to="/contratos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <PlusCircle size={18} />
          Nuevo Contrato
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <FileText size={18} />
            Total Contratos
          </div>
          <p className="text-3xl font-bold">{contratos.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Wallet size={18} />
            Valor Total
          </div>
          <p className="text-3xl font-bold">
            ${totalValor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 size={18} />
            Total Meses
          </div>
          <p className="text-3xl font-bold">{totalMeses}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Contratos Recientes</h2>
          {contratos.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center">
              <FileText className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-500">No tienes contratos aún</p>
              <Link
                to="/contratos/nuevo"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Crear primer contrato <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contratos.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/contratos/${c.id}`}
                  className="flex items-center justify-between rounded-xl border bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium">{c.numeroContrato}</p>
                    <p className="text-sm text-gray-500">
                      ${c.valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })} &middot;{' '}
                      {c.numeroMeses} meses
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {c.metodoPago}
                    </span>
                    <p className="mt-1 text-gray-400">{c.fechaContrato}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Métodos de Pago</h2>
          <div className="space-y-3">
            {metodos.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <p className="font-medium capitalize">{m.nombre}</p>
                <p className="mt-1 text-xs text-gray-500">{m.descripcion}</p>
                <div className="mt-2 flex gap-3 text-xs font-medium">
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">
                    {m.tasaInteres} interés
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                    {m.tasaTarifa} tarifa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
