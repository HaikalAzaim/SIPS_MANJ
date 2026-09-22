'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { guruSchema } from '@/lib/schemas'

export async function getGuruList(params: {
  page?: number
  limit?: number
  search?: string
}) {
  await requireAuth()
  
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = { deletedAt: null }
  
  if (params.search) {
    where.OR = [
      { nama: { contains: params.search } },
      { niup: { contains: params.search } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.guru.findMany({
      where,
      select: {
        id: true,
        niup: true,
        nama: true,
        jenisKelamin: true,
        email: true,
        nomorHp: true,
        status: true,
        createdAt: true,
        kelas: {
          where: { deletedAt: null },
          select: { id: true, namaKelas: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.guru.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getAllGuru() {
  await requireAuth()
  return prisma.guru.findMany({
    where: { deletedAt: null, status: true },
    select: { id: true, nama: true, niup: true },
    orderBy: { nama: 'asc' },
  })
}

export async function createGuru(data: any) {
  await requireAuth()
  
  const validation = guruSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const existing = await prisma.guru.findFirst({
    where: { niup: data.niup, deletedAt: null },
  })
  if (existing) return { error: 'NIUP sudah terdaftar' }

  const guru = await prisma.guru.create({
    data: {
      niup: data.niup,
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      email: data.email || null,
      nomorHp: data.nomorHp || null,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'GURU',
    recordId: guru.id,
    description: `Menambahkan guru: ${guru.nama}`,
  })

  return { success: true, data: guru }
}

export async function updateGuru(id: string, data: any) {
  await requireAuth()
  
  const validation = guruSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const existing = await prisma.guru.findFirst({
    where: { niup: data.niup, deletedAt: null, NOT: { id } },
  })
  if (existing) return { error: 'NIUP sudah digunakan guru lain' }

  const guru = await prisma.guru.update({
    where: { id },
    data: {
      niup: data.niup,
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      email: data.email || null,
      nomorHp: data.nomorHp || null,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'GURU',
    recordId: guru.id,
    description: `Mengubah data guru: ${guru.nama}`,
  })

  return { success: true, data: guru }
}

export async function deleteGuru(id: string) {
  await requireAuth()

  // Check if guru is still assigned as wali kelas
  const kelasCount = await prisma.kelas.count({
    where: { waliKelasId: id, deletedAt: null },
  })
  if (kelasCount > 0) {
    return { error: `Guru tidak dapat dihapus karena masih menjadi wali kelas di ${kelasCount} kelas` }
  }

  const guru = await prisma.guru.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await createAuditLog({
    action: 'DELETE',
    module: 'GURU',
    recordId: guru.id,
    description: `Menghapus guru: ${guru.nama}`,
  })

  return { success: true }
}
