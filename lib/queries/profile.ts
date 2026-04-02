import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'
import type { ProfileFormValues } from '@/lib/schemas/profile.schema'

type Client = SupabaseClient<Database>

/** Update the authenticated user's profile */
export async function updateProfile(
  supabase: Client,
  userId: string,
  values: ProfileFormValues,
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: values.first_name || null,
      last_name: values.last_name || null,
      gender: values.gender ?? null,
      birth_date: values.birth_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) throw error
}
