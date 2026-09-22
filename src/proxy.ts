import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sips-secret-key')
const COOKIE_NAME = 'sips-session'

const PUBLIC_PATHS = ['/login']

// Routes that require SUPER_ADMIN role — ADMIN will be redirected to /dashboard
const SUPER_ADMIN_ONLY_PATHS = [
  '/laporan',
  '/pelanggaran/kategori',
  '/kenaikan-kelas',
  '/tahun-ajaran',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // ── Unauthenticated user trying to access protected route ──
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Validate token if present ──
  if (token) {
    let payload: { role?: string } = {}
    try {
      const result = await jwtVerify(token, JWT_SECRET)
      payload = result.payload as { role?: string }
    } catch {
      // Token invalid/expired → clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return response
    }

    // Authenticated user trying to access login → send to dashboard
    if (isPublicPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // ── Role-based access control ──
    // ADMIN role cannot access SUPER_ADMIN_ONLY_PATHS
    const isSuperAdminOnly = SUPER_ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))
    if (isSuperAdminOnly && payload.role !== 'SUPER_ADMIN') {
      const url = new URL('/dashboard', request.url)
      url.searchParams.set('forbidden', '1')
      return NextResponse.redirect(url)
    }
  }

  // ── Add anti-cache headers for protected pages ──
  const response = NextResponse.next()
  if (!isPublicPath) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

