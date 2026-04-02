export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Transacciones</h1>

      {/* Filters skeleton */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="ml-auto h-9 w-28 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
          {[80, 160, 120, 140, 120, 100, 80].map((w, i) => (
            <div
              key={i}
              className="h-4 rounded bg-muted animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0"
          >
            {[80, 160, 120, 140, 120, 100, 60].map((w, j) => (
              <div
                key={j}
                className="h-4 rounded bg-muted animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
