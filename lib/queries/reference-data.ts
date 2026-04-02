import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

type Client = SupabaseClient<Database>

export async function getAccounts(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*, banks(id, name, brand)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function getCategories(supabase: Client) {
  const { data, error } = await supabase
    .from('categories')
    .select('*, category_types(slug, name, operation_factor)')
    .order('name')
  if (error) throw error
  return data
}

export async function getSubcategories(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function getCurrencies(supabase: Client) {
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .order('code')
  if (error) throw error
  return data
}
