/**
 * Centralized query key factory.
 * ALL query keys must be defined here — never inline.
 * Ensures consistent cache invalidation across server prefetch and client queries.
 */
export const keys = {
  // Reference data
  accounts: (userId: string) => ['accounts', userId] as const,
  banks: () => ['banks'] as const,
  categories: () => ['categories'] as const,
  subcategories: (userId: string) => ['subcategories', userId] as const,
  currencies: () => ['currencies'] as const,

  // Transactions (filters become part of the key for per-filter cache entries)
  transactions: (userId: string, filters?: object) =>
    filters !== undefined
      ? (['transactions', userId, filters] as const)
      : (['transactions', userId] as const),

  // Dashboard aggregations (3 distinct queries)
  dashboardSummary: (userId: string) => ['dashboard', userId, 'summary'] as const,
  dashboardBalance: (userId: string) => ['dashboard', userId, 'balance'] as const,
  dashboardVariation: (userId: string) => ['dashboard', userId, 'variation'] as const,

  // Pockets (keyed by accountId — each account has its own cache entry)
  pockets: (accountId: string) => ['pockets', accountId] as const,
  pocketAllocations: (pocketId: string) => ['pocket-allocations', pocketId] as const,

  // Allocations list (movements table, keyed by userId + filters)
  allocations: (userId: string, filters?: object) =>
    filters !== undefined
      ? (['allocations', userId, filters] as const)
      : (['allocations', userId] as const),
}
