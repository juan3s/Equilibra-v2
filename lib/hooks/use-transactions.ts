'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionFilters,
} from '@/lib/queries/transactions'
import type { TransactionFormValues } from '@/lib/schemas/transaction.schema'
import { useCurrentUser } from '@/components/layout/user-provider'

export function useFiltersFromParams(): TransactionFilters {
  const searchParams = useSearchParams()
  const now = new Date()

  return {
    month: searchParams.has('month')
      ? parseInt(searchParams.get('month')!)
      : now.getMonth(),
    year: searchParams.has('year')
      ? parseInt(searchParams.get('year')!)
      : now.getFullYear(),
    categoryIds: searchParams.getAll('category'),
    subcategoryIds: searchParams.getAll('subcategory'),
  }
}

export function useTransactions() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const filters = useFiltersFromParams()

  return useQuery({
    queryKey: keys.transactions(userId, filters),
    queryFn: () => getTransactions(supabase, userId, filters),
  })
}

export function useTransactionMutations() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['transactions', userId] })

  const createMutation = useMutation({
    mutationFn: (values: TransactionFormValues) =>
      createTransaction(supabase, userId, values),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TransactionFormValues }) =>
      updateTransaction(supabase, id, values),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(supabase, id),
    onSuccess: invalidate,
  })

  return { createMutation, updateMutation, deleteMutation }
}
