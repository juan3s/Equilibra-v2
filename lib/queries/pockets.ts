import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'
import type { PocketMovementFormValues } from '@/lib/schemas/pocket.schema'

type Client = SupabaseClient<Database>

export interface AllocationFilters {
  month: number // 0-11
  year: number
  accountId?: string | null
}

/** List of pocket records for an account — used for form dropdowns */
export async function getPocketsForAccount(supabase: Client, accountId: string) {
  const { data, error } = await supabase
    .from('pockets')
    .select('id, name')
    .eq('bank_account_id', accountId)
    .order('name')
  if (error) throw error
  return data
}

/** Movements table: pocket_allocations filtered by userId + date range + optional account */
export async function getAllocations(
  supabase: Client,
  userId: string,
  filters: AllocationFilters,
) {
  const start = new Date(Date.UTC(filters.year, filters.month, 1)).toISOString()
  const end = new Date(
    Date.UTC(filters.year, filters.month + 1, 0, 23, 59, 59, 999),
  ).toISOString()

  let query = supabase
    .from('pocket_allocations')
    .select(
      `
      id, occurred_at, description, amount, bank_account_id,
      from_pocket_id, to_pocket_id,
      bank_accounts(name, currency_code),
      from_pocket:pockets!from_pocket_id(name),
      to_pocket:pockets!to_pocket_id(name)
    `,
    )
    .eq('user_id', userId)
    .gte('occurred_at', start)
    .lte('occurred_at', end)
    .order('occurred_at', { ascending: false })

  if (filters.accountId) {
    query = query.eq('bank_account_id', filters.accountId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export type AllocationWithRelations = NonNullable<
  Awaited<ReturnType<typeof getAllocations>>
>[number]

/** Create or update a pocket allocation. Pass id to update, omit to create. */
export async function upsertAllocation(
  supabase: Client,
  userId: string,
  values: PocketMovementFormValues,
  id?: string,
) {
  const finalFrom =
    values.movement_type === 'load' ? null : (values.from_pocket_id ?? null)
  const finalTo =
    values.movement_type === 'unload' ? null : (values.to_pocket_id ?? null)

  const payload = {
    ...(id ? { id } : {}),
    user_id: userId,
    occurred_at: new Date(values.occurred_at).toISOString(),
    description: values.description || null,
    bank_account_id: values.bank_account_id,
    from_pocket_id: finalFrom,
    to_pocket_id: finalTo,
    amount: values.amount,
  }

  const { data, error } = await supabase
    .from('pocket_allocations')
    .upsert(payload)
    .select('id')
    .single()

  if (error) throw error
  return data
}

/** Hard delete a pocket allocation */
export async function deleteAllocation(supabase: Client, id: string) {
  const { error } = await supabase
    .from('pocket_allocations')
    .delete()
    .eq('id', id)
  if (error) throw error
}
