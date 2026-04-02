import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database.types";

/**
 * Cliente de Supabase para uso en Client Components ('use client').
 * Lee las cookies del navegador para mantener la sesión.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
