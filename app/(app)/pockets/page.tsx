import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { keys } from '@/lib/queries/keys'
import { getAllocations, type AllocationFilters } from '@/lib/queries/pockets'
import { PocketsPageClient } from '@/components/pockets/pockets-page-client'

export const metadata: Metadata = {
  title: 'Bolsillos',
}

export default async function PocketsPage() {
  const { userId } = await verifySession()
  const supabase = await createClient()

  const now = new Date()
  const filters: AllocationFilters = {
    month: now.getMonth(),
    year: now.getFullYear(),
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: keys.allocations(userId, filters),
    queryFn: () => getAllocations(supabase, userId, filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PocketsPageClient />
    </HydrationBoundary>
  )
}
