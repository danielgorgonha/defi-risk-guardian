import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check if user is authenticated by looking at cookies or headers
  // For now, we'll let the client-side handle authentication logic
  // This middleware is mainly for future enhancements
  
  // Redirect from old dashboard route to new one
  if (pathname === '/' && request.headers.get('referer')?.includes('/dashboard')) {
    // If coming from dashboard, allow access to landing page
    return NextResponse.next()
  }
  
  // Allow all other requests to proceed
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
