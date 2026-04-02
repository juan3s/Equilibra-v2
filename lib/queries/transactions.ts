import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'
import type { TransactionFormValues } from '@/lib/schemas/transaction.schema'

type Client = SupabaseClient<Database>

export interface TransactionFilters {
  month: number // 0-11
  year: number
  categoryIds: string[]
  subcategoryIds: string[]
}

export async function getTransactions(
  supabase: Client,
  userId: string,
  filters: TransactionFilters,
) {
  const start = new Date(filters.year, filters.month, 1).toISOString()
  const end = new Date(filters.year, filters.month + 1, 0, 23, 59, 59, 999).toISOString()

  let query = supabase
    .from('transactions')
    .select(`
      id, occurred_at, description, amount, currency_code,
      bank_account_id, category_id, subcategory_id,
      bank_accounts(id, name),
      categories(id, name, category_types(operation_factor)),
      subcategories(id, name)
    `)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('occurred_at', start)
    .lte('occurred_at', end)
    .order('occurred_at', { ascending: false })

  if (filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds)
  }

  if (filters.subcategoryIds.length > 0) {
    query = query.in('subcategory_id', filters.subcategoryIds)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export type TransactionWithRelations = NonNullable<
  Awaited<ReturnType<typeof getTransactions>>
>[number]

export async function createTransaction(
  supabase: Client,
  userId: string,
  values: TransactionFormValues,
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      occurred_at: new Date(values.occurred_at).toISOString(),
      description: values.description || null,
      amount: values.amount,
      currency_code: values.currency_code,
      bank_account_id: values.bank_account_id,
      category_id: values.category_id,
      subcategory_id: values.subcategory_id || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTransaction(
  supabase: Client,
  id: string,
  values: TransactionFormValues,
) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      occurred_at: new Date(values.occurred_at).toISOString(),
      description: values.description || null,
      amount: values.amount,
      currency_code: values.currency_code,
      bank_account_id: values.bank_account_id,
      category_id: values.category_id,
      subcategory_id: values.subcategory_id || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTransaction(supabase: Client, id: string) {
  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
