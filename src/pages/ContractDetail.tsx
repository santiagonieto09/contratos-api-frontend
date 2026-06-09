import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato, Cuota, ResumenCuotas } from '@/types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

function formatCurrency(n: number) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 2 })
}

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
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-6">
          <Skeleton className="h-20 w-40" />
          <Skeleton className="h-20 w-40" />
          <Skeleton className="h-20 w-40" />
          <Skeleton className="h-20 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !contrato) {
    return (
      <div className="rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
        {error || 'Contrato no encontrado'}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link
        to="/contratos"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a contratos
      </Link>

      {/* Contract header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            {contrato.numeroContrato}
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Creado el {contrato.creadoEn}
          </p>
        </div>
        <Badge variant={contrato.metodoPago === 'paypal' ? 'default' : 'secondary'}>
          {contrato.metodoPago}
        </Badge>
      </div>

      {/* Contract info row */}
      <div className="flex flex-wrap gap-x-10 gap-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Valor total
          </p>
          <p className="mt-0.5 text-xl font-semibold text-on-surface tabular-nums">
            ${formatCurrency(contrato.valorTotal)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Fecha contrato
          </p>
          <p className="mt-0.5 text-xl font-semibold text-on-surface">
            {contrato.fechaContrato}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Plazo
          </p>
          <p className="mt-0.5 text-xl font-semibold text-on-surface tabular-nums">
            {contrato.numeroMeses} meses
          </p>
        </div>
      </div>

      {/* Summary blocks */}
      {resumen && (
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Total cuotas
            </p>
            <p className="mt-0.5 text-xl font-semibold text-on-surface tabular-nums">
              {resumen.totalCuotas}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Total interés
            </p>
            <p className="mt-0.5 text-xl font-semibold text-data-interest tabular-nums">
              ${formatCurrency(resumen.totalInteres)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Total tarifa
            </p>
            <p className="mt-0.5 text-xl font-semibold text-data-fee tabular-nums">
              ${formatCurrency(resumen.totalTarifa)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Total a pagar
            </p>
            <p className="mt-0.5 text-xl font-semibold text-data-total tabular-nums">
              ${formatCurrency(resumen.totalAPagar)}
            </p>
          </div>
        </div>
      )}

      {/* Installments table */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-on-surface">
          Proyección de cuotas
        </h2>
        <div className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-bright">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-low">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  #
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Valor base
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Interés
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Tarifa
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Fecha de pago
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {cuotas.map((c) => (
                <tr
                  key={c.numeroCuota}
                  className="transition-colors duration-150 ease-out-expo hover:bg-surface-container"
                >
                  <td className="px-4 py-3 font-medium text-on-surface tabular-nums">
                    {c.numeroCuota}
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface tabular-nums">
                    ${formatCurrency(c.valorBase)}
                  </td>
                  <td className="px-4 py-3 text-right text-data-interest tabular-nums">
                    ${formatCurrency(c.interes)}
                  </td>
                  <td className="px-4 py-3 text-right text-data-fee tabular-nums">
                    ${formatCurrency(c.tarifaPago)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-data-total tabular-nums">
                    ${formatCurrency(c.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface-variant tabular-nums">
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
