'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { tahunAjaranSchema } from '@/lib/schemas'


export async function getTahunAjaranList(params: {
  page?: number
  limit?: number
  search?: string
}) {
  await requireAuth()

  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.search) {
    where.nama = { contains: params.search }
  }

  const [data, total] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where,
      select: {
        id: true,
        nama: true,
        mulai: true,
        selesai: true,
        isActive: true,
        createdAt: true,
        _count: { select: { riwayatAkademik: true } },
      },
      skip,
      take: limit,
      orderBy: { mulai: 'desc' },
    }),
    prisma.tahunAjaran.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getAllTahunAjaran() {
  await requireAuth()
  return prisma.tahunAjaran.findMany({
    select: { id: true, nama: true, mulai: true, selesai: true, isActive: true },
    orderBy: { mulai: 'desc' },
  })
}

export async function getActiveTahunAjaran() {
  await requireAuth()
  return prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    select: { id: true, nama: true, mulai: true, selesai: true, isActive: true },
  })
}

export async function createTahunAjaran(data: any) {
  await requireAuth()

  const validation = tahunAjaranSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const existing = await prisma.tahunAjaran.findUnique({
    where: { nama: data.nama },
  })

  if (existing) {
    return { error: 'Tahun ajaran sudah ada' }
  }

  // If set as active, deactivate others
  if (data.isActive) {
    await prisma.tahunAjaran.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
  }

  const tahunAjaran = await prisma.tahunAjaran.create({
    data: {
      nama: data.nama,
      mulai: new Date(data.mulai),
      selesai: new Date(data.selesai),
      isActive: data.isActive ?? false,
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'TAHUN_AJARAN',
    recordId: tahunAjaran.id,
    description: `Menambahkan tahun ajaran: ${tahunAjaran.nama}`,
  })

  return { success: true, data: tahunAjaran }
}

export async function updateTahunAjaran(id: string, data: any) {
  await requireAuth()

  const validation = tahunAjaranSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const existing = await prisma.tahunAjaran.findFirst({
    where: { nama: data.nama, NOT: { id } },
  })

  if (existing) {
    return { error: 'Nama tahun ajaran sudah digunakan' }
  }

  // If set as active, deactivate others
  if (data.isActive) {
    await prisma.tahunAjaran.updateMany({
      where: { isActive: true, NOT: { id } },
      data: { isActive: false },
    })
  }

  const tahunAjaran = await prisma.tahunAjaran.update({
    where: { id },
    data: {
      nama: data.nama,
      mulai: new Date(data.mulai),
      selesai: new Date(data.selesai),
      isActive: data.isActive ?? false,
    },
  })

  await createAuditLog({
    action: 'UPDATE',
    module: 'TAHUN_AJARAN',
    recordId: tahunAjaran.id,
    description: `Mengubah tahun ajaran: ${tahunAjaran.nama}`,
  })

  return { success: true, data: tahunAjaran }
}

export async function deleteTahunAjaran(id: string) {
  await requireAuth()

  // Check if used in riwayat akademik
  const usageCount = await prisma.riwayatAkademik.count({
    where: { tahunAjaranId: id },
  })

  if (usageCount > 0) {
    return { error: 'Tahun ajaran tidak dapat dihapus karena sudah digunakan dalam riwayat akademik' }
  }

  // Check if used in proses kenaikan kelas
  const promoCount = await prisma.prosesKenaikanKelas.count({
    where: { OR: [{ dariTahunAjaranId: id }, { keTahunAjaranId: id }] },
  })

  if (promoCount > 0) {
    return { error: 'Tahun ajaran tidak dapat dihapus karena sudah digunakan dalam proses kenaikan kelas' }
  }

  const tahunAjaran = await prisma.tahunAjaran.delete({ where: { id } })

  await createAuditLog({
    action: 'DELETE',
    module: 'TAHUN_AJARAN',
    recordId: id,
    description: `Menghapus tahun ajaran: ${tahunAjaran.nama}`,
  })

  return { success: true }
}

export async function setActiveTahunAjaran(id: string) {
  await requireAuth()

  try {
    // Atomic: deactivate all + activate target in one transaction
    const tahunAjaran = await prisma.$transaction(async (tx) => {
      await tx.tahunAjaran.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
      return tx.tahunAjaran.update({
        where: { id },
        data: { isActive: true },
      })
    })

    await createAuditLog({
      action: 'UPDATE',
      module: 'TAHUN_AJARAN',
      recordId: tahunAjaran.id,
      description: `Mengaktifkan tahun ajaran: ${tahunAjaran.nama}`,
    })

    return { success: true as const, data: tahunAjaran }
  } catch (error: any) {
    return { error: 'Gagal mengaktifkan tahun ajaran' }
  }
}
