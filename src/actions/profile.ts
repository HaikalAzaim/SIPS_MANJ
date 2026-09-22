'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, hashPassword, verifyPassword } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export async function getProfile() {
  const user = await requireAuth()

  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
      lastLogin: true,
      createdAt: true,
    },
  })
}

export async function updateProfile(data: { name: string; email: string }) {
  const user = await requireAuth()

  if (!data.name || data.name.trim().length < 2) {
    return { error: 'Nama harus minimal 2 karakter' }
  }

  if (!data.email || !data.email.includes('@')) {
    return { error: 'Email tidak valid' }
  }

  // Check email uniqueness
  const existing = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null, NOT: { id: user.id } },
  })
  if (existing) return { error: 'Email sudah digunakan pengguna lain' }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: data.name.trim(), email: data.email.trim() },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'PROFILE',
    recordId: user.id,
    description: `Memperbarui profil`,
  })

  return { success: true }
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const user = await requireAuth()

  if (!data.currentPassword || !data.newPassword) {
    return { error: 'Password lama dan baru wajib diisi' }
  }

  if (data.newPassword.length < 6) {
    return { error: 'Password baru minimal 6 karakter' }
  }

  if (data.newPassword !== data.confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok' }
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  })

  if (!fullUser) return { error: 'User tidak ditemukan' }

  const valid = await verifyPassword(data.currentPassword, fullUser.password)
  if (!valid) return { error: 'Password lama salah' }

  const hashed = await hashPassword(data.newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'PROFILE',
    recordId: user.id,
    description: `Mengubah password`,
  })

  return { success: true }
}
