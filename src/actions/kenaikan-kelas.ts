'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, getSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import type { StatusKenaikan, StatusProses, StatusAkademik } from '@/lib/schemas'


// ─── Statistics ───────────────────────────────────────────────────
export async function getPromotionStats() {
  await requireAuth()

  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    select: { id: true, nama: true },
  })

  const totalSiswa = await prisma.siswa.count({ where: { deletedAt: null } })

  const sudahDiproses = activeTahunAjaran
    ? await prisma.riwayatAkademik.count({
        where: { tahunAjaranId: activeTahunAjaran.id },
      })
    : 0

  const belumDiproses = totalSiswa - sudahDiproses

  return {
    tahunAjaranAktif: activeTahunAjaran?.nama || '-',
    totalSiswa,
    sudahDiproses,
    belumDiproses: belumDiproses < 0 ? 0 : belumDiproses,
  }
}

// ─── List Promotion Processes ─────────────────────────────────────
export async function getPromotionProcesses(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  tahunAjaranId?: string
}) {
  await requireAuth()

  const page = params.page || 1
  const limit = params.limit || 10
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.status && params.status !== 'all') {
    where.status = params.status
  }

  if (params.tahunAjaranId && params.tahunAjaranId !== 'all') {
    where.OR = [
      { dariTahunAjaranId: params.tahunAjaranId },
      { keTahunAjaranId: params.tahunAjaranId },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.prosesKenaikanKelas.findMany({
      where,
      select: {
        id: true,
        status: true,
        totalSiswa: true,
        jumlahNaik: true,
        jumlahTinggal: true,
        jumlahLulus: true,
        jumlahPindah: true,
        jumlahTidakAktif: true,
        createdAt: true,
        diprosesAt: true,
        dariTahunAjaran: { select: { id: true, nama: true } },
        keTahunAjaran: { select: { id: true, nama: true } },
        diprosesOleh: { select: { name: true } },
        _count: { select: { detailKenaikan: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.prosesKenaikanKelas.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

// ─── Get Promotion By ID ──────────────────────────────────────────
export async function getPromotionById(id: string) {
  await requireAuth()

  return prisma.prosesKenaikanKelas.findUnique({
    where: { id },
    include: {
      dariTahunAjaran: { select: { id: true, nama: true } },
      keTahunAjaran: { select: { id: true, nama: true } },
      diprosesOleh: { select: { name: true, email: true } },
      detailKenaikan: {
        include: {
          siswa: { select: { id: true, niup: true, nisn: true, nama: true } },
          dariKelas: { select: { id: true, namaKelas: true, tingkat: true } },
          keKelas: { select: { id: true, namaKelas: true, tingkat: true } },
        },
        orderBy: { siswa: { nama: 'asc' } },
      },
    },
  })
}

// ─── Create Promotion Process (Draft) ─────────────────────────────
export async function createPromotionProcess(data: {
  dariTahunAjaranId: string
  keTahunAjaranId: string
}) {
  const user = await requireAuth()

  if (data.dariTahunAjaranId === data.keTahunAjaranId) {
    return { error: 'Tahun ajaran asal dan tujuan tidak boleh sama' }
  }

  // Check if both academic years exist
  const [dariTA, keTA] = await Promise.all([
    prisma.tahunAjaran.findUnique({ where: { id: data.dariTahunAjaranId }, select: { id: true, nama: true } }),
    prisma.tahunAjaran.findUnique({ where: { id: data.keTahunAjaranId }, select: { id: true, nama: true } }),
  ])

  if (!dariTA) return { error: 'Tahun ajaran asal tidak ditemukan' }
  if (!keTA) return { error: 'Tahun ajaran tujuan tidak ditemukan' }

  // Check for duplicate process
  const existing = await prisma.prosesKenaikanKelas.findUnique({
    where: {
      dariTahunAjaranId_keTahunAjaranId: {
        dariTahunAjaranId: data.dariTahunAjaranId,
        keTahunAjaranId: data.keTahunAjaranId,
      },
    },
  })

  if (existing) {
    if (existing.status === 'DRAFT') {
      return { error: 'Sudah ada proses draft untuk tahun ajaran ini', existingId: existing.id }
    }
    return { error: 'Proses kenaikan kelas untuk tahun ajaran ini sudah ada' }
  }

  // Get all students in the source academic year via their current class
  // We check riwayatAkademik first, fallback to siswa.kelasId
  const siswaList = await prisma.siswa.findMany({
    where: { deletedAt: null, status: true },
    select: {
      id: true,
      kelasId: true,
      kelas: { select: { id: true, namaKelas: true, tingkat: true } },
      riwayatAkademik: {
        where: { tahunAjaranId: data.dariTahunAjaranId },
        select: { kelas: { select: { id: true, namaKelas: true, tingkat: true } } },
      },
    },
  })

  // Filter: only include students that have riwayat for source year OR are currently enrolled
  const eligibleStudents = siswaList.filter(
    (s: any) => (s.riwayatAkademik && s.riwayatAkademik.length > 0) || s.kelas
  )

  if (eligibleStudents.length === 0) {
    return { error: 'Tidak ada siswa yang dapat diproses untuk tahun ajaran asal' }
  }

  // Create the process with details
  const process = await prisma.prosesKenaikanKelas.create({
    data: {
      dariTahunAjaranId: data.dariTahunAjaranId,
      keTahunAjaranId: data.keTahunAjaranId,
      status: 'DRAFT',
      totalSiswa: eligibleStudents.length,
      diprosesOlehId: user.id,
      detailKenaikan: {
        create: eligibleStudents.map((s: any) => {
          const classFromRecord = s.riwayatAkademik?.[0]?.kelas
          const currentClass = classFromRecord || s.kelas
          return {
            siswaId: s.id,
            dariKelasId: currentClass.id,
            status: 'BELUM_DITENTUKAN' as StatusKenaikan,
          }
        }),
      },
    },
  })

  await createAuditLog({
    action: 'CREATE',
    module: 'KENAIKAN_KELAS',
    recordId: process.id,
    description: `Membuat proses kenaikan kelas: ${dariTA.nama} → ${keTA.nama} (${eligibleStudents.length} siswa)`,
  })

  return { success: true, data: process }
}

// ─── Get Class Mapping Suggestions ────────────────────────────────
export async function getClassMappingSuggestions(processId: string) {
  await requireAuth()

  const process = await prisma.prosesKenaikanKelas.findUnique({
    where: { id: processId },
    include: {
      detailKenaikan: {
        select: {
          dariKelasId: true,
          keKelasId: true,
          status: true,
          dariKelas: { select: { id: true, namaKelas: true, tingkat: true, jurusan: true } },
          siswa: { select: { id: true, nama: true, niup: true } },
        },
      },
    },
  })

  if (!process) return { error: 'Proses tidak ditemukan' }

  // Group students by source class
  const classMap = new Map<string, {
    kelasId: string
    namaKelas: string
    tingkat: string
    jurusan: string | null
    jumlahSiswa: number
    students: { id: string; nama: string; niup: string }[]
    existingTargetId: string | null
    existingStatus: StatusKenaikan | null
  }>()

  for (const detail of process.detailKenaikan) {
    const key = detail.dariKelasId
    if (!classMap.has(key)) {
      classMap.set(key, {
        kelasId: detail.dariKelas.id,
        namaKelas: detail.dariKelas.namaKelas,
        tingkat: detail.dariKelas.tingkat,
        jurusan: (detail.dariKelas as any).jurusan || null,
        jumlahSiswa: 0,
        students: [],
        existingTargetId: detail.keKelasId || null,
        existingStatus: detail.status !== 'BELUM_DITENTUKAN' ? detail.status : null,
      })
    }
    const entry = classMap.get(key)!
    entry.jumlahSiswa++
    entry.students.push({
      id: detail.siswa.id,
      nama: detail.siswa.nama,
      niup: detail.siswa.niup,
    })
    if (detail.status !== 'BELUM_DITENTUKAN') {
      entry.existingStatus = detail.status
      if (detail.keKelasId) {
        entry.existingTargetId = detail.keKelasId
      }
    }
  }

  // Get all target classes
  const allKelas = await prisma.kelas.findMany({
    where: { deletedAt: null, status: true },
    select: { id: true, namaKelas: true, tingkat: true, jurusan: true },
    orderBy: [{ tingkat: 'asc' }, { namaKelas: 'asc' }],
  })

  // Auto-suggest mappings based on tingkat progression
  const tingkatOrder = ['X', 'XI', 'XII']
  const suggestions = Array.from(classMap.values()).map(source => {
    const currentIdx = tingkatOrder.indexOf(source.tingkat)
    let suggestedTarget: typeof allKelas[0] | null = null
    let suggestedAction: 'NAIK_KELAS' | 'LULUS' = 'NAIK_KELAS'

    if (currentIdx >= 0 && currentIdx < tingkatOrder.length - 1) {
      // Can be promoted - find matching class at next level
      const nextTingkat = tingkatOrder[currentIdx + 1]
      suggestedTarget = allKelas.find(
        (k: any) => k.tingkat === nextTingkat && k.jurusan === source.jurusan
      ) || allKelas.find((k: any) => k.tingkat === nextTingkat) || null
    } else if (currentIdx === tingkatOrder.length - 1) {
      // Highest level → graduated
      suggestedAction = 'LULUS'
    }

    return {
      ...source,
      suggestedTargetId: suggestedTarget?.id || null,
      suggestedTargetName: suggestedTarget?.namaKelas || null,
      suggestedAction,
      existingTargetId: source.existingTargetId || null,
      existingStatus: source.existingStatus || null,
    }
  })

  return {
    success: true,
    data: {
      classes: suggestions,
      allKelas,
    },
  }
}

// ─── Save Class Mappings ──────────────────────────────────────────
export async function saveClassMappings(
  processId: string,
  mappings: {
    dariKelasId: string
    keKelasId: string | null
    status: StatusKenaikan
  }[]
) {
  await requireAuth()

  const process = await prisma.prosesKenaikanKelas.findUnique({
    where: { id: processId },
    select: { id: true, status: true },
  })

  if (!process) return { error: 'Proses tidak ditemukan' }
  if (process.status !== 'DRAFT') return { error: 'Hanya proses draft yang dapat diubah' }

  // Update all detail records based on class mappings
  for (const mapping of mappings) {
    await prisma.detailKenaikan.updateMany({
      where: {
        prosesKenaikanId: processId,
        dariKelasId: mapping.dariKelasId,
      },
      data: {
        keKelasId: mapping.keKelasId,
        status: mapping.status,
      },
    })
  }

  return { success: true }
}

// ─── Get Promotion Students ───────────────────────────────────────
export async function getPromotionStudents(
  processId: string,
  params?: { page?: number; limit?: number; search?: string; kelasId?: string; status?: string }
) {
  await requireAuth()

  const page = params?.page || 1
  const limit = params?.limit || 20
  const skip = (page - 1) * limit

  const where: any = { prosesKenaikanId: processId }

  if (params?.kelasId && params.kelasId !== 'all') {
    where.dariKelasId = params.kelasId
  }

  if (params?.status && params.status !== 'all') {
    where.status = params.status
  }

  if (params?.search) {
    where.siswa = {
      OR: [
        { nama: { contains: params.search } },
        { niup: { contains: params.search } },
        { nisn: { contains: params.search } },
      ],
    }
  }

  const [data, total] = await Promise.all([
    prisma.detailKenaikan.findMany({
      where,
      include: {
        siswa: { select: { id: true, niup: true, nisn: true, nama: true } },
        dariKelas: { select: { id: true, namaKelas: true, tingkat: true } },
        keKelas: { select: { id: true, namaKelas: true, tingkat: true } },
      },
      skip,
      take: limit,
      orderBy: [
        { dariKelas: { tingkat: 'asc' } },
        { dariKelas: { namaKelas: 'asc' } },
        { siswa: { nama: 'asc' } },
      ],
    }),
    prisma.detailKenaikan.count({ where }),
  ])

  return { success: true, data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

// ─── Update Single Student Status ─────────────────────────────────
export async function updateStudentPromotionStatus(
  detailId: string,
  data: { status: StatusKenaikan; keKelasId?: string | null; catatan?: string }
) {
  await requireAuth()

  const detail = await prisma.detailKenaikan.findUnique({
    where: { id: detailId },
    select: { id: true, prosesKenaikan: { select: { status: true } } },
  })

  if (!detail) return { error: 'Data tidak ditemukan' }
  if (detail.prosesKenaikan.status !== 'DRAFT') {
    return { error: 'Hanya proses draft yang dapat diubah' }
  }

  const updated = await prisma.detailKenaikan.update({
    where: { id: detailId },
    data: {
      status: data.status,
      keKelasId: data.keKelasId ?? null,
      catatan: data.catatan || null,
    },
  })

  return { success: true, data: updated }
}

// ─── Bulk Update Student Status ───────────────────────────────────
export async function bulkUpdateStudentStatus(
  processId: string,
  data: {
    studentIds: string[]
    status: StatusKenaikan
    keKelasId?: string | null
    catatan?: string
  }
) {
  await requireAuth()

  const process = await prisma.prosesKenaikanKelas.findUnique({
    where: { id: processId },
    select: { id: true, status: true },
  })

  if (!process) return { error: 'Proses tidak ditemukan' }
  if (process.status !== 'DRAFT') return { error: 'Hanya proses draft yang dapat diubah' }

  await prisma.detailKenaikan.updateMany({
    where: {
      prosesKenaikanId: processId,
      siswaId: { in: data.studentIds },
    },
    data: {
      status: data.status,
      keKelasId: data.keKelasId ?? null,
      catatan: data.catatan || null,
    },
  })

  return { success: true }
}

// ─── Execute Promotion (Transaction) ──────────────────────────────
export async function executePromotion(processId: string) {
  const user = await requireAuth()

  const process = await prisma.prosesKenaikanKelas.findUnique({
    where: { id: processId },
    include: {
      dariTahunAjaran: { select: { id: true, nama: true } },
      keTahunAjaran: { select: { id: true, nama: true } },
      detailKenaikan: {
        select: {
          siswaId: true,
          dariKelasId: true,
          keKelasId: true,
          status: true,
        },
      },
    },
  })

  if (!process) return { error: 'Proses tidak ditemukan' }
  if (process.status !== 'DRAFT') return { error: 'Hanya proses draft yang dapat dieksekusi' }

  // Validate: no BELUM_DITENTUKAN students
  const undetermined = process.detailKenaikan.filter(
    (d: any) => d.status === 'BELUM_DITENTUKAN'
  )
  if (undetermined.length > 0) {
    return { error: `Masih ada ${undetermined.length} siswa yang belum ditentukan statusnya` }
  }

  // Validate: students with NAIK_KELAS or TINGGAL_KELAS must have target class
  const missingTarget = process.detailKenaikan.filter(
    (d: any) => (d.status === 'NAIK_KELAS' || d.status === 'TINGGAL_KELAS') && !d.keKelasId
  )
  if (missingTarget.length > 0) {
    return { error: `${missingTarget.length} siswa naik/tinggal kelas belum memiliki kelas tujuan` }
  }

  try {
    // Mark as processing
    await prisma.prosesKenaikanKelas.update({
      where: { id: processId },
      data: { status: 'SEDANG_DIPROSES' },
    })

    await prisma.$transaction(async (tx: any) => {
      let promoted = 0, retained = 0, graduated = 0, transferred = 0, inactive = 0

      for (const detail of process.detailKenaikan) {
        // 1. Update old riwayat akademik status
        const statusMap: Record<string, StatusAkademik> = {
          NAIK_KELAS: 'NAIK_KELAS',
          TINGGAL_KELAS: 'TINGGAL_KELAS',
          LULUS: 'LULUS',
          PINDAH_SEKOLAH: 'PINDAH_SEKOLAH',
          TIDAK_AKTIF: 'TIDAK_AKTIF',
        }

        // Update existing riwayat for source year
        await tx.riwayatAkademik.upsert({
          where: {
            siswaId_tahunAjaranId: {
              siswaId: detail.siswaId,
              tahunAjaranId: process.dariTahunAjaranId,
            },
          },
          create: {
            siswaId: detail.siswaId,
            tahunAjaranId: process.dariTahunAjaranId,
            kelasId: detail.dariKelasId,
            status: statusMap[detail.status] || 'AKTIF',
          },
          update: {
            status: statusMap[detail.status] || 'AKTIF',
          },
        })

        // 2. Create new riwayat for target year (if applicable)
        if (detail.status === 'NAIK_KELAS' || detail.status === 'TINGGAL_KELAS') {
          await tx.riwayatAkademik.upsert({
            where: {
              siswaId_tahunAjaranId: {
                siswaId: detail.siswaId,
                tahunAjaranId: process.keTahunAjaranId,
              },
            },
            create: {
              siswaId: detail.siswaId,
              tahunAjaranId: process.keTahunAjaranId,
              kelasId: detail.keKelasId!,
              status: 'AKTIF',
            },
            update: {
              kelasId: detail.keKelasId!,
              status: 'AKTIF',
            },
          })

          // 3. Update siswa's current kelasId
          await tx.siswa.update({
            where: { id: detail.siswaId },
            data: { kelasId: detail.keKelasId! },
          })
        } else if (detail.status === 'LULUS' || detail.status === 'PINDAH_SEKOLAH' || detail.status === 'TIDAK_AKTIF') {
          // Mark student as inactive
          await tx.siswa.update({
            where: { id: detail.siswaId },
            data: { status: false },
          })
        }

        // Count
        switch (detail.status) {
          case 'NAIK_KELAS': promoted++; break
          case 'TINGGAL_KELAS': retained++; break
          case 'LULUS': graduated++; break
          case 'PINDAH_SEKOLAH': transferred++; break
          case 'TIDAK_AKTIF': inactive++; break
        }
      }

      // Update process record
      await tx.prosesKenaikanKelas.update({
        where: { id: processId },
        data: {
          status: 'SELESAI',
          totalSiswa: process.detailKenaikan.length,
          jumlahNaik: promoted,
          jumlahTinggal: retained,
          jumlahLulus: graduated,
          jumlahPindah: transferred,
          jumlahTidakAktif: inactive,
          diprosesOlehId: user.id,
          diprosesAt: new Date(),
        },
      })
    })

    await createAuditLog({
      action: 'EXECUTE',
      module: 'KENAIKAN_KELAS',
      recordId: processId,
      description: `Mengeksekusi kenaikan kelas: ${process.dariTahunAjaran.nama} → ${process.keTahunAjaran.nama} (${process.detailKenaikan.length} siswa)`,
    })

    return { success: true }
  } catch (error: any) {
    // Rollback status
    await prisma.prosesKenaikanKelas.update({
      where: { id: processId },
      data: { status: 'GAGAL' },
    })

    console.error('Promotion execution error:', error)
    return { error: `Terjadi kesalahan saat memproses: ${error.message}` }
  }
}

// ─── Cancel Promotion ─────────────────────────────────────────────
export async function cancelPromotion(processId: string) {
  await requireAuth()

  const process = await prisma.prosesKenaikanKelas.findUnique({
    where: { id: processId },
    select: { id: true, status: true, dariTahunAjaran: { select: { nama: true } }, keTahunAjaran: { select: { nama: true } } },
  })

  if (!process) return { error: 'Proses tidak ditemukan' }
  if (process.status !== 'DRAFT' && process.status !== 'GAGAL') {
    return { error: 'Hanya proses draft atau gagal yang dapat dibatalkan' }
  }

  await prisma.prosesKenaikanKelas.delete({
    where: { id: processId },
  })

  await createAuditLog({
    action: 'DELETE',
    module: 'KENAIKAN_KELAS',
    recordId: processId,
    description: `Membatalkan proses kenaikan kelas: ${process.dariTahunAjaran.nama} → ${process.keTahunAjaran.nama}`,
  })

  return { success: true }
}

// ─── Student Academic History ─────────────────────────────────────
export async function getStudentAcademicHistory(studentId: string) {
  await requireAuth()

  return prisma.riwayatAkademik.findMany({
    where: { siswaId: studentId },
    include: {
      tahunAjaran: { select: { id: true, nama: true, mulai: true, selesai: true } },
      kelas: { select: { namaKelas: true, tingkat: true } },
    },
    orderBy: { tahunAjaran: { mulai: 'asc' } },
  })
}
