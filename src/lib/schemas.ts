import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const userSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']),
  status: z.boolean().default(true),
})

export const siswaSchema = z.object({
  nisn: z.string().min(1, 'NISN wajib diisi').max(20),
  niup: z.string().min(1, 'NIUP wajib diisi').max(20),
  nama: z.string().min(1, 'Nama wajib diisi').max(100),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  kelasId: z.string().min(1, 'Kelas wajib dipilih'),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  alamat: z.string().optional(),
  tahunMasuk: z.number().optional(),
  foto: z.string().optional(),
})

export const guruSchema = z.object({
  niup: z.string().min(1, 'NIUP wajib diisi').max(30),
  nama: z.string().min(1, 'Nama wajib diisi').max(100),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  nomorHp: z.string().optional(),
  foto: z.string().optional(),
  status: z.boolean().default(true),
})

export const kelasSchema = z.object({
  namaKelas: z.string().min(1, 'Nama kelas wajib diisi').max(50),
  tingkat: z.string().min(1, 'Tingkat wajib diisi'),
  jurusan: z.string().optional(),
  waliKelasId: z.string().optional(),
  status: z.boolean().default(true),
})

export const kategoriPelanggaranSchema = z.object({
  nama: z.string().min(1, 'Nama pelanggaran wajib diisi').max(200),
  deskripsi: z.string().optional(),
  poin: z.number().min(1, 'Poin minimal 1'),
  tingkat: z.enum(['RINGAN', 'SEDANG', 'BERAT', 'SANGAT_BERAT']),
  status: z.boolean().default(true),
})

export const pelanggaranSchema = z.object({
  siswaId: z.string().min(1, 'Siswa wajib dipilih'),
  kategoriPelanggaranId: z.string().min(1, 'Kategori pelanggaran wajib dipilih'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  waktu: z.string().min(1, 'Waktu wajib diisi'),
  lokasi: z.string().optional(),
  keterangan: z.string().optional(),
})

export const thresholdSchema = z.object({
  namaStatus: z.string().min(1, 'Nama status wajib diisi'),
  minimumPoin: z.number().min(0, 'Minimum poin tidak boleh negatif'),
  maximumPoin: z.number().nullable().optional(),
  tindakan: z.string().optional(),
  warna: z.string().min(1, 'Warna wajib diisi'),
})

export const suratTeguranSchema = z.object({
  siswaId: z.string().min(1, 'Siswa wajib dipilih'),
  jenisTeguran: z.string().min(1, 'Jenis teguran wajib diisi'),
  keterangan: z.string().optional(),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  nomorSurat: z.string().optional(), // jika kosong, auto-generate
})

export const systemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
})

export const tahunAjaranSchema = z.object({
  nama: z.string().min(1, 'Nama tahun ajaran wajib diisi').regex(/^\d{4}\/\d{4}$/, 'Format harus YYYY/YYYY'),
  mulai: z.string().min(1, 'Tanggal mulai wajib diisi'),
  selesai: z.string().min(1, 'Tanggal selesai wajib diisi'),
  isActive: z.boolean().default(false),
})

export const promotionProcessSchema = z.object({
  dariTahunAjaranId: z.string().min(1, 'Tahun ajaran asal wajib dipilih'),
  keTahunAjaranId: z.string().min(1, 'Tahun ajaran tujuan wajib dipilih'),
}).refine(data => data.dariTahunAjaranId !== data.keTahunAjaranId, {
  message: 'Tahun ajaran asal dan tujuan tidak boleh sama',
  path: ['keTahunAjaranId'],
})

export const bulkStatusUpdateSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'Pilih minimal satu siswa'),
  status: z.enum(['NAIK_KELAS', 'TINGGAL_KELAS', 'LULUS', 'PINDAH_SEKOLAH', 'TIDAK_AKTIF', 'BELUM_DITENTUKAN']),
  keKelasId: z.string().nullable().optional(),
  catatan: z.string().optional(),
})

export type StatusKenaikan =
  | 'NAIK_KELAS'
  | 'TINGGAL_KELAS'
  | 'LULUS'
  | 'PINDAH_SEKOLAH'
  | 'TIDAK_AKTIF'
  | 'BELUM_DITENTUKAN'

export type StatusProses =
  | 'DRAFT'
  | 'SEDANG_DIPROSES'
  | 'SELESAI'
  | 'GAGAL'

export type StatusAkademik =
  | 'AKTIF'
  | 'NAIK_KELAS'
  | 'TINGGAL_KELAS'
  | 'LULUS'
  | 'PINDAH_SEKOLAH'
  | 'TIDAK_AKTIF'

export type LoginInput = z.infer<typeof loginSchema>
export type UserInput = z.infer<typeof userSchema>
export type SiswaInput = z.infer<typeof siswaSchema>
export type GuruInput = z.infer<typeof guruSchema>
export type KelasInput = z.infer<typeof kelasSchema>
export type KategoriPelanggaranInput = z.infer<typeof kategoriPelanggaranSchema>
export type PelanggaranInput = z.infer<typeof pelanggaranSchema>
export type ThresholdInput = z.infer<typeof thresholdSchema>
export type SuratTeguranInput = z.infer<typeof suratTeguranSchema>
export type TahunAjaranInput = z.infer<typeof tahunAjaranSchema>
export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>
