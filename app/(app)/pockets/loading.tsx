export default function PocketsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Account selector + period navigation skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
          {[80, 140, 120, 120, 120, 100, 80, 60].map((w, i) => (
            <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
            {[80, 140, 120, 120, 120, 100, 80, 60].map((w, j) => (
              <div key={j} className="h-4 rounded bg-muted animate-pulse" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
