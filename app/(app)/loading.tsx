export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
