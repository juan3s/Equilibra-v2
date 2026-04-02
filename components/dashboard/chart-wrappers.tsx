'use client'

import dynamic from 'next/dynamic'

export const BalanceBarChartLazy = dynamic(
  () => import('./balance-bar-chart').then((m) => m.BalanceBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Cargando...
      </div>
    ),
  },
)

export const CategoryVariationChartLazy = dynamic(
  () => import('./category-variation-chart').then((m) => m.CategoryVariationChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Cargando...
      </div>
    ),
  },
)
