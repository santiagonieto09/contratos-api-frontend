import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato, MetodoPago } from '@/types'
import { FileText, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([contratoService.listar(), contratoService.metodosPago()])
      .then(([c, m]) => {
        if (cancelled) return
        setContratos(c.contratos)
        setMetodos(m)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const totalValor = contratos.reduce((s, c) => s + c.valorTotal, 0)
  const totalMeses = contratos.reduce((s, c) => s + c.numeroMeses, 0)

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} registrado{contratos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/contratos/nuevo">
          <Button variant="primary" size="sm">
            <Plus size={16} />
            Nuevo contrato
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Total contratos
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-on-surface">
            {contratos.length}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Valor total
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-on-surface tabular-nums">
            ${formatCurrency(totalValor)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Total meses
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-on-surface tabular-nums">
            {totalMeses}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-on-surface">
            Contratos recientes
          </h2>

          {contratos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline-variant/50 p-10 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-outline" />
              <p className="text-sm text-on-surface-variant">
                No tienes contratos aún
              </p>
              <Link to="/contratos/nuevo">
                <Button variant="outline" size="sm" className="mt-4">
                  Crear primer contrato
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {contratos.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/contratos/${c.id}`}
                  className="group flex items-center justify-between rounded-md border border-outline-variant/30 bg-surface-bright px-4 py-3 transition-all duration-150 ease-out-expo hover:border-outline-variant hover:bg-surface-container"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-container text-xs font-medium text-on-primary-container">
                      {c.numeroMeses}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                        {c.numeroContrato}
                      </p>
                      <p className="text-xs text-on-surface-variant tabular-nums">
                        ${formatCurrency(c.valorTotal)}
                        <span className="mx-1.5">&middot;</span>
                        {c.fechaContrato}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={c.metodoPago === 'paypal' ? 'default' : 'secondary'}>
                      {c.metodoPago}
                    </Badge>
                    <ArrowRight
                      size={14}
                      className="text-on-surface-variant opacity-0 transition-all group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {contratos.length > 5 && (
            <Link
              to="/contratos"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Ver todos ({contratos.length})
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

      <div>
          <h2 className="mb-4 text-base font-semibold text-on-surface">
            Métodos de pago
          </h2>
          <div className="space-y-3">
            {metodos.map((m) => (
              <div
                key={m.id}
                className="rounded-md border border-outline-variant/30 bg-surface-bright p-4"
              >
                <p className="text-sm font-medium text-on-surface capitalize">{m.nombre}</p>
                <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
                  {m.descripcion}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-sm bg-data-interest/10 px-2 py-0.5 text-xs font-medium text-data-interest">
                    {m.tasaInteres} interés
                  </span>
                  <span className="rounded-sm bg-data-fee/10 px-2 py-0.5 text-xs font-medium text-data-fee">
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
