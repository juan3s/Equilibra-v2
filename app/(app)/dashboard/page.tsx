import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { keys } from '@/lib/queries/keys'
import {
  getSummaryCards,
  getBalanceChartData,
  getVariationChartData,
} from '@/lib/queries/dashboard'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import {
  BalanceBarChartLazy,
  CategoryVariationChartLazy,
} from '@/components/dashboard/chart-wrappers'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const { userId } = await verifySession()
  const supabase = await createClient()
  const queryClient = new QueryClient()

  // Prefetch all 3 dashboard queries in parallel
  const [summaryData] = await Promise.all([
    getSummaryCards(supabase, userId),
    queryClient.prefetchQuery({
      queryKey: keys.dashboardBalance(userId),
      queryFn: () => getBalanceChartData(supabase, userId),
    }),
    queryClient.prefetchQuery({
      queryKey: keys.dashboardVariation(userId),
      queryFn: () => getVariationChartData(supabase, userId),
    }),
  ])

  const now = new Date()
  const monthName = now.toLocaleString('es-CO', { month: 'long' })
  const monthLabel =
    monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + now.getFullYear()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-6">
        {/* Row: summary cards + balance chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Summary cards — pure Server Component, no client JS */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Resumen {monthLabel}
            </h2>
            <SummaryCards data={summaryData} />
          </div>

          {/* Balance bar chart — lazy-loaded, no SSR */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Balance últimos 12 meses
            </h2>
            <BalanceBarChartLazy />
          </div>
        </div>

        {/* Row: category variation small multiples */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Variación mensual por categoría
          </h2>
          <CategoryVariationChartLazy />
        </div>
      </div>
    </HydrationBoundary>
  )
}
