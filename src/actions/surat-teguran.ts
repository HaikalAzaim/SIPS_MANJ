'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, getSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { suratTeguranSchema } from '@/lib/schemas'

export async function getSuratTeguranList(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  await requireAuth()

  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.search) {
    where.OR = [
      { nomorSurat: { contains: params.search } },
      { siswa: { nama: { contains: params.search } } },
      { siswa: { niup: { contains: params.search } } },
    ]
  }

  if (params.status) {
    where.status = params.status
  }

  const [data, total] = await Promise.all([
    prisma.suratTeguran.findMany({
      where,
      select: {
        id: true,
        nomorSurat: true,
        jenisTeguran: true,
        totalPoin: true,
        totalPelanggaran: true,
        keterangan: true,
        tanggal: true,
        status: true,
        createdAt: true,
        siswa: {
          select: {
            id: true,
            nama: true,
            niup: true,
            kelas: { select: { namaKelas: true } },
          },
        },
        dibuatOleh: { select: { name: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.suratTeguran.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createSuratTeguran(data: any) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const validation = suratTeguranSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  // Use SQL aggregate for poin instead of pulling all pelanggaran into memory
  const [siswa, poinResult] = await Promise.all([
    prisma.siswa.findUnique({
      where: { id: data.siswaId },
      select: { id: true, nama: true, kelas: { select: { namaKelas: true } } },
    }),
    prisma.pelanggaran.aggregate({
      where: { siswaId: data.siswaId },
      _sum: { poin: true },
      _count: { id: true },
    }),
  ])
  if (!siswa) return { error: 'Siswa tidak ditemukan' }

  const totalPoin = poinResult._sum.poin || 0
  const totalPelanggaran = poinResult._count.id

  // Tentukan nomor surat: manual jika diisi, auto-generate jika kosong
  let nomorSurat: string
  const nomorManual = data.nomorSurat?.trim()

  if (nomorManual) {
    // Cek duplikasi nomor surat manual
    const duplicate = await prisma.suratTeguran.findFirst({
      where: { nomorSurat: nomorManual },
    })
    if (duplicate) return { error: `Nomor surat "${nomorManual}" sudah digunakan` }
    nomorSurat = nomorManual
  } else {
    // Auto-generate: ST/YYYY/MM/xxx
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const countThisMonth = await prisma.suratTeguran.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-${month}-01`),
          lt: new Date(month === '12' ? `${year + 1}-01-01` : `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`),
        },
      },
    })
    nomorSurat = `ST/${year}/${month}/${String(countThisMonth + 1).padStart(3, '0')}`
  }

  const surat = await prisma.suratTeguran.create({
    data: {
      nomorSurat,
      siswaId: data.siswaId,
      jenisTeguran: data.jenisTeguran,
      totalPoin,
      totalPelanggaran,
      keterangan: data.keterangan || null,
      tanggal: new Date(data.tanggal),
      dibuatOlehId: session.userId,
    },
  })

  // Notification
  const users = await prisma.user.findMany({
    where: { deletedAt: null, status: true },
    select: { id: true },
  })
  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      judul: 'Surat Teguran Dibuat',
      pesan: `Surat teguran ${nomorSurat} untuk ${siswa.nama} (${siswa.kelas?.namaKelas}) telah dibuat.`,
      jenis: 'SURAT_TEGURAN',
      link: `/laporan/surat-teguran`,
    })),
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'SURAT_TEGURAN',
    recordId: surat.id,
    description: `Membuat surat teguran ${nomorSurat} untuk ${siswa.nama}`,
  })

  return { success: true, data: surat }
}

export async function updateStatusSuratTeguran(id: string, status: string) {
  await requireAuth()

  const surat = await prisma.suratTeguran.update({
    where: { id },
    data: { status: status as any },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'SURAT_TEGURAN',
    recordId: id,
    description: `Mengubah status surat teguran ${surat.nomorSurat} menjadi ${status}`,
  })

  return { success: true }
}

export async function updateNomorSurat(id: string, nomorSurat: string): Promise<{ success: boolean } | { error: string }> {
  await requireAuth()

  const nomorTrimmed = nomorSurat.trim()
  if (!nomorTrimmed) return { error: 'Nomor surat tidak boleh kosong' }

  // Cek duplikasi nomor surat (selain surat ini sendiri)
  const duplicate = await prisma.suratTeguran.findFirst({
    where: { nomorSurat: nomorTrimmed, NOT: { id } },
  })
  if (duplicate) return { error: 'Nomor surat sudah digunakan surat teguran lain' }

  const surat = await prisma.suratTeguran.update({
    where: { id },
    data: { nomorSurat: nomorTrimmed },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'SURAT_TEGURAN',
    recordId: id,
    description: `Mengubah nomor surat teguran menjadi ${nomorTrimmed}`,
  })

  return { success: true }
}

export async function deleteSuratTeguran(id: string): Promise<{ success: boolean } | { error: string }> {
  await requireAuth()

  try {
    const surat = await prisma.suratTeguran.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      module: 'SURAT_TEGURAN',
      recordId: id,
      description: `Menghapus surat teguran ${surat.nomorSurat}`,
    })

    return { success: true }
  } catch {
    return { error: 'Gagal menghapus surat teguran' }
  }
}
