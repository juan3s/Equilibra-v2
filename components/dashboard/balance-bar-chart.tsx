'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import { getBalanceChartData } from '@/lib/queries/dashboard'
import { useCurrentUser } from '@/components/layout/user-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function formatCompact(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatFull(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function BalanceBarChart() {
  const { userId } = useCurrentUser()
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: keys.dashboardBalance(userId),
    queryFn: () => getBalanceChartData(supabase, userId),
  })

  const currencies = data?.currencies ?? []
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

  const currency = selectedCurrency ?? currencies[0] ?? null
  const chartData = currency ? (data?.byCurrency[currency] ?? []) : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Cargando...
      </div>
    )
  }

  if (currencies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No hay datos para los últimos 12 meses.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {currencies.length > 1 && (
        <div className="flex justify-end">
          <Select
            value={currency ?? undefined}
            onValueChange={(v) => setSelectedCurrency(v)}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="20%" barGap={4}>
          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="2 4" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompact(v, currency ?? 'COP')}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value, name) => [
              formatFull(Number(value ?? 0), currency ?? 'COP'),
              name === 'income' ? 'Ingresos' : 'Gastos',
            ]}
            labelStyle={{ fontSize: 12 }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            formatter={(value) => (value === 'income' ? 'Ingresos' : 'Gastos')}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
