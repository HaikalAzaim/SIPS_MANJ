'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { siswaSchema } from '@/lib/schemas'
import { Prisma } from '@prisma/client'

export async function getSiswaList(params: {
  page?: number
  limit?: number
  search?: string
  kelasId?: string
  status?: string
}) {
  await requireAuth()
  
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: Prisma.SiswaWhereInput = { deletedAt: null }
  
  if (params.search) {
    where.OR = [
      { nama: { contains: params.search } },
      { nisn: { contains: params.search } },
      { niup: { contains: params.search } },
    ]
  }
  
  if (params.kelasId) {
    where.kelasId = params.kelasId
  }

  // Use SQL aggregation to avoid pulling all pelanggaran records into Node.js
  // This eliminates the N+1 payload bloat problem
  const [rawData, total] = await Promise.all([
    prisma.$queryRaw<Array<{
      id: string
      nisn: string
      niup: string
      nama: string
      jenisKelamin: string
      kelasId: string
      namaKelas: string
      createdAt: Date
      totalPelanggaran: bigint
      totalPoin: bigint
    }>>`
      SELECT 
        s.id, s.nisn, s.niup, s.nama, 
        s.jenis_kelamin AS jenisKelamin,
        s.kelas_id AS kelasId, 
        k.nama_kelas AS namaKelas,
        s.created_at AS createdAt,
        COUNT(p.id) AS totalPelanggaran,
        COALESCE(SUM(p.poin), 0) AS totalPoin
      FROM siswa s
      LEFT JOIN kelas k ON k.id = s.kelas_id
      LEFT JOIN pelanggaran p ON p.siswa_id = s.id
      WHERE s.deleted_at IS NULL
        ${params.kelasId ? Prisma.sql`AND s.kelas_id = ${params.kelasId}` : Prisma.empty}
        ${params.search ? Prisma.sql`AND (s.nama LIKE ${`%${params.search}%`} OR s.nisn LIKE ${`%${params.search}%`} OR s.niup LIKE ${`%${params.search}%`})` : Prisma.empty}
      GROUP BY s.id, s.nisn, s.niup, s.nama, s.jenis_kelamin, s.kelas_id, k.nama_kelas, s.created_at
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `,
    prisma.siswa.count({ where }),
  ])

  const data = rawData.map(s => ({
    id: s.id,
    nisn: s.nisn,
    niup: s.niup,
    nama: s.nama,
    jenisKelamin: s.jenisKelamin,
    kelasId: s.kelasId,
    kelas: { namaKelas: s.namaKelas },
    createdAt: s.createdAt,
    totalPelanggaran: Number(s.totalPelanggaran),
    totalPoin: Number(s.totalPoin),
  }))

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/** Lightweight list for dropdowns: only id, nama, niup, kelasId, namaKelas */
export async function getSiswaForSelect(kelasId?: string) {
  await requireAuth()

  const where: Prisma.SiswaWhereInput = { deletedAt: null, status: true }
  if (kelasId) where.kelasId = kelasId

  return prisma.siswa.findMany({
    where,
    select: {
      id: true,
      nama: true,
      niup: true,
      kelasId: true,
      kelas: { select: { namaKelas: true } },
    },
    orderBy: { nama: 'asc' },
  })
}

export async function getSiswaById(id: string) {
  await requireAuth()
  
  const siswa = await prisma.siswa.findUnique({
    where: { id, deletedAt: null },
    include: {
      kelas: {
        include: { waliKelas: true },
      },
      pelanggaran: {
        select: {
          id: true,
          tanggal: true,
          waktu: true,
          poin: true,
          lokasi: true,
          keterangan: true,
          kategoriPelanggaran: { select: { id: true, nama: true, tingkat: true } },
          dicatatOleh: { select: { name: true } },
        },
        orderBy: { tanggal: 'desc' },
      },
    },
  })

  if (!siswa) return null

  return {
    ...siswa,
    totalPelanggaran: siswa.pelanggaran.length,
    totalPoin: siswa.pelanggaran.reduce((sum, p) => sum + p.poin, 0),
  }
}

export async function createSiswa(data: any) {
  const user = await requireAuth()
  
  const validation = siswaSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const existing = await prisma.siswa.findFirst({
    where: {
      OR: [
        { nisn: data.nisn, deletedAt: null },
        { niup: data.niup, deletedAt: null },
      ],
    },
  })

  if (existing) {
    return { error: 'NISN atau NIUP sudah terdaftar' }
  }

  const siswa = await prisma.siswa.create({
    data: {
      nisn: data.nisn,
      niup: data.niup,
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      kelasId: data.kelasId,
      tempatLahir: data.tempatLahir || null,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
      alamat: data.alamat || null,
      tahunMasuk: data.tahunMasuk || null,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'SISWA',
    recordId: siswa.id,
    description: `Menambahkan siswa: ${siswa.nama}`,
  })

  return { success: true, data: siswa }
}

export async function updateSiswa(id: string, data: any) {
  const user = await requireAuth()
  
  const validation = siswaSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const existing = await prisma.siswa.findFirst({
    where: {
      OR: [
        { nisn: data.nisn, deletedAt: null },
        { niup: data.niup, deletedAt: null },
      ],
      NOT: { id },
    },
  })

  if (existing) {
    return { error: 'NISN atau NIUP sudah digunakan siswa lain' }
  }

  const siswa = await prisma.siswa.update({
    where: { id },
    data: {
      nisn: data.nisn,
      niup: data.niup,
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      kelasId: data.kelasId,
      tempatLahir: data.tempatLahir || null,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
      alamat: data.alamat || null,
      tahunMasuk: data.tahunMasuk || null,
    },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'SISWA',
    recordId: siswa.id,
    description: `Mengubah data siswa: ${siswa.nama}`,
  })

  return { success: true, data: siswa }
}

export async function deleteSiswa(id: string): Promise<{ success: boolean } | { error: string }> {
  await requireAuth()

  try {
    const siswa = await prisma.siswa.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await createAuditLog({
      action: 'DELETE',
      module: 'SISWA',
      recordId: siswa.id,
      description: `Menghapus siswa: ${siswa.nama}`,
    })

    return { success: true }
  } catch {
    return { error: 'Gagal menghapus siswa' }
  }
}
