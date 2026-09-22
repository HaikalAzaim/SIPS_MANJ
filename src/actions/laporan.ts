'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// ─── Laporan Pelanggaran (paginated) ──────────────────────────────
export async function getLaporanPelanggaran(params: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  kelasId?: string
  kategoriId?: string
  tingkat?: string
}) {
  await requireAuth()

  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.startDate || params.endDate) {
    where.tanggal = {}
    if (params.startDate) where.tanggal.gte = new Date(params.startDate)
    if (params.endDate) where.tanggal.lte = new Date(params.endDate + 'T23:59:59')
  }

  if (params.kelasId) {
    where.siswa = { kelasId: params.kelasId, deletedAt: null }
  }

  if (params.kategoriId) {
    where.kategoriPelanggaranId = params.kategoriId
  }

  if (params.tingkat) {
    where.kategoriPelanggaran = { tingkat: params.tingkat }
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
        siswa: {
          select: {
            id: true,
            nama: true,
            niup: true,
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

// ─── Laporan Rekap Siswa (SQL aggregation, paginated) ─────────────
export async function getLaporanSiswa(params: {
  page?: number
  limit?: number
  kelasId?: string
  search?: string
}) {
  await requireAuth()

  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  // SQL aggregation: COUNT pelanggaran by tingkat and SUM poin in database
  const [rawData, countResult] = await Promise.all([
    prisma.$queryRaw<Array<{
      id: string
      nama: string
      nisn: string
      niup: string
      jenisKelamin: string
      namaKelas: string
      totalPelanggaran: bigint
      totalPoin: bigint
      ringan: bigint
      sedang: bigint
      berat: bigint
      sangatBerat: bigint
    }>>`
      SELECT 
        s.id, s.nama, s.nisn, s.niup, s.jenis_kelamin AS jenisKelamin,
        k.nama_kelas AS namaKelas,
        COUNT(p.id) AS totalPelanggaran,
        COALESCE(SUM(p.poin), 0) AS totalPoin,
        SUM(CASE WHEN kp.tingkat = 'RINGAN' THEN 1 ELSE 0 END) AS ringan,
        SUM(CASE WHEN kp.tingkat = 'SEDANG' THEN 1 ELSE 0 END) AS sedang,
        SUM(CASE WHEN kp.tingkat = 'BERAT' THEN 1 ELSE 0 END) AS berat,
        SUM(CASE WHEN kp.tingkat = 'SANGAT_BERAT' THEN 1 ELSE 0 END) AS sangatBerat
      FROM siswa s
      LEFT JOIN kelas k ON k.id = s.kelas_id
      LEFT JOIN pelanggaran p ON p.siswa_id = s.id
      LEFT JOIN kategori_pelanggaran kp ON kp.id = p.kategori_pelanggaran_id
      WHERE s.deleted_at IS NULL
        ${params.kelasId ? Prisma.sql`AND s.kelas_id = ${params.kelasId}` : Prisma.empty}
        ${params.search ? Prisma.sql`AND (s.nama LIKE ${`%${params.search}%`} OR s.niup LIKE ${`%${params.search}%`} OR s.nisn LIKE ${`%${params.search}%`})` : Prisma.empty}
      GROUP BY s.id, s.nama, s.nisn, s.niup, s.jenis_kelamin, k.nama_kelas
      ORDER BY s.nama ASC
      LIMIT ${limit} OFFSET ${skip}
    `,
    prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*) AS cnt FROM siswa s
      WHERE s.deleted_at IS NULL
        ${params.kelasId ? Prisma.sql`AND s.kelas_id = ${params.kelasId}` : Prisma.empty}
        ${params.search ? Prisma.sql`AND (s.nama LIKE ${`%${params.search}%`} OR s.niup LIKE ${`%${params.search}%`} OR s.nisn LIKE ${`%${params.search}%`})` : Prisma.empty}
    `,
  ])

  const total = Number(countResult[0].cnt)
  const data = rawData.map(s => ({
    id: s.id,
    nama: s.nama,
    nisn: s.nisn,
    niup: s.niup,
    jenisKelamin: s.jenisKelamin,
    namaKelas: s.namaKelas || '-',
    totalPelanggaran: Number(s.totalPelanggaran),
    totalPoin: Number(s.totalPoin),
    ringan: Number(s.ringan),
    sedang: Number(s.sedang),
    berat: Number(s.berat),
    sangatBerat: Number(s.sangatBerat),
  }))

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

// ─── Laporan Rekap Kelas (SQL aggregation) ────────────────────────
export async function getLaporanKelas() {
  await requireAuth()

  // Single SQL query replaces: kelas → siswa → pelanggaran N+1 include chain
  const data = await prisma.$queryRaw<Array<{
    id: string
    namaKelas: string
    tingkat: string
    jurusan: string | null
    waliKelas: string | null
    jumlahSiswa: bigint
    totalPelanggaran: bigint
    totalPoin: bigint
  }>>`
    SELECT 
      k.id, k.nama_kelas AS namaKelas, k.tingkat, k.jurusan,
      g.nama AS waliKelas,
      COUNT(DISTINCT s.id) AS jumlahSiswa,
      COUNT(p.id) AS totalPelanggaran,
      COALESCE(SUM(p.poin), 0) AS totalPoin
    FROM kelas k
    LEFT JOIN guru g ON g.id = k.wali_kelas_id
    LEFT JOIN siswa s ON s.kelas_id = k.id AND s.deleted_at IS NULL
    LEFT JOIN pelanggaran p ON p.siswa_id = s.id
    WHERE k.deleted_at IS NULL
    GROUP BY k.id, k.nama_kelas, k.tingkat, k.jurusan, g.nama
    ORDER BY k.tingkat ASC, k.nama_kelas ASC
  `

  return data.map(k => {
    const jumlahSiswa = Number(k.jumlahSiswa)
    const totalPelanggaran = Number(k.totalPelanggaran)
    const totalPoin = Number(k.totalPoin)
    return {
      id: k.id,
      namaKelas: k.namaKelas,
      tingkat: k.tingkat,
      jurusan: k.jurusan,
      waliKelas: k.waliKelas || '-',
      jumlahSiswa,
      totalPelanggaran,
      totalPoin,
      rataRataPoin: jumlahSiswa > 0 ? Math.round(totalPoin / jumlahSiswa) : 0,
    }
  })
}

// ─── Laporan Statistik ────────────────────────────────────────────
export async function getLaporanStatistik(tahun?: number) {
  await requireAuth()

  const year = tahun || new Date().getFullYear()

  const [perBulan, perTingkat, perKelas] = await Promise.all([
    prisma.$queryRaw<{ bulan: number; total: number; totalPoin: number }[]>`
      SELECT 
        MONTH(tanggal) as bulan,
        COUNT(*) as total,
        SUM(poin) as totalPoin
      FROM pelanggaran
      WHERE YEAR(tanggal) = ${year}
      GROUP BY MONTH(tanggal)
      ORDER BY bulan
    `,
    // Use a single raw query to get per-tingkat counts directly
    prisma.$queryRaw<{ tingkat: string; total: number }[]>`
      SELECT kp.tingkat, COUNT(p.id) AS total
      FROM pelanggaran p
      JOIN kategori_pelanggaran kp ON kp.id = p.kategori_pelanggaran_id
      GROUP BY kp.tingkat
    `,
    prisma.$queryRaw<{ namaKelas: string; total: number; totalPoin: number }[]>`
      SELECT 
        k.nama_kelas as namaKelas,
        COUNT(p.id) as total,
        COALESCE(SUM(p.poin), 0) as totalPoin
      FROM kelas k
      LEFT JOIN siswa s ON s.kelas_id = k.id AND s.deleted_at IS NULL
      LEFT JOIN pelanggaran p ON p.siswa_id = s.id
      WHERE k.deleted_at IS NULL
      GROUP BY k.id, k.nama_kelas
      ORDER BY total DESC
    `,
  ])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const monthlyData = months.map((name, i) => {
    const found = perBulan.find((r) => Number(r.bulan) === i + 1)
    return {
      bulan: name,
      total: found ? Number(found.total) : 0,
      totalPoin: found ? Number(found.totalPoin) : 0,
    }
  })

  // Map tingkat results directly from SQL
  const tingkatMap: Record<string, number> = { RINGAN: 0, SEDANG: 0, BERAT: 0, SANGAT_BERAT: 0 }
  perTingkat.forEach(r => { tingkatMap[r.tingkat] = Number(r.total) })

  return {
    perBulan: monthlyData,
    perTingkat: [
      { tingkat: 'Ringan', total: tingkatMap.RINGAN },
      { tingkat: 'Sedang', total: tingkatMap.SEDANG },
      { tingkat: 'Berat', total: tingkatMap.BERAT },
      { tingkat: 'Sangat Berat', total: tingkatMap.SANGAT_BERAT },
    ],
    perKelas: perKelas.map((r) => ({
      ...r,
      total: Number(r.total),
      totalPoin: Number(r.totalPoin),
    })),
  }
}

// ─── Laporan Threshold (paginated) ────────────────────────────────
export async function getLaporanThreshold(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  await requireAuth()

  const page = params?.page || 1
  const limit = params?.limit || 20
  const skip = (page - 1) * limit

  const [rawData, countResult, thresholds] = await Promise.all([
    prisma.$queryRaw<Array<{
      id: string
      nama: string
      niup: string
      nisn: string
      namaKelas: string
      totalPoin: bigint
      totalPelanggaran: bigint
    }>>`
      SELECT 
        s.id, s.nama, s.niup, s.nisn,
        k.nama_kelas as namaKelas,
        COALESCE(SUM(p.poin), 0) as totalPoin,
        COUNT(p.id) as totalPelanggaran
      FROM siswa s
      LEFT JOIN kelas k ON k.id = s.kelas_id
      LEFT JOIN pelanggaran p ON p.siswa_id = s.id
      WHERE s.deleted_at IS NULL
        ${params?.search ? Prisma.sql`AND (s.nama LIKE ${`%${params.search}%`} OR s.niup LIKE ${`%${params.search}%`})` : Prisma.empty}
      GROUP BY s.id, s.nama, s.niup, s.nisn, k.nama_kelas
      HAVING totalPoin > 0
      ORDER BY totalPoin DESC
      LIMIT ${limit} OFFSET ${skip}
    `,
    prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*) AS cnt FROM (
        SELECT s.id
        FROM siswa s
        LEFT JOIN pelanggaran p ON p.siswa_id = s.id
        WHERE s.deleted_at IS NULL
          ${params?.search ? Prisma.sql`AND (s.nama LIKE ${`%${params.search}%`} OR s.niup LIKE ${`%${params.search}%`})` : Prisma.empty}
        GROUP BY s.id
        HAVING COALESCE(SUM(p.poin), 0) > 0
      ) AS sub
    `,
    prisma.thresholdPoin.findMany({ orderBy: { minimumPoin: 'asc' } }),
  ])

  const total = Number(countResult[0].cnt)

  return {
    siswa: rawData.map(s => ({
      ...s,
      totalPoin: Number(s.totalPoin),
      totalPelanggaran: Number(s.totalPelanggaran),
    })),
    thresholds,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// ─── Export: Full Dataset (no pagination) ─────────────────────────
export async function getAllLaporanPelanggaranForExport(params: {
  startDate?: string
  endDate?: string
  kelasId?: string
  kategoriId?: string
  tingkat?: string
}) {
  await requireAuth()

  const where: any = {}

  if (params.startDate || params.endDate) {
    where.tanggal = {}
    if (params.startDate) where.tanggal.gte = new Date(params.startDate)
    if (params.endDate) where.tanggal.lte = new Date(params.endDate + 'T23:59:59')
  }

  if (params.kelasId) {
    where.siswa = { kelasId: params.kelasId, deletedAt: null }
  }

  if (params.kategoriId) {
    where.kategoriPelanggaranId = params.kategoriId
  }

  if (params.tingkat) {
    where.kategoriPelanggaran = { tingkat: params.tingkat }
  }

  return prisma.pelanggaran.findMany({
    where,
    select: {
      id: true,
      tanggal: true,
      waktu: true,
      poin: true,
      lokasi: true,
      keterangan: true,
      siswa: {
        select: {
          nama: true,
          niup: true,
          kelas: { select: { namaKelas: true } },
        },
      },
      kategoriPelanggaran: {
        select: { nama: true, tingkat: true, poin: true },
      },
      dicatatOleh: { select: { name: true } },
    },
    orderBy: { tanggal: 'desc' },
  })
}

export async function getAllLaporanSiswaForExport(params: {
  kelasId?: string
  search?: string
}) {
  await requireAuth()

  const rawData = await prisma.$queryRaw<Array<{
    id: string
    nama: string
    nisn: string
    niup: string
    jenisKelamin: string
    namaKelas: string
    totalPelanggaran: bigint
    totalPoin: bigint
    ringan: bigint
    sedang: bigint
    berat: bigint
    sangatBerat: bigint
  }>>`
    SELECT 
      s.id, s.nama, s.nisn, s.niup, s.jenis_kelamin AS jenisKelamin,
      k.nama_kelas AS namaKelas,
      COUNT(p.id) AS totalPelanggaran,
      COALESCE(SUM(p.poin), 0) AS totalPoin,
      SUM(CASE WHEN kp.tingkat = 'RINGAN' THEN 1 ELSE 0 END) AS ringan,
      SUM(CASE WHEN kp.tingkat = 'SEDANG' THEN 1 ELSE 0 END) AS sedang,
      SUM(CASE WHEN kp.tingkat = 'BERAT' THEN 1 ELSE 0 END) AS berat,
      SUM(CASE WHEN kp.tingkat = 'SANGAT_BERAT' THEN 1 ELSE 0 END) AS sangatBerat
    FROM siswa s
    LEFT JOIN kelas k ON k.id = s.kelas_id
    LEFT JOIN pelanggaran p ON p.siswa_id = s.id
    LEFT JOIN kategori_pelanggaran kp ON kp.id = p.kategori_pelanggaran_id
    WHERE s.deleted_at IS NULL
      ${params.kelasId ? Prisma.sql`AND s.kelas_id = ${params.kelasId}` : Prisma.empty}
      ${params.search ? Prisma.sql`AND (s.nama LIKE ${`%${params.search}%`} OR s.niup LIKE ${`%${params.search}%`} OR s.nisn LIKE ${`%${params.search}%`})` : Prisma.empty}
    GROUP BY s.id, s.nama, s.nisn, s.niup, s.jenis_kelamin, k.nama_kelas
    ORDER BY s.nama ASC
  `

  return rawData.map(s => ({
    id: s.id,
    nama: s.nama,
    nisn: s.nisn,
    niup: s.niup,
    jenisKelamin: s.jenisKelamin,
    namaKelas: s.namaKelas || '-',
    totalPelanggaran: Number(s.totalPelanggaran),
    totalPoin: Number(s.totalPoin),
    ringan: Number(s.ringan),
    sedang: Number(s.sedang),
    berat: Number(s.berat),
    sangatBerat: Number(s.sangatBerat),
  }))
}
