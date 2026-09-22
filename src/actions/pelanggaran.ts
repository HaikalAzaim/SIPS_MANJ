'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, getSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { pelanggaranSchema } from '@/lib/schemas'

export async function getPelanggaranList(params: {
  page?: number
  limit?: number
  search?: string
  kelasId?: string
  kategoriId?: string
  startDate?: string
  endDate?: string
}) {
  await requireAuth()
  
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}
  
  if (params.search) {
    where.siswa = {
      OR: [
        { nama: { contains: params.search } },
        { niup: { contains: params.search } },
      ],
      deletedAt: null,
    }
  }
  
  if (params.kelasId) {
    where.siswa = { ...where.siswa, kelasId: params.kelasId, deletedAt: null }
  }
  
  if (params.kategoriId) {
    where.kategoriPelanggaranId = params.kategoriId
  }
  
  if (params.startDate || params.endDate) {
    where.tanggal = {}
    if (params.startDate) where.tanggal.gte = new Date(params.startDate)
    if (params.endDate) where.tanggal.lte = new Date(params.endDate + 'T23:59:59')
  }

  const [data, total] = await Promise.all([
    prisma.pelanggaran.findMany({
      where,
      select: {
        id: true,
        tanggal: true,
        waktu: true,
        poin: true,
        lokasi: true,
        keterangan: true,
        siswaId: true,
        kategoriPelanggaranId: true,
        siswa: {
          select: {
            id: true,
            nama: true,
            niup: true,
            kelasId: true,
            kelas: { select: { namaKelas: true } },
          },
        },
        kategoriPelanggaran: {
          select: { id: true, nama: true, tingkat: true, poin: true },
        },
        dicatatOleh: { select: { name: true } },
      },
      skip,
      take: limit,
      orderBy: { tanggal: 'desc' },
    }),
    prisma.pelanggaran.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createPelanggaran(data: any) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const validation = pelanggaranSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Get kategori to snapshot poin
  const kategori = await prisma.kategoriPelanggaran.findUnique({
    where: { id: data.kategoriPelanggaranId },
    select: { id: true, nama: true, poin: true },
  })
  if (!kategori) return { error: 'Kategori pelanggaran tidak ditemukan' }

  const siswa = await prisma.siswa.findUnique({
    where: { id: data.siswaId },
    select: { id: true, nama: true, kelas: { select: { namaKelas: true } } },
  })
  if (!siswa) return { error: 'Siswa tidak ditemukan' }

  // Create pelanggaran with SNAPSHOT poin
  const pelanggaran = await prisma.pelanggaran.create({
    data: {
      siswaId: data.siswaId,
      kategoriPelanggaranId: data.kategoriPelanggaranId,
      tanggal: new Date(data.tanggal),
      waktu: data.waktu,
      lokasi: data.lokasi || null,
      keterangan: data.keterangan || null,
      poin: kategori.poin, // SNAPSHOT - not a reference
      dicatatOlehId: session.userId,
    },
  })

  // Calculate new total poin
  const totalPoin = await prisma.pelanggaran.aggregate({
    where: { siswaId: data.siswaId },
    _sum: { poin: true },
  })

  const newTotalPoin = totalPoin._sum.poin || 0

  // Check threshold and create notification if needed
  const thresholds = await prisma.thresholdPoin.findMany({
    orderBy: { minimumPoin: 'desc' },
  })

  const currentThreshold = thresholds.find(t => 
    newTotalPoin >= t.minimumPoin && (t.maximumPoin === null || newTotalPoin <= t.maximumPoin)
  )

  // Get all active user IDs once (not twice)
  const users = await prisma.user.findMany({
    where: { deletedAt: null, status: true },
    select: { id: true },
  })

  const notifications: any[] = []

  if (currentThreshold && currentThreshold.namaStatus !== 'Normal') {
    notifications.push(
      ...users.map(u => ({
        userId: u.id,
        judul: `Siswa Melewati Threshold`,
        pesan: `${siswa.nama} (${siswa.kelas.namaKelas}) telah mencapai ${newTotalPoin} poin - Status: ${currentThreshold.namaStatus}`,
        jenis: 'THRESHOLD' as const,
        link: `/siswa/${siswa.id}`,
      }))
    )
  }

  // Create notification for new pelanggaran
  notifications.push(
    ...users.map(u => ({
      userId: u.id,
      judul: 'Pelanggaran Baru',
      pesan: `${siswa.nama} - ${kategori.nama} (${kategori.poin} poin)`,
      jenis: 'PELANGGARAN_BARU' as const,
      link: `/siswa/${siswa.id}`,
    }))
  )

  // Single batch insert for all notifications
  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications })
  }

  await createAuditLog({
    action: 'CREATE',
    module: 'PELANGGARAN',
    recordId: pelanggaran.id,
    description: `Mencatat pelanggaran: ${siswa.nama} - ${kategori.nama} (${kategori.poin} poin)`,
  })

  return { success: true, data: pelanggaran }
}

export async function deletePelanggaran(id: string) {
  await requireAuth()

  const pelanggaran = await prisma.pelanggaran.findUnique({
    where: { id },
    select: {
      id: true,
      siswa: { select: { nama: true } },
      kategoriPelanggaran: { select: { nama: true } },
    },
  })

  if (!pelanggaran) return { error: 'Pelanggaran tidak ditemukan' }

  await prisma.pelanggaran.delete({ where: { id } })

  await createAuditLog({
    action: 'DELETE',
    module: 'PELANGGARAN',
    recordId: id,
    description: `Menghapus pelanggaran: ${pelanggaran.siswa.nama} - ${pelanggaran.kategoriPelanggaran.nama}`,
  })

  return { success: true }
}
