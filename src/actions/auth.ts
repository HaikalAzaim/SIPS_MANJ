'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'
import { createAuditLog } from '@/lib/audit'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validation = loginSchema.safeParse({ email, password })
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
  })

  if (!user || !user.status) {
    return { error: 'Email atau password salah' }
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { error: 'Email atau password salah' }
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  await createAuditLog({
    action: 'LOGIN',
    module: 'AUTH',
    description: `User ${user.name} berhasil login`,
  })

  return { success: true, role: user.role }
}
