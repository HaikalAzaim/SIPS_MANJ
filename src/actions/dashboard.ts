'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function getDashboardStats() {
  await requireAuth()

  const [
    totalSiswa,
    totalPelanggaran,
    totalGuru,
    totalKelas,
    totalKategori,
    totalPoinResult,
  ] = await Promise.all([
    prisma.siswa.count({ where: { deletedAt: null } }),
    prisma.pelanggaran.count(),
    prisma.guru.count({ where: { deletedAt: null } }),
    prisma.kelas.count({ where: { deletedAt: null } }),
    prisma.kategoriPelanggaran.count({ where: { deletedAt: null } }),
    prisma.pelanggaran.aggregate({ _sum: { poin: true } }),
  ])

  return {
    totalSiswa,
    totalPelanggaran,
    totalGuru,
    totalKelas,
    totalKategori,
    totalPoin: totalPoinResult._sum.poin || 0,
  }
}

export async function getPelanggaranPerBulan() {
  await requireAuth()

  const currentYear = new Date().getFullYear()
  const results = await prisma.$queryRaw<{ bulan: number; total: number; totalPoin: number }[]>`
    SELECT 
      MONTH(tanggal) as bulan,
      COUNT(*) as total,
      SUM(poin) as totalPoin
    FROM pelanggaran
    WHERE YEAR(tanggal) = ${currentYear}
    GROUP BY MONTH(tanggal)
    ORDER BY bulan
  `

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  return months.map((name, i) => {
    const found = results.find(r => Number(r.bulan) === i + 1)
    return {
      bulan: name,
      total: found ? Number(found.total) : 0,
      totalPoin: found ? Number(found.totalPoin) : 0,
    }
  })
}

export async function getPelanggaranPerKategori() {
  await requireAuth()

  const results = await prisma.pelanggaran.groupBy({
    by: ['kategoriPelanggaranId'],
    _count: { id: true },
    _sum: { poin: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  })

  const kategoris = await prisma.kategoriPelanggaran.findMany({
    where: { id: { in: results.map(r => r.kategoriPelanggaranId) } },
  })

  return results.map(r => {
    const k = kategoris.find(k => k.id === r.kategoriPelanggaranId)
    return {
      nama: k?.nama || 'Unknown',
      total: r._count.id,
      totalPoin: r._sum.poin || 0,
    }
  })
}

export async function getPelanggaranPerKelas() {
  await requireAuth()

  const results = await prisma.$queryRaw<{ kelasId: string; namaKelas: string; total: number; totalPoin: number }[]>`
    SELECT 
      k.id as kelasId,
      k.nama_kelas as namaKelas,
      COUNT(p.id) as total,
      COALESCE(SUM(p.poin), 0) as totalPoin
    FROM kelas k
    LEFT JOIN siswa s ON s.kelas_id = k.id AND s.deleted_at IS NULL
    LEFT JOIN pelanggaran p ON p.siswa_id = s.id
    WHERE k.deleted_at IS NULL
    GROUP BY k.id, k.nama_kelas
    HAVING total > 0
    ORDER BY total DESC
  `

  return results.map(r => ({
    ...r,
    total: Number(r.total),
    totalPoin: Number(r.totalPoin),
  }))
}

export async function getTopSiswa(limit = 5) {
  await requireAuth()

  const results = await prisma.$queryRaw<{
    id: string
    nama: string
    niup: string
    namaKelas: string
    totalPoin: number
    totalPelanggaran: number
  }[]>`
    SELECT 
      s.id,
      s.nama,
      s.niup,
      k.nama_kelas as namaKelas,
      COALESCE(SUM(p.poin), 0) as totalPoin,
      COUNT(p.id) as totalPelanggaran
    FROM siswa s
    LEFT JOIN kelas k ON k.id = s.kelas_id
    LEFT JOIN pelanggaran p ON p.siswa_id = s.id
    WHERE s.deleted_at IS NULL
    GROUP BY s.id, s.nama, s.niup, k.nama_kelas
    HAVING totalPoin > 0
    ORDER BY totalPoin DESC
    LIMIT ${limit}
  `

  return results.map(r => ({
    ...r,
    totalPoin: Number(r.totalPoin),
    totalPelanggaran: Number(r.totalPelanggaran),
  }))
}

export async function getTopPelanggaran(limit = 5) {
  await requireAuth()

  const results = await prisma.pelanggaran.groupBy({
    by: ['kategoriPelanggaranId'],
    _count: { id: true },
    _sum: { poin: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  })

  const kategoris = await prisma.kategoriPelanggaran.findMany({
    where: { id: { in: results.map(r => r.kategoriPelanggaranId) } },
  })

  return results.map(r => {
    const k = kategoris.find(k => k.id === r.kategoriPelanggaranId)
    return {
      nama: k?.nama || 'Unknown',
      jumlahKasus: r._count.id,
      totalPoin: r._sum.poin || 0,
    }
  })
}

export async function getRecentNotifications(userId: string, limit = 5) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markNotificationRead(id: string) {
  await requireAuth()
  await prisma.notification.update({
    where: { id },
    data: { dibaca: true },
  })
  return { success: true }
}

export async function markAllNotificationsRead(userId: string) {
  await requireAuth()
  await prisma.notification.updateMany({
    where: { userId, dibaca: false },
    data: { dibaca: true },
  })
  return { success: true }
}

export async function getThresholds() {
  return prisma.thresholdPoin.findMany({
    orderBy: { minimumPoin: 'asc' },
  })
}

