import { NextResponse, NextRequest } from 'next/server'
import { destroySession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    await createAuditLog({
      action: 'LOGOUT',
      module: 'AUTH',
      description: 'User logout',
    })
  } catch {}

  await destroySession()

  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set('sips-session', '', { maxAge: 0, path: '/' })
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function GET(request: NextRequest) {
  await destroySession()

  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set('sips-session', '', { maxAge: 0, path: '/' })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
