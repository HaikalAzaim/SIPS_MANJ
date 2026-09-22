'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { kategoriPelanggaranSchema } from '@/lib/schemas'

export async function getKategoriList(params: {
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
    where.nama = { contains: params.search }
  }

  const [data, total] = await Promise.all([
    prisma.kategoriPelanggaran.findMany({
      where,
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        poin: true,
        tingkat: true,
        status: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { poin: 'asc' },
    }),
    prisma.kategoriPelanggaran.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getAllKategori() {
  await requireAuth()
  return prisma.kategoriPelanggaran.findMany({
    where: { deletedAt: null, status: true },
    select: { id: true, nama: true, poin: true, tingkat: true },
    orderBy: { nama: 'asc' },
  })
}

export async function createKategori(data: any) {
  await requireAuth()
  
  const validation = kategoriPelanggaranSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const kategori = await prisma.kategoriPelanggaran.create({
    data: {
      nama: data.nama,
      deskripsi: data.deskripsi || null,
      poin: data.poin,
      tingkat: data.tingkat,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'KATEGORI_PELANGGARAN',
    recordId: kategori.id,
    description: `Menambahkan kategori: ${kategori.nama} (${kategori.poin} poin)`,
  })

  return { success: true, data: kategori }
}

export async function updateKategori(id: string, data: any) {
  await requireAuth()
  
  const validation = kategoriPelanggaranSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const kategori = await prisma.kategoriPelanggaran.update({
    where: { id },
    data: {
      nama: data.nama,
      deskripsi: data.deskripsi || null,
      poin: data.poin,
      tingkat: data.tingkat,
      status: data.status ?? true,
    },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'KATEGORI_PELANGGARAN',
    recordId: kategori.id,
    description: `Mengubah kategori: ${kategori.nama}`,
  })

  return { success: true, data: kategori }
}

export async function deleteKategori(id: string) {
  await requireAuth()

  // Check if kategori is used in any pelanggaran records
  const pelanggaranCount = await prisma.pelanggaran.count({
    where: { kategoriPelanggaranId: id },
  })
  if (pelanggaranCount > 0) {
    return { error: `Kategori tidak dapat dihapus karena sudah digunakan di ${pelanggaranCount} catatan pelanggaran` }
  }

  const kategori = await prisma.kategoriPelanggaran.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await createAuditLog({
    action: 'DELETE',
    module: 'KATEGORI_PELANGGARAN',
    recordId: kategori.id,
    description: `Menghapus kategori: ${kategori.nama}`,
  })

  return { success: true }
}
