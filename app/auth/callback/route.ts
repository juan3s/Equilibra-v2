import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Route Handler para el flujo PKCE de Supabase.
 *
 * Supabase redirige aquí después de confirmar un email o reset de contraseña:
 *   /auth/callback?code=xxx&next=/ruta-destino
 *
 * Intercambia el `code` por una sesión activa y redirige al usuario.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si falla el intercambio, redirigir a login con mensaje de error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
