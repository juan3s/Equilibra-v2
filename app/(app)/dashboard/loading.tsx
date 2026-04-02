export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Row: summary cards + balance chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Summary cards skeleton */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>

        {/* Balance chart skeleton */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="h-4 w-48 rounded bg-muted animate-pulse mb-4" />
          <div className="h-[260px] rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      {/* Variation chart skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-4 w-56 rounded bg-muted animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
