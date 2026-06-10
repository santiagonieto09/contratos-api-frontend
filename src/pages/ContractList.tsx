import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato } from '@/types'
import { FileText, ArrowRight, Loader2, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearch } from '@/hooks/useSearch'
import { formatCurrency } from '@/lib/utils'

export default function ContractList() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const { query: search, setQuery: setSearch, filtered } = useSearch(contratos, (c) => c.numeroContrato)

  useEffect(() => {
    let cancelled = false
    contratoService
      .listar()
      .then((data) => {
        if (!cancelled) setContratos(data.contratos)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Mis contratos
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} registrado{contratos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/contratos/nuevo">
          <Button variant="primary" size="sm">
            <Plus size={16} />
            Nuevo
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <label htmlFor="search-contrato" className="sr-only">Buscar contrato</label>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          id="search-contrato"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar contrato..."
          className="h-9 w-full rounded-md border border-outline bg-surface-bright pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all duration-150 ease-out-expo focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant/50 p-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-outline" />
          <p className="text-sm text-on-surface-variant">
            {search ? 'No se encontraron contratos' : 'No tienes contratos aún'}
          </p>
          {!search && (
            <Link to="/contratos/nuevo">
              <Button variant="outline" size="sm" className="mt-4">
                Crear contrato
                <ArrowRight size={14} />
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-bright">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-low">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Número
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Valor total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Método
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Meses
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors duration-150 ease-out-expo hover:bg-surface-container"
                >
                  <td className="px-4 py-3.5 font-medium text-on-surface">
                    {c.numeroContrato}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant">
                    {c.fechaContrato}
                  </td>
                    <td className="px-4 py-3.5 text-right font-medium text-on-surface tabular-nums">
                      ${formatCurrency(c.valorTotal)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={c.metodoPago === 'paypal' ? 'default' : 'secondary'}>
                      {c.metodoPago}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center tabular-nums">
                    {c.numeroMeses}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/contratos/${c.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      Ver detalle
                      <ArrowRight size={14} />
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
