'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import {
  getAccounts,
  getCategories,
  getSubcategories,
  getCurrencies,
} from '@/lib/queries/reference-data'
import { useCurrentUser } from '@/components/layout/user-provider'

export function useAccounts() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  return useQuery({
    queryKey: keys.accounts(userId),
    queryFn: () => getAccounts(supabase, userId),
  })
}

export function useCategories() {
  const supabase = createClient()
  return useQuery({
    queryKey: keys.categories(),
    queryFn: () => getCategories(supabase),
  })
}

export function useSubcategories() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  return useQuery({
    queryKey: keys.subcategories(userId),
    queryFn: () => getSubcategories(supabase, userId),
  })
}

export function useCurrencies() {
  const supabase = createClient()
  return useQuery({
    queryKey: keys.currencies(),
    queryFn: () => getCurrencies(supabase),
  })
}
