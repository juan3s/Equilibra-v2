import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (ex-Middleware) de Equilibra.
 *
 * Responsabilidades:
 * 1. Refrescar la sesión de Supabase en cada request (necesario para SSR).
 * 2. Redirigir usuarios no autenticados que intentan acceder a rutas protegidas.
 * 3. Redirigir usuarios autenticados que visitan /login hacia /dashboard.
 *
 * Next.js 16: el archivo se llama proxy.ts (antes middleware.ts).
 * La función exportada se llama `proxy` (antes `middleware`).
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Paso 1: actualizar cookies en la request
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Paso 2: propagar cookies en la response
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No ejecutar lógica entre createServerClient y getUser.
  // Supabase necesita refrescar el token antes de cualquier redirección.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas protegidas: si no hay sesión → redirigir a /login
  const isAppRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/pockets") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/profile");

  if (isAppRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está autenticado y visita /login → redirigir a /dashboard
  if (pathname === "/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos de imagen
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
