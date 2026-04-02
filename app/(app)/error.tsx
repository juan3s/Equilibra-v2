'use client'

import { useEffect } from 'react'

export default function AppError({
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
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
      <h2 className="text-xl font-semibold text-foreground">Algo salió mal</h2>
      <p className="text-muted-foreground text-sm max-w-md">
        {error.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
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
