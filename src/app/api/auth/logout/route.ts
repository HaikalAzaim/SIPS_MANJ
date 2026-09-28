import { NextResponse, NextRequest } from 'next/server'
import { destroySession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export async function POST(_request: NextRequest) {
  try {
    await createAuditLog({
      action: 'LOGOUT',
      module: 'AUTH',
      description: 'User logout',
    })
  } catch {}

  await destroySession()

  // Return JSON — client (topbar) handles the redirect via router.push('/login')
  const response = NextResponse.json({ ok: true })
  response.cookies.set('sips-session', '', { maxAge: 0, path: '/' })
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function GET(request: NextRequest) {
  await destroySession()

  // Fallback GET redirect (e.g. direct browser navigation to /api/auth/logout)
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set('sips-session', '', { maxAge: 0, path: '/' })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
