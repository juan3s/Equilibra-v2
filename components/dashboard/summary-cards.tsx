import type { CurrencyTotals } from '@/lib/queries/dashboard'

interface SummaryCardsProps {
  data: CurrencyTotals
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const currencies = Object.keys(data).sort()

  if (currencies.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">
        No hay movimientos este mes.
      </p>
    )
  }

  return (
    <div>
      {currencies.map((currency, idx) => {
        const { income, expense } = data[currency]
        const fmt = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        })

        return (
          <div
            key={currency}
            className={idx > 0 ? 'border-t border-border pt-3 mt-3' : ''}
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {currency}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground text-xs mb-1">Ingresos</p>
                <p
                  className="text-green-600 text-lg font-semibold truncate"
                  title={fmt.format(income)}
                >
                  {fmt.format(income)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground text-xs mb-1">Gastos</p>
                <p
                  className="text-red-600 text-lg font-semibold truncate"
                  title={fmt.format(expense)}
                >
                  {fmt.format(expense)}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
