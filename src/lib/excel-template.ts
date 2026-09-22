'use server'

import ExcelJS from 'exceljs'

// ── Types ─────────────────────────────────────────────────────────
interface KelasRef {
  id: string
  namaKelas: string
  tingkat: string
  jurusan: string | null
}

// ── Shared Style Constants ────────────────────────────────────────
const NAVY_HEADER = 'FF0D1A2B'
const GOLD_TEXT   = 'FFD9A62E'
const WHITE_TEXT  = 'FFF5F7FA'
const BORDER_CLR  = 'FF1C2D43'
const ROW_ALT     = 'FF101F33'
const REQUIRED_FILL = 'FF1A2738'

const thinBorder: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: BORDER_CLR } }
const allBorders: Partial<ExcelJS.Borders> = {
  top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder,
}

function headerFont(bold = true): Partial<ExcelJS.Font> {
  return { name: 'Inter', size: 11, bold, color: { argb: GOLD_TEXT } }
}

function normalFont(): Partial<ExcelJS.Font> {
  return { name: 'Inter', size: 10, color: { argb: WHITE_TEXT } }
}

function mutedFont(): Partial<ExcelJS.Font> {
  return { name: 'Inter', size: 10, color: { argb: 'FF8FA4BD' } }
}

function headerFill(): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEADER } }
}

function requiredFill(): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: REQUIRED_FILL } }
}

function altRowFill(): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT } }
}

// ── Shared helpers ────────────────────────────────────────────────
function addReferensiKelasSheet(wb: ExcelJS.Workbook, kelasList: KelasRef[]) {
  const ws = wb.addWorksheet('Referensi Kelas', {
    properties: { tabColor: { argb: 'FF5B7A9D' } },
  })

  ws.columns = [
    { header: 'No',         key: 'no',        width: 6 },
    { header: 'Nama Kelas', key: 'namaKelas', width: 35 },
    { header: 'Tingkat',    key: 'tingkat',    width: 12 },
    { header: 'Jurusan',    key: 'jurusan',    width: 25 },
  ]

  // Header row styling
  const headerRow = ws.getRow(1)
  headerRow.font      = headerFont()
  headerRow.fill      = headerFill()
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.border    = allBorders
  headerRow.height    = 28

  // Data rows
  kelasList.forEach((k, i) => {
    const row = ws.addRow({ no: i + 1, namaKelas: k.namaKelas, tingkat: k.tingkat, jurusan: k.jurusan || '' })
    row.font      = normalFont()
    row.border    = allBorders
    row.alignment = { vertical: 'middle' }
    if (i % 2 === 1) row.fill = altRowFill()
  })

  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.autoFilter = { from: 'A1', to: 'D1' }
}

function addPetunjukSheet(
  wb: ExcelJS.Workbook,
  columns: { nama: string; keterangan: string; wajib: boolean; format: string; contoh: string; validasi: string }[],
) {
  const ws = wb.addWorksheet('Petunjuk', {
    properties: { tabColor: { argb: 'FFD9A62E' } },
  })

  ws.columns = [
    { header: 'Nama Kolom',       key: 'nama',       width: 20 },
    { header: 'Keterangan',       key: 'keterangan', width: 35 },
    { header: 'Wajib / Opsional', key: 'wajib',      width: 16 },
    { header: 'Tipe & Format',    key: 'format',     width: 22 },
    { header: 'Contoh',           key: 'contoh',     width: 25 },
    { header: 'Aturan Validasi',  key: 'validasi',   width: 40 },
  ]

  const headerRow = ws.getRow(1)
  headerRow.font      = headerFont()
  headerRow.fill      = headerFill()
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  headerRow.border    = allBorders
  headerRow.height    = 28

  columns.forEach((col, i) => {
    const row = ws.addRow({
      nama: col.nama,
      keterangan: col.keterangan,
      wajib: col.wajib ? '✅ Wajib' : 'Opsional',
      format: col.format,
      contoh: col.contoh,
      validasi: col.validasi,
    })
    row.font      = normalFont()
    row.border    = allBorders
    row.alignment = { vertical: 'middle', wrapText: true }
    row.height    = 36
    if (col.wajib) row.fill = requiredFill()
    else if (i % 2 === 1) row.fill = altRowFill()
  })

  // Extra notes row
  ws.addRow([])
  const noteRow = ws.addRow(['⚠️ CATATAN PENTING'])
  noteRow.font = { name: 'Inter', size: 11, bold: true, color: { argb: 'FFEF4444' } }

  const notes = [
    '1. Jangan mengubah atau memindahkan nama header kolom di Sheet Data.',
    '2. Hapus baris contoh sebelum mengupload data asli.',
    '3. Pastikan nilai Jenis Kelamin dan Kelas sesuai dropdown / referensi.',
    '4. NISN, NIUP, dan Nomor HP sudah diformat teks agar angka 0 di depan tidak hilang.',
    '5. File template ini dapat langsung diupload kembali ke SIPS setelah diisi.',
  ]
  notes.forEach(n => {
    const r = ws.addRow([n])
    r.font = mutedFont()
  })

  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

// ── Siswa Template ────────────────────────────────────────────────
export async function generateSiswaTemplate(kelasList: KelasRef[]): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SIPS'
  wb.created = new Date()

  // ─── Sheet 1: Data Siswa ───
  const ws = wb.addWorksheet('Data Siswa', {
    properties: { tabColor: { argb: 'FFD9A62E' } },
  })

  ws.columns = [
    { header: 'NISN',           key: 'nisn',         width: 18 },
    { header: 'NIUP',           key: 'niup',         width: 18 },
    { header: 'Nama Lengkap',   key: 'nama',         width: 30 },
    { header: 'Jenis Kelamin',  key: 'jenisKelamin', width: 16 },
    { header: 'Kelas',          key: 'kelas',        width: 30 },
    { header: 'Tempat Lahir',   key: 'tempatLahir',  width: 18 },
    { header: 'Tanggal Lahir',  key: 'tanggalLahir', width: 16 },
    { header: 'Alamat',         key: 'alamat',       width: 35 },
    { header: 'Tahun Masuk',    key: 'tahunMasuk',   width: 14 },
  ]

  // Header styling
  const headerRow = ws.getRow(1)
  headerRow.font      = headerFont()
  headerRow.fill      = headerFill()
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.border    = allBorders
  headerRow.height    = 32

  // Text format for identifier columns (prevent leading zero loss)
  ws.getColumn('nisn').numFmt = '@'
  ws.getColumn('niup').numFmt = '@'

  // Example rows
  const exampleRows = [
    {
      nisn: '0081234567', niup: '1234567890', nama: 'Ahmad Fauzan (Contoh)',
      jenisKelamin: 'Laki-laki', kelas: kelasList[0]?.namaKelas || 'X RPL 1',
      tempatLahir: 'Jakarta', tanggalLahir: '2008-05-15', alamat: 'Jl. Merdeka No. 10, Jakarta', tahunMasuk: 2024,
    },
    {
      nisn: '0089876543', niup: '9876543210', nama: 'Siti Nurhaliza (Contoh)',
      jenisKelamin: 'Perempuan', kelas: kelasList[1]?.namaKelas || 'X RPL 2',
      tempatLahir: 'Bandung', tanggalLahir: '2008-11-22', alamat: 'Jl. Asia Afrika No. 5, Bandung', tahunMasuk: 2024,
    },
  ]

  exampleRows.forEach(ex => {
    const row = ws.addRow(ex)
    row.font      = { name: 'Inter', size: 10, italic: true, color: { argb: 'FF64748B' } }
    row.alignment = { vertical: 'middle' }
    row.border    = allBorders
  })

  // Data validation: Jenis Kelamin dropdown (column D = col 4)
  const dataRowStart = 2
  const dataRowEnd = 1000
  ;(ws as any).dataValidations.add(`D${dataRowStart}:D${dataRowEnd}`, {
    type: 'list',
    allowBlank: false,
    formulae: ['"Laki-laki,Perempuan"'],
    showErrorMessage: true,
    errorTitle: 'Nilai Tidak Valid',
    error: 'Pilih Laki-laki atau Perempuan',
  })

  // Data validation: Kelas dropdown from Referensi Kelas sheet (column E = col 5)
  if (kelasList.length > 0) {
    ;(ws as any).dataValidations.add(`E${dataRowStart}:E${dataRowEnd}`, {
      type: 'list',
      allowBlank: false,
      formulae: [`'Referensi Kelas'!$B$2:$B$${kelasList.length + 1}`],
      showErrorMessage: true,
      errorTitle: 'Kelas Tidak Valid',
      error: 'Pilih kelas dari daftar referensi',
    })
  }

  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.autoFilter = { from: 'A1', to: 'I1' }

  // ─── Sheet 2: Petunjuk ───
  addPetunjukSheet(wb, [
    { nama: 'NISN',           keterangan: 'Nomor Induk Siswa Nasional',         wajib: true,  format: 'Teks (maks 20 karakter)',     contoh: '0081234567',           validasi: 'Wajib diisi, unik, tidak boleh duplikat' },
    { nama: 'NIUP',           keterangan: 'Nomor Induk Ustadz/Pendidik',        wajib: true,  format: 'Teks (maks 20 karakter)',     contoh: '1234567890',           validasi: 'Wajib diisi, unik, tidak boleh duplikat' },
    { nama: 'Nama Lengkap',   keterangan: 'Nama lengkap siswa',                 wajib: true,  format: 'Teks (maks 100 karakter)',    contoh: 'Ahmad Fauzan',         validasi: 'Wajib diisi' },
    { nama: 'Jenis Kelamin',  keterangan: 'L/P siswa',                          wajib: true,  format: 'Pilihan: Laki-laki/Perempuan', contoh: 'Laki-laki',            validasi: 'Wajib diisi, gunakan dropdown' },
    { nama: 'Kelas',          keterangan: 'Kelas siswa saat ini',               wajib: true,  format: 'Nama kelas sesuai referensi', contoh: 'X RPL 1',              validasi: 'Wajib diisi, harus sesuai data kelas di SIPS' },
    { nama: 'Tempat Lahir',   keterangan: 'Kota/kabupaten tempat lahir',        wajib: false, format: 'Teks',                        contoh: 'Jakarta',              validasi: 'Opsional' },
    { nama: 'Tanggal Lahir',  keterangan: 'Tanggal lahir siswa',                wajib: false, format: 'YYYY-MM-DD',                  contoh: '2008-05-15',           validasi: 'Opsional, format tanggal harus benar' },
    { nama: 'Alamat',         keterangan: 'Alamat lengkap siswa',               wajib: false, format: 'Teks',                        contoh: 'Jl. Merdeka No. 10',   validasi: 'Opsional' },
    { nama: 'Tahun Masuk',    keterangan: 'Tahun masuk sekolah',                wajib: false, format: 'Angka 4 digit',               contoh: '2024',                 validasi: 'Opsional, angka 4 digit' },
  ])

  // ─── Sheet 3: Referensi Kelas ───
  addReferensiKelasSheet(wb, kelasList)

  // Write to buffer
  const arrayBuffer = await wb.xlsx.writeBuffer()
  return new Uint8Array(arrayBuffer)
}

// ── Guru Template ─────────────────────────────────────────────────
export async function generateGuruTemplate(kelasList: KelasRef[]): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SIPS'
  wb.created = new Date()

  // ─── Sheet 1: Data Guru ───
  const ws = wb.addWorksheet('Data Guru', {
    properties: { tabColor: { argb: 'FFD9A62E' } },
  })

  ws.columns = [
    { header: 'NIUP',           key: 'niup',         width: 20 },
    { header: 'Nama Lengkap',   key: 'nama',         width: 30 },
    { header: 'Jenis Kelamin',  key: 'jenisKelamin', width: 16 },
    { header: 'Email',          key: 'email',        width: 28 },
    { header: 'Nomor HP',       key: 'nomorHp',      width: 18 },
    { header: 'Status',         key: 'status',       width: 12 },
  ]

  // Header styling
  const headerRow = ws.getRow(1)
  headerRow.font      = headerFont()
  headerRow.fill      = headerFill()
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.border    = allBorders
  headerRow.height    = 32

  // Text format for identifier columns
  ws.getColumn('niup').numFmt    = '@'
  ws.getColumn('nomorHp').numFmt = '@'

  // Example rows
  const exampleRows = [
    {
      niup: '1122334455', nama: 'Ustadz Rahmat (Contoh)',
      jenisKelamin: 'Laki-laki', email: 'rahmat@sekolah.id',
      nomorHp: '081234567890', status: 'Aktif',
    },
    {
      niup: '5566778899', nama: 'Ustadzah Fatimah (Contoh)',
      jenisKelamin: 'Perempuan', email: 'fatimah@sekolah.id',
      nomorHp: '089876543210', status: 'Aktif',
    },
  ]

  exampleRows.forEach(ex => {
    const row = ws.addRow(ex)
    row.font      = { name: 'Inter', size: 10, italic: true, color: { argb: 'FF64748B' } }
    row.alignment = { vertical: 'middle' }
    row.border    = allBorders
  })

  // Data validation: Jenis Kelamin (col C = 3)
  const dataRowStart = 2
  const dataRowEnd   = 1000
  ;(ws as any).dataValidations.add(`C${dataRowStart}:C${dataRowEnd}`, {
    type: 'list',
    allowBlank: false,
    formulae: ['"Laki-laki,Perempuan"'],
    showErrorMessage: true,
    errorTitle: 'Nilai Tidak Valid',
    error: 'Pilih Laki-laki atau Perempuan',
  })

  // Data validation: Status (col F = 6)
  ;(ws as any).dataValidations.add(`F${dataRowStart}:F${dataRowEnd}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['"Aktif,Nonaktif"'],
    showErrorMessage: true,
    errorTitle: 'Nilai Tidak Valid',
    error: 'Pilih Aktif atau Nonaktif',
  })

  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.autoFilter = { from: 'A1', to: 'F1' }

  // ─── Sheet 2: Petunjuk ───
  addPetunjukSheet(wb, [
    { nama: 'NIUP',          keterangan: 'Nomor Induk Ustadz/Pendidik',  wajib: true,  format: 'Teks (maks 30 karakter)',      contoh: '1122334455',          validasi: 'Wajib diisi, unik, tidak boleh duplikat' },
    { nama: 'Nama Lengkap',  keterangan: 'Nama lengkap guru',            wajib: true,  format: 'Teks (maks 100 karakter)',     contoh: 'Ustadz Rahmat',       validasi: 'Wajib diisi' },
    { nama: 'Jenis Kelamin', keterangan: 'L/P guru',                     wajib: true,  format: 'Pilihan: Laki-laki/Perempuan', contoh: 'Laki-laki',           validasi: 'Wajib diisi, gunakan dropdown' },
    { nama: 'Email',         keterangan: 'Alamat email guru',            wajib: false, format: 'Format email valid',           contoh: 'rahmat@sekolah.id',   validasi: 'Opsional, format email harus benar' },
    { nama: 'Nomor HP',      keterangan: 'Nomor handphone guru',         wajib: false, format: 'Teks (nomor telepon)',         contoh: '081234567890',        validasi: 'Opsional' },
    { nama: 'Status',        keterangan: 'Status aktif/nonaktif guru',   wajib: false, format: 'Pilihan: Aktif/Nonaktif',      contoh: 'Aktif',               validasi: 'Opsional, default Aktif' },
  ])

  // ─── Sheet 3: Referensi Kelas ───
  addReferensiKelasSheet(wb, kelasList)

  // Write to buffer
  const arrayBuffer = await wb.xlsx.writeBuffer()
  return new Uint8Array(arrayBuffer)
}
