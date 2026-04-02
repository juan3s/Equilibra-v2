"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wrapper de providers client-side.
 * Se monta una sola vez en el root layout.
 *
 * - QueryClientProvider: habilita TanStack Query en toda la app
 * - ReactQueryDevtools: visible solo en desarrollo
 */
export function Providers({ children }: ProvidersProps) {
  // useState garantiza que el QueryClient no se recree en cada render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Datos se consideran frescos por 30 segundos
            staleTime: 30 * 1000,
            // Reintentar solo 1 vez en caso de error
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
