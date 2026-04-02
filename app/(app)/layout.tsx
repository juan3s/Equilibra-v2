import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { keys } from '@/lib/queries/keys'
import {
  getAccounts,
  getCategories,
  getSubcategories,
  getCurrencies,
} from '@/lib/queries/reference-data'
import { UserProvider } from '@/components/layout/user-provider'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { TopNav } from '@/components/layout/top-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, user } = await verifySession()
  const supabase = await createClient()
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: keys.accounts(userId),
      queryFn: () => getAccounts(supabase, userId),
    }),
    queryClient.prefetchQuery({
      queryKey: keys.categories(),
      queryFn: () => getCategories(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: keys.subcategories(userId),
      queryFn: () => getSubcategories(supabase, userId),
    }),
    queryClient.prefetchQuery({
      queryKey: keys.currencies(),
      queryFn: () => getCurrencies(supabase),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProvider userId={userId} user={user}>
        <div className="flex h-screen overflow-hidden bg-background">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </UserProvider>
    </HydrationBoundary>
  )
}
