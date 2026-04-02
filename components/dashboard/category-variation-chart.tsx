'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import { getVariationChartData } from '@/lib/queries/dashboard'
import { useCurrentUser } from '@/components/layout/user-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Compute MoM % for a category across visualMonths
function computeVariation(
  catData: { [monthKey: string]: number },
  visualMonths: { monthKey: string; label: string }[],
) {
  return visualMonths.map(({ monthKey, label }) => {
    // Previous month key
    const [y, m] = monthKey.split('-').map(Number)
    const prevDate = new Date(Date.UTC(y, m - 2, 1)) // m is 1-based, -1 for 0-based, -1 for prev
    const prevKey = prevDate.toISOString().slice(0, 7)

    const current = Math.abs(catData[monthKey] ?? 0)
    const prev = Math.abs(catData[prevKey] ?? 0)

    let pct = 0
    if (prev === 0) {
      pct = current > 0 ? 100 : 0
    } else {
      pct = ((current - prev) / prev) * 100
    }

    const color = pct > 0 ? '#10b981' : pct < 0 ? '#f43f5e' : '#cbd5e1'

    return { label, pct: Math.max(-100, Math.min(100, pct)), color }
  })
}

export function CategoryVariationChart() {
  const { userId } = useCurrentUser()
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: keys.dashboardVariation(userId),
    queryFn: () => getVariationChartData(supabase, userId),
  })

  const currencies = data?.currencies ?? []
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const currency = selectedCurrency ?? currencies[0] ?? null
  const currencyData = currency ? (data?.dataByCurrency[currency] ?? {}) : {}
  const allCategories = Object.keys(currencyData).sort()

  // Initialise selectedCategories when data loads or currency changes
  useEffect(() => {
    if (allCategories.length > 0) {
      setSelectedCategories(new Set(allCategories))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, isLoading])

  // Close filter dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Cargando...
      </div>
    )
  }

  if (currencies.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No hay datos suficientes para mostrar variaciones.
      </div>
    )
  }

  const visibleCategories = allCategories.filter((c) => selectedCategories.has(c))

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {currencies.length > 1 && (
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
        )}

        {/* Category filter */}
        <div ref={filterRef} className="relative ml-auto">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm h-8 whitespace-nowrap transition-colors hover:bg-muted/40"
          >
            Categorías
            <span className="text-xs text-muted-foreground">
              ({selectedCategories.size}/{allCategories.length})
            </span>
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-52 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
              <label className="flex items-center gap-2 px-3 py-2 border-b border-border hover:bg-muted/40 cursor-pointer text-xs font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selectedCategories.size === allCategories.length}
                  onChange={(e) =>
                    setSelectedCategories(
                      e.target.checked ? new Set(allCategories) : new Set(),
                    )
                  }
                  className="rounded"
                />
                Todas
              </label>
              {allCategories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted/40 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat)}
                    onChange={(e) => {
                      setSelectedCategories((prev) => {
                        const next = new Set(prev)
                        if (e.target.checked) next.add(cat)
                        else next.delete(cat)
                        return next
                      })
                    }}
                    className="rounded"
                  />
                  <span className="truncate">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Small multiples grid */}
      {visibleCategories.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Selecciona al menos una categoría.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleCategories.map((cat) => {
            const chartData = computeVariation(
              currencyData[cat] ?? {},
              data?.visualMonths ?? [],
            )

            return (
              <div
                key={cat}
                className="flex flex-col bg-muted/20 rounded-xl p-3 border border-border"
              >
                <p
                  className="font-semibold text-foreground text-xs truncate mb-2"
                  title={cat}
                >
                  {cat}
                </p>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="20%">
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 8 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[-100, 100]} hide />
                      <Tooltip
                        formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Variación']}
                        contentStyle={{ fontSize: 11, borderRadius: 6 }}
                        labelStyle={{ fontSize: 10 }}
                      />
                      <Bar dataKey="pct" radius={[2, 2, 0, 0]} maxBarSize={20}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
