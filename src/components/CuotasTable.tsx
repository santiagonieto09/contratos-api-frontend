import type { Cuota } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CuotasTableProps {
  cuotas: Cuota[]
  showFecha?: boolean
}

export function CuotasTable({ cuotas, showFecha = true }: CuotasTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-bright">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/30 bg-surface-low">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">#</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Valor base</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Interés</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Tarifa</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Total</th>
            {showFecha && (
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">Fecha</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {cuotas.map((c) => (
            <tr
              key={c.numeroCuota}
              className="transition-colors duration-150 ease-out-expo hover:bg-surface-container"
            >
              <td className="px-4 py-3 font-medium text-on-surface tabular-nums">{c.numeroCuota}</td>
              <td className="px-4 py-3 text-right text-on-surface tabular-nums">${formatCurrency(c.valorBase)}</td>
              <td className="px-4 py-3 text-right text-data-interest tabular-nums">${formatCurrency(c.interes)}</td>
              <td className="px-4 py-3 text-right text-data-fee tabular-nums">${formatCurrency(c.tarifaPago)}</td>
              <td className="px-4 py-3 text-right font-medium text-data-total tabular-nums">${formatCurrency(c.total)}</td>
              {showFecha && (
                <td className="px-4 py-3 text-right text-on-surface-variant tabular-nums">{c.fechaPago}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}