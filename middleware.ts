import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/']

// Rutas que solo pueden acceder usuarios no autenticados
const authRoutes = ['/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir acceso a archivos estáticos y rutas de API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/logos') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  const token = request.cookies.get('auth-token')?.value

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) && pathname !== '/auth'
  )
  
  // Verificar si es una ruta de autenticación
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Si es una ruta protegida y no hay token, redirigir a auth
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Si hay token, verificarlo
  if (token) {
    const decoded = verifyToken(token)
    
    // Si el token es inválido y está en ruta protegida, redirigir a auth
    if (!decoded && isProtectedRoute) {
      const response = NextResponse.redirect(new URL('/auth', request.url))
      response.cookies.delete('auth-token')
      return response
    }
    
    // Si el token es válido y está en ruta de auth, redirigir al dashboard
    if (decoded && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logos|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
}
