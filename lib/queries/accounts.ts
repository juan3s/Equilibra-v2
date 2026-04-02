import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'
import type { AccountFormValues } from '@/lib/schemas/account.schema'

type Client = SupabaseClient<Database>

/** All available banks — used in the account form dropdown */
export async function getBanks(supabase: Client) {
  const { data, error } = await supabase
    .from('banks')
    .select('id, name, kind')
    .order('name')
  if (error) throw error
  return data
}

/** Create a new bank account for the user */
export async function createAccount(
  supabase: Client,
  userId: string,
  values: AccountFormValues,
) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert({
      user_id: userId,
      name: values.name,
      description: values.description || null,
      account_type: values.account_type,
      account_number: values.account_number || null,
      currency_code: values.currency_code,
      initial_balance: values.initial_balance,
      bank_id: values.bank_id,
    })
    .select('id')
    .single()
  if (error) throw error
  return data
}

/** Update an existing bank account */
export async function updateAccount(
  supabase: Client,
  id: string,
  values: AccountFormValues,
) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .update({
      name: values.name,
      description: values.description || null,
      account_type: values.account_type,
      account_number: values.account_number || null,
      currency_code: values.currency_code,
      initial_balance: values.initial_balance,
      bank_id: values.bank_id,
    })
    .eq('id', id)
    .select('id')
    .single()
  if (error) throw error
  return data
}

/**
 * Soft-delete a bank account by setting is_active = false.
 * getAccounts() always filters is_active = true, so this removes
 * the account from all dropdowns (transactions, pockets) immediately.
 */
export async function deleteAccount(supabase: Client, id: string) {
  const { error } = await supabase
    .from('bank_accounts')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}
