'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { kelasSchema } from '@/lib/schemas'

export async function getKelasList(params: {
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
    where.namaKelas = { contains: params.search }
  }

  const [data, total] = await Promise.all([
    prisma.kelas.findMany({
      where,
      select: {
        id: true,
        namaKelas: true,
        tingkat: true,
        jurusan: true,
        status: true,
        waliKelasId: true,
        createdAt: true,
        waliKelas: { select: { id: true, nama: true, niup: true } },
        _count: { select: { siswa: { where: { deletedAt: null } } } },
      },
      skip,
      take: limit,
      orderBy: [{ tingkat: 'asc' }, { namaKelas: 'asc' }],
    }),
    prisma.kelas.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getAllKelas() {
  await requireAuth()
  return prisma.kelas.findMany({
    where: { deletedAt: null, status: true },
    select: {
      id: true,
      namaKelas: true,
      tingkat: true,
      jurusan: true,
      waliKelasId: true,
      waliKelas: { select: { id: true, nama: true } },
    },
    orderBy: [{ tingkat: 'asc' }, { namaKelas: 'asc' }],
  })
}

export async function createKelas(data: any) {
  await requireAuth()
  
  const validation = kelasSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const kelas = await prisma.kelas.create({
    data: {
      namaKelas: data.namaKelas,
      tingkat: data.tingkat,
      jurusan: data.jurusan || null,
      waliKelasId: data.waliKelasId || null,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'KELAS',
    recordId: kelas.id,
    description: `Menambahkan kelas: ${kelas.namaKelas}`,
  })

  return { success: true, data: kelas }
}

export async function updateKelas(id: string, data: any) {
  await requireAuth()
  
  const validation = kelasSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const kelas = await prisma.kelas.update({
    where: { id },
    data: {
      namaKelas: data.namaKelas,
      tingkat: data.tingkat,
      jurusan: data.jurusan || null,
      waliKelasId: data.waliKelasId || null,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'KELAS',
    recordId: kelas.id,
    description: `Mengubah data kelas: ${kelas.namaKelas}`,
  })

  return { success: true, data: kelas }
}

export async function deleteKelas(id: string) {
  await requireAuth()

  // Check for active students in this class
  const activeStudents = await prisma.siswa.count({
    where: { kelasId: id, deletedAt: null },
  })
  if (activeStudents > 0) {
    return { error: `Kelas tidak dapat dihapus karena masih memiliki ${activeStudents} siswa aktif` }
  }

  const kelas = await prisma.kelas.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await createAuditLog({
    action: 'DELETE',
    module: 'KELAS',
    recordId: kelas.id,
    description: `Menghapus kelas: ${kelas.namaKelas}`,
  })

  return { success: true }
}
