import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { keys } from '@/lib/queries/keys'
import { getTransactions, type TransactionFilters } from '@/lib/queries/transactions'
import { TransactionFilters as TransactionFiltersBar } from '@/components/transactions/transaction-filters'
import { TransactionsTable } from '@/components/transactions/transactions-table'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { BulkUploadModal } from '@/components/transactions/bulk-upload-modal'

export const metadata: Metadata = {
  title: 'Transacciones',
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const { userId } = await verifySession()
  const supabase = await createClient()

  const now = new Date()
  const filters: TransactionFilters = {
    month:
      params.month !== undefined ? parseInt(String(params.month)) : now.getMonth(),
    year:
      params.year !== undefined ? parseInt(String(params.year)) : now.getFullYear(),
    categoryIds: params.category
      ? Array.isArray(params.category)
        ? params.category
        : [params.category]
      : [],
    subcategoryIds: params.subcategory
      ? Array.isArray(params.subcategory)
        ? params.subcategory
        : [params.subcategory]
      : [],
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: keys.transactions(userId, filters),
    queryFn: () => getTransactions(supabase, userId, filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-6">Transacciones</h1>
        <Suspense>
          <TransactionFiltersBar />
          <TransactionsTable />
          <TransactionForm />
          <BulkUploadModal />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}
