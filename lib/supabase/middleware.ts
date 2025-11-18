import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Check if Supabase env vars exist
  const hasEnvVars = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // If the env vars are not set, skip middleware check
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // Permitir acceso a assets sin autenticación
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/assets') ||
    request.nextUrl.pathname.startsWith('/api') || // APIs públicas
    request.nextUrl.pathname.includes('.') // archivos estáticos
  ) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not run code between createServerClient and getClaims()
  const { data } = await supabase.auth.getClaims();

  // Rutas públicas (sin autenticación)
  const publicRoutes = [
    '/login',
    '/auth/callback',
    '/auth/signout',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Manejar la ruta raíz '/'
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    if (data) {
      // Si está autenticado, redirigir a dashboard
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    } else {
      // Si no está autenticado, redirigir a login
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Si no está autenticado y no es ruta pública, redirigir a login
  if (!data && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si está autenticado y trata de acceder a /login, redirigir al dashboard
  if (data && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
