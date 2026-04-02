import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database.types";

/**
 * Cliente de Supabase para uso en Server Components, Route Handlers y Server Actions.
 * Lee y escribe cookies del servidor para mantener la sesión.
 *
 * IMPORTANTE: Debe llamarse dentro de un contexto de request (no a nivel módulo).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll puede fallar en Server Components de solo lectura.
            // El cliente proxy/middleware se encarga de refrescar la sesión.
          }
        },
      },
    }
  );
}
