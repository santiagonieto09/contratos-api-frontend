import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato } from '@/types'
import { FileText, ArrowRight, Loader2, Search } from 'lucide-react'

export default function ContractList() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    contratoService
      .listar()
      .then((data) => setContratos(data.contratos))
      .catch(() => setError('Error al cargar contratos'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = contratos.filter((c) =>
    c.numeroContrato.toLowerCase().includes(search.toLowerCase())
  )

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Contratos</h1>
          <p className="text-sm text-gray-500">
            {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} registrado
            {contratos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/contratos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          + Nuevo
        </Link>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número de contrato..."
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-gray-500">
            {search ? 'No se encontraron contratos' : 'No tienes contratos aún'}
          </p>
          {!search && (
            <Link
              to="/contratos/nuevo"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Crear contrato <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3 text-center">Meses</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.numeroContrato}</td>
                  <td className="px-4 py-3 text-gray-600">{c.fechaContrato}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${c.valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                      {c.metodoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{c.numeroMeses}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/contratos/${c.id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500"
                    >
                      Ver <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
