export default function ProfileLoading() {
  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
        </div>

        {/* First name + Last name grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Birth date */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
          <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Submit button */}
        <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  )
}
