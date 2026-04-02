import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

type Client = SupabaseClient<Database>

// ─── Shared types ────────────────────────────────────────────────────────────

export type CurrencyTotals = {
  [currency: string]: { income: number; expense: number }
}

export type BalanceMonthPoint = {
  monthKey: string // YYYY-MM
  label: string    // "Ene 2025"
  income: number
  expense: number
}

export type BalanceChartData = {
  currencies: string[]
  byCurrency: { [currency: string]: BalanceMonthPoint[] }
}

export type VariationMonthPoint = {
  monthKey: string
  label: string
}

export type VariationChartData = {
  currencies: string[]
  visualMonths: VariationMonthPoint[]
  // raw amounts: dataByCurrency[currency][category][monthKey] = totalAmount
  dataByCurrency: {
    [currency: string]: {
      [category: string]: {
        [monthKey: string]: number
      }
    }
  }
}

// ─── Query functions ──────────────────────────────────────────────────────────

/**
 * Summary cards: income/expense totals for the current month, grouped by currency.
 */
export async function getSummaryCards(
  supabase: Client,
  userId: string,
): Promise<CurrencyTotals> {
  const now = new Date()
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString()
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)).toISOString()

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, currency_code, categories(category_types(operation_factor))')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('occurred_at', start)
    .lte('occurred_at', end)

  if (error) throw error

  const result: CurrencyTotals = {}

  for (const tx of data ?? []) {
    const currency = tx.currency_code || 'COP'
    const amount = Number(tx.amount) || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factor: number = (tx.categories as any)?.category_types?.operation_factor ?? 0

    if (!result[currency]) result[currency] = { income: 0, expense: 0 }
    if (factor > 0) result[currency].income += amount
    else if (factor < 0) result[currency].expense += amount
  }

  return result
}

/**
 * Balance chart: income/expense per month for the last 12 months, by currency.
 * Returns data ready for Recharts BarChart (flat array per currency).
 */
export async function getBalanceChartData(
  supabase: Client,
  userId: string,
): Promise<BalanceChartData> {
  const now = new Date()
  const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 11, 1))
  const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999))

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, occurred_at, currency_code, categories(category_types(operation_factor))')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('occurred_at', startDate.toISOString())
    .lte('occurred_at', endDate.toISOString())
    .order('occurred_at', { ascending: true })

  if (error) throw error

  // Build the 12-month labels array (always full even if no data)
  const monthDefs: VariationMonthPoint[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 11 + i, 1))
    const key = d.toISOString().slice(0, 7)
    const raw = d.toLocaleString('es-CO', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    const label = raw.charAt(0).toUpperCase() + raw.slice(1)
    monthDefs.push({ monthKey: key, label })
  }

  // Accumulate raw sums per currency → month
  const raw: { [currency: string]: { [monthKey: string]: { income: number; expense: number } } } = {}

  for (const tx of data ?? []) {
    const currency = tx.currency_code || 'COP'
    const monthKey = (tx.occurred_at as string).slice(0, 7)
    const amount = Number(tx.amount) || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factor: number = (tx.categories as any)?.category_types?.operation_factor ?? 0

    if (!raw[currency]) raw[currency] = {}
    if (!raw[currency][monthKey]) raw[currency][monthKey] = { income: 0, expense: 0 }
    if (factor > 0) raw[currency][monthKey].income += amount
    else if (factor < 0) raw[currency][monthKey].expense += amount
  }

  const currencies = Object.keys(raw).sort()
  const byCurrency: { [currency: string]: BalanceMonthPoint[] } = {}

  for (const currency of currencies) {
    byCurrency[currency] = monthDefs.map(({ monthKey, label }) => ({
      monthKey,
      label,
      income: raw[currency]?.[monthKey]?.income ?? 0,
      expense: raw[currency]?.[monthKey]?.expense ?? 0,
    }))
  }

  return { currencies, byCurrency }
}

/**
 * Variation chart: amounts per currency → category → month for the last 13 months.
 * (12 visual months + 1 base month for MoM % calculation.)
 * Percentage calculation is done in the component.
 */
export async function getVariationChartData(
  supabase: Client,
  userId: string,
): Promise<VariationChartData> {
  const now = new Date()
  // 13 months back: 12 visual + 1 base for calculation
  const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 12, 1))
  const endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999))

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, occurred_at, currency_code, categories(name)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('occurred_at', startDate.toISOString())
    .lte('occurred_at', endDate.toISOString())
    .order('occurred_at', { ascending: true })

  if (error) throw error

  // 12 visual months (months 1-12 of the 13-month window)
  const visualMonths: VariationMonthPoint[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth() + 1 + i, 1))
    const key = d.toISOString().slice(0, 7)
    const raw = d.toLocaleString('es-CO', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    const label = raw.charAt(0).toUpperCase() + raw.slice(1)
    visualMonths.push({ monthKey: key, label })
  }

  const dataByCurrency: VariationChartData['dataByCurrency'] = {}

  for (const tx of data ?? []) {
    const currency = tx.currency_code || 'COP'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catName: string = (tx.categories as any)?.name ?? 'Otros'
    const monthKey = (tx.occurred_at as string).slice(0, 7)
    const amount = Number(tx.amount) || 0

    if (!dataByCurrency[currency]) dataByCurrency[currency] = {}
    if (!dataByCurrency[currency][catName]) dataByCurrency[currency][catName] = {}
    if (!dataByCurrency[currency][catName][monthKey]) dataByCurrency[currency][catName][monthKey] = 0
    dataByCurrency[currency][catName][monthKey] += amount
  }

  const currencies = Object.keys(dataByCurrency).sort()

  return { currencies, visualMonths, dataByCurrency }
}
