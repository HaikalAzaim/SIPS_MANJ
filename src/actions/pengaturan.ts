'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireSuperAdmin } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { userSchema, thresholdSchema } from '@/lib/schemas'
import bcrypt from 'bcryptjs'

// ─── User Management ──────────────────────────────────────────
export async function getUserList(params: {
  page?: number
  limit?: number
  search?: string
}) {
  await requireSuperAdmin()

  const page = params.page || 1
  const limit = params.limit || 10
  const skip = (page - 1) * limit

  const where: any = { deletedAt: null }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createUser(data: any) {
  await requireSuperAdmin()

  const validation = userSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  if (!data.password) return { error: 'Password wajib diisi untuk pengguna baru' }

  const existing = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  })
  if (existing) return { error: 'Email sudah terdaftar' }

  const hashed = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'USER',
    recordId: user.id,
    description: `Menambahkan pengguna: ${user.name} (${user.role})`,
  })

  return { success: true }
}

export async function updateUser(id: string, data: any) {
  const currentUser = await requireSuperAdmin()

  const validation = userSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Prevent self-role change to non-admin
  if (id === currentUser.id && data.role !== 'SUPER_ADMIN') {
    return { error: 'Tidak dapat mengubah role akun sendiri' }
  }

  const existing = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null, NOT: { id } },
  })
  if (existing) return { error: 'Email sudah digunakan pengguna lain' }

  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status ?? true,
  }

  if (data.password && data.password.length >= 6) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  const user = await prisma.user.update({ where: { id }, data: updateData })

  await createAuditLog({
    action: 'UPDATE',
    module: 'USER',
    recordId: user.id,
    description: `Mengubah pengguna: ${user.name}`,
  })

  return { success: true }
}

export async function deleteUser(id: string) {
  const currentUser = await requireSuperAdmin()

  // Prevent self-deletion
  if (id === currentUser.id) {
    return { error: 'Tidak dapat menghapus akun sendiri' }
  }

  // Prevent deleting last Super Admin
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (target?.role === 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN', deletedAt: null, status: true },
    })
    if (superAdminCount <= 1) {
      return { error: 'Tidak dapat menghapus satu-satunya Super Admin' }
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), status: false },
  })

  await createAuditLog({
    action: 'DELETE',
    module: 'USER',
    recordId: id,
    description: `Menghapus pengguna: ${user.name}`,
  })

  return { success: true }
}

export async function toggleUserStatus(id: string, status: boolean) {
  const currentUser = await requireSuperAdmin()

  if (id === currentUser.id) {
    return { error: 'Tidak dapat menonaktifkan akun sendiri' }
  }

  await prisma.user.update({ where: { id }, data: { status } })

  return { success: true }
}

// ─── Threshold Management ─────────────────────────────────────
export async function getThresholdList() {
  await requireAuth()
  return prisma.thresholdPoin.findMany({ orderBy: { minimumPoin: 'asc' } })
}

export async function createThreshold(data: any) {
  await requireSuperAdmin()

  const validation = thresholdSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const threshold = await prisma.thresholdPoin.create({
    data: {
      namaStatus: data.namaStatus,
      minimumPoin: data.minimumPoin,
      maximumPoin: data.maximumPoin ?? null,
      tindakan: data.tindakan || null,
      warna: data.warna,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'THRESHOLD',
    recordId: threshold.id,
    description: `Menambahkan threshold: ${threshold.namaStatus} (${threshold.minimumPoin} poin)`,
  })

  return { success: true }
}

export async function updateThreshold(id: string, data: any) {
  await requireSuperAdmin()

  const validation = thresholdSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const threshold = await prisma.thresholdPoin.update({
    where: { id },
    data: {
      namaStatus: data.namaStatus,
      minimumPoin: data.minimumPoin,
      maximumPoin: data.maximumPoin ?? null,
      tindakan: data.tindakan || null,
      warna: data.warna,
    },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'THRESHOLD',
    recordId: id,
    description: `Mengubah threshold: ${threshold.namaStatus}`,
  })

  return { success: true }
}

export async function deleteThreshold(id: string): Promise<{ success: boolean } | { error: string }> {
  await requireSuperAdmin()

  try {
    const threshold = await prisma.thresholdPoin.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      module: 'THRESHOLD',
      recordId: id,
      description: `Menghapus threshold: ${threshold.namaStatus}`,
    })

    return { success: true }
  } catch {
    return { error: 'Gagal menghapus threshold' }
  }
}

// ─── System Settings ──────────────────────────────────────────
export async function getSystemSettings() {
  await requireAuth()
  return prisma.systemSetting.findMany({ orderBy: { key: 'asc' } })
}

export async function upsertSystemSetting(key: string, value: string, description?: string) {
  await requireSuperAdmin()

  await prisma.systemSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  })

  return { success: true }
}
