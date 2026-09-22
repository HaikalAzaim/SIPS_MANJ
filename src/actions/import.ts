'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// ── Types ─────────────────────────────────────────────────────────
export interface ImportRowResult {
  rowIndex: number
  valid: boolean
  errors: string[]
  data: Record<string, any>
}

export interface ImportValidationResult {
  totalRows: number
  validCount: number
  errorCount: number
  rows: ImportRowResult[]
}

// ── SISWA ─────────────────────────────────────────────────────────

const SISWA_HEADERS = ['NISN', 'NIUP', 'Nama Lengkap', 'Jenis Kelamin', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Tahun Masuk']

export async function validateSiswaImport(rawRows: Record<string, any>[]): Promise<ImportValidationResult> {
  await requireAuth()

  // Fetch kelas mapping from DB
  const kelasList = await prisma.kelas.findMany({
    where: { deletedAt: null, status: true },
    select: { id: true, namaKelas: true },
  })
  const kelasMap = new Map(kelasList.map(k => [k.namaKelas.trim().toLowerCase(), k.id]))

  // Fetch existing NISN/NIUP for duplicate check
  const existingSiswa = await prisma.siswa.findMany({
    where: { deletedAt: null },
    select: { nisn: true, niup: true },
  })
  const existingNisn = new Set(existingSiswa.map(s => s.nisn))
  const existingNiup = new Set(existingSiswa.map(s => s.niup))

  // Track duplicates within the file itself
  const fileNisn = new Map<string, number>()
  const fileNiup = new Map<string, number>()

  const rows: ImportRowResult[] = rawRows.map((raw, idx) => {
    const errors: string[] = []
    const rowIndex = idx + 1

    // Trim all values
    const nisn         = String(raw['NISN'] ?? '').trim()
    const niup         = String(raw['NIUP'] ?? '').trim()
    const nama         = String(raw['Nama Lengkap'] ?? '').trim()
    const jenisKelamin = String(raw['Jenis Kelamin'] ?? '').trim()
    const kelas        = String(raw['Kelas'] ?? '').trim()
    const tempatLahir  = String(raw['Tempat Lahir'] ?? '').trim()
    const tanggalLahir = String(raw['Tanggal Lahir'] ?? '').trim()
    const alamat       = String(raw['Alamat'] ?? '').trim()
    const tahunMasukStr = String(raw['Tahun Masuk'] ?? '').trim()

    // ─ Required validations ─
    if (!nisn)         errors.push('NISN wajib diisi')
    if (!niup)         errors.push('NIUP wajib diisi')
    if (!nama)         errors.push('Nama Lengkap wajib diisi')
    if (!jenisKelamin) errors.push('Jenis Kelamin wajib diisi')
    if (!kelas)        errors.push('Kelas wajib diisi')

    if (nisn && nisn.length > 20) errors.push('NISN maksimal 20 karakter')
    if (niup && niup.length > 20) errors.push('NIUP maksimal 20 karakter')
    if (nama && nama.length > 100) errors.push('Nama maksimal 100 karakter')

    // ─ Enum validation ─
    let jenisKelaminVal: 'LAKI_LAKI' | 'PEREMPUAN' | null = null
    if (jenisKelamin) {
      const lower = jenisKelamin.toLowerCase()
      if (lower === 'laki-laki' || lower === 'l') jenisKelaminVal = 'LAKI_LAKI'
      else if (lower === 'perempuan' || lower === 'p') jenisKelaminVal = 'PEREMPUAN'
      else errors.push('Jenis Kelamin harus "Laki-laki" atau "Perempuan"')
    }

    // ─ Kelas lookup ─
    let kelasId: string | null = null
    if (kelas) {
      kelasId = kelasMap.get(kelas.toLowerCase()) || null
      if (!kelasId) errors.push(`Kelas "${kelas}" tidak ditemukan di SIPS`)
    }

    // ─ Duplicate: DB ─
    if (nisn && existingNisn.has(nisn)) errors.push(`NISN "${nisn}" sudah terdaftar di database`)
    if (niup && existingNiup.has(niup)) errors.push(`NIUP "${niup}" sudah terdaftar di database`)

    // ─ Duplicate: within file ─
    if (nisn) {
      if (fileNisn.has(nisn)) errors.push(`NISN "${nisn}" duplikat dengan baris ${fileNisn.get(nisn)}`)
      else fileNisn.set(nisn, rowIndex)
    }
    if (niup) {
      if (fileNiup.has(niup)) errors.push(`NIUP "${niup}" duplikat dengan baris ${fileNiup.get(niup)}`)
      else fileNiup.set(niup, rowIndex)
    }

    // ─ Optional: Tanggal Lahir format ─
    let parsedTanggalLahir: string | null = null
    if (tanggalLahir) {
      const d = new Date(tanggalLahir)
      if (isNaN(d.getTime())) errors.push('Format Tanggal Lahir tidak valid (gunakan YYYY-MM-DD)')
      else parsedTanggalLahir = d.toISOString().split('T')[0]
    }

    // ─ Optional: Tahun Masuk ─
    let tahunMasuk: number | null = null
    if (tahunMasukStr) {
      const n = Number(tahunMasukStr)
      if (isNaN(n) || n < 1900 || n > 2100) errors.push('Tahun Masuk harus angka 4 digit yang valid')
      else tahunMasuk = n
    }

    return {
      rowIndex,
      valid: errors.length === 0,
      errors,
      data: {
        nisn, niup, nama,
        jenisKelamin: jenisKelaminVal,
        kelasId,
        kelasNama: kelas,
        tempatLahir: tempatLahir || null,
        tanggalLahir: parsedTanggalLahir,
        alamat: alamat || null,
        tahunMasuk,
      },
    }
  })

  return {
    totalRows: rows.length,
    validCount: rows.filter(r => r.valid).length,
    errorCount: rows.filter(r => !r.valid).length,
    rows,
  }
}

export async function importSiswaBatch(validRows: ImportRowResult[]): Promise<{ success: boolean; imported: number; error?: string }> {
  await requireAuth()

  const toInsert = validRows.filter(r => r.valid)
  if (toInsert.length === 0) return { success: false, imported: 0, error: 'Tidak ada data valid untuk diimport' }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = []
      for (const row of toInsert) {
        const d = row.data
        const siswa = await tx.siswa.create({
          data: {
            nisn: d.nisn,
            niup: d.niup,
            nama: d.nama,
            jenisKelamin: d.jenisKelamin,
            kelasId: d.kelasId,
            tempatLahir: d.tempatLahir,
            tanggalLahir: d.tanggalLahir ? new Date(d.tanggalLahir) : null,
            alamat: d.alamat,
            tahunMasuk: d.tahunMasuk,
          },
        })
        created.push(siswa)
      }
      return created
    })

    await createAuditLog({
      action: 'IMPORT',
      module: 'SISWA',
      description: `Import massal ${result.length} data siswa`,
    })

    return { success: true, imported: result.length }
  } catch (error: any) {
    console.error('Import siswa batch error:', error)
    return { success: false, imported: 0, error: error.message || 'Gagal mengimport data siswa' }
  }
}

// ── GURU ──────────────────────────────────────────────────────────

const GURU_HEADERS = ['NIUP', 'Nama Lengkap', 'Jenis Kelamin', 'Email', 'Nomor HP', 'Status']

export async function validateGuruImport(rawRows: Record<string, any>[]): Promise<ImportValidationResult> {
  await requireAuth()

  // Fetch existing NIUP for duplicate check
  const existingGuru = await prisma.guru.findMany({
    where: { deletedAt: null },
    select: { niup: true },
  })
  const existingNiup = new Set(existingGuru.map(g => g.niup))

  // Track duplicates within file
  const fileNiup = new Map<string, number>()

  const rows: ImportRowResult[] = rawRows.map((raw, idx) => {
    const errors: string[] = []
    const rowIndex = idx + 1

    const niup         = String(raw['NIUP'] ?? '').trim()
    const nama         = String(raw['Nama Lengkap'] ?? '').trim()
    const jenisKelamin = String(raw['Jenis Kelamin'] ?? '').trim()
    const email        = String(raw['Email'] ?? '').trim()
    const nomorHp      = String(raw['Nomor HP'] ?? '').trim()
    const statusStr    = String(raw['Status'] ?? '').trim()

    // ─ Required validations ─
    if (!niup)         errors.push('NIUP wajib diisi')
    if (!nama)         errors.push('Nama Lengkap wajib diisi')
    if (!jenisKelamin) errors.push('Jenis Kelamin wajib diisi')

    if (niup && niup.length > 30) errors.push('NIUP maksimal 30 karakter')
    if (nama && nama.length > 100) errors.push('Nama maksimal 100 karakter')

    // ─ Enum validation ─
    let jenisKelaminVal: 'LAKI_LAKI' | 'PEREMPUAN' | null = null
    if (jenisKelamin) {
      const lower = jenisKelamin.toLowerCase()
      if (lower === 'laki-laki' || lower === 'l') jenisKelaminVal = 'LAKI_LAKI'
      else if (lower === 'perempuan' || lower === 'p') jenisKelaminVal = 'PEREMPUAN'
      else errors.push('Jenis Kelamin harus "Laki-laki" atau "Perempuan"')
    }

    // ─ Email validation ─
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Format email tidak valid')
    }

    // ─ Status parsing ─
    let status = true
    if (statusStr) {
      const lower = statusStr.toLowerCase()
      if (lower === 'aktif') status = true
      else if (lower === 'nonaktif' || lower === 'non aktif' || lower === 'tidak aktif') status = false
      else errors.push('Status harus "Aktif" atau "Nonaktif"')
    }

    // ─ Duplicate: DB ─
    if (niup && existingNiup.has(niup)) errors.push(`NIUP "${niup}" sudah terdaftar di database`)

    // ─ Duplicate: within file ─
    if (niup) {
      if (fileNiup.has(niup)) errors.push(`NIUP "${niup}" duplikat dengan baris ${fileNiup.get(niup)}`)
      else fileNiup.set(niup, rowIndex)
    }

    return {
      rowIndex,
      valid: errors.length === 0,
      errors,
      data: {
        niup, nama,
        jenisKelamin: jenisKelaminVal,
        email: email || null,
        nomorHp: nomorHp || null,
        status,
      },
    }
  })

  return {
    totalRows: rows.length,
    validCount: rows.filter(r => r.valid).length,
    errorCount: rows.filter(r => !r.valid).length,
    rows,
  }
}

export async function importGuruBatch(validRows: ImportRowResult[]): Promise<{ success: boolean; imported: number; error?: string }> {
  await requireAuth()

  const toInsert = validRows.filter(r => r.valid)
  if (toInsert.length === 0) return { success: false, imported: 0, error: 'Tidak ada data valid untuk diimport' }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = []
      for (const row of toInsert) {
        const d = row.data
        const guru = await tx.guru.create({
          data: {
            niup: d.niup,
            nama: d.nama,
            jenisKelamin: d.jenisKelamin,
            email: d.email,
            nomorHp: d.nomorHp,
            status: d.status,
          },
        })
        created.push(guru)
      }
      return created
    })

    await createAuditLog({
      action: 'IMPORT',
      module: 'GURU',
      description: `Import massal ${result.length} data guru`,
    })

    return { success: true, imported: result.length }
  } catch (error: any) {
    console.error('Import guru batch error:', error)
    return { success: false, imported: 0, error: error.message || 'Gagal mengimport data guru' }
  }
}

// ── Helpers for client: get expected headers ──────────────────────
export async function getSiswaHeaders() { return SISWA_HEADERS }
export async function getGuruHeaders() { return GURU_HEADERS }

