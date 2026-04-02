'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <h2 className="text-xl font-semibold text-foreground">Error al cargar el dashboard</h2>
      <p className="text-muted-foreground text-sm max-w-md">
        No se pudieron cargar los datos del dashboard. Verifica tu conexión e intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
