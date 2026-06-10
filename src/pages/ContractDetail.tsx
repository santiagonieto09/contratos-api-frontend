import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contratoService } from '@/services/contratoService'
import type { Contrato, Cuota, ResumenCuotas } from '@/types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

import { formatCurrency } from '@/lib/utils'
import { CuotasTable } from '@/components/CuotasTable'
import { DownloadButton } from '@/components/DownloadButton'
import type { DownloadPayload } from '@/services/downloadService'

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [resumen, setResumen] = useState<ResumenCuotas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([
      contratoService.obtener(id),
      contratoService.obtenerCuotas(id),
    ])
      .then(([c, cu]) => {
        if (cancelled) return
        setContrato(c)
        setCuotas(cu.cuotas)
        setResumen(cu.resumen)
      })
      .catch(() => setError('Error al cargar el contrato'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
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
          <Badge variant={contrato.metodoPago === 'paypal' ? 'default' : 'secondary'} className="mt-2">
            {contrato.metodoPago}
          </Badge>
        </div>
        <DownloadButton
          payload={{
            title: `Contrato ${contrato.numeroContrato}`,
            filename: `contrato-${contrato.numeroContrato}`,
            infoRows: [
              { label: 'Número', value: contrato.numeroContrato },
              { label: 'Fecha', value: contrato.fechaContrato },
              { label: 'Valor Total', value: `$${formatCurrency(contrato.valorTotal)}` },
              { label: 'Plazo', value: `${contrato.numeroMeses} meses` },
              { label: 'Método de pago', value: contrato.metodoPago },
            ],
            summaryRows: resumen
              ? [
                  { label: 'Total Cuotas', value: resumen.totalCuotas.toString(), color: undefined },
                  { label: 'Total Interés', value: resumen.totalInteres.toFixed(2), color: '#D92D20' },
                  { label: 'Total Tarifa', value: resumen.totalTarifa.toFixed(2), color: '#B42318' },
                  { label: 'Total a Pagar', value: resumen.totalAPagar.toFixed(2), color: '#039855' },
                ]
              : [],
            cuotas,
          }}
        />
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
        <CuotasTable cuotas={cuotas} />
      </div>
    </div>
  )
}
