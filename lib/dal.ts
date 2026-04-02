import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifica la sesión activa del usuario.
 * Memoizado con React cache() para evitar múltiples llamadas
 * durante el mismo render pass del servidor.
 *
 * - Si no hay sesión → redirige a /login
 * - Si hay sesión → retorna userId y session completa
 *
 * Úsalo en layouts y pages del grupo (app) para proteger rutas.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    redirect("/login");
  }

  return {
    isAuthenticated: true,
    userId: session.user.id,
    user: session.user,
    session,
  };
});

/**
 * Obtiene el perfil del usuario autenticado.
 * Llama a verifySession internamente — seguro de usar en cualquier Server Component.
 */
export const getUserProfile = cache(async () => {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return profile;
});
