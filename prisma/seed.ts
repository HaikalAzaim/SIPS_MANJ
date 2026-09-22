import { PrismaClient, Role, JenisKelamin, TingkatPelanggaran } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai seeding database SIPS...')

  // 1. Bersihkan data lama jika ada
  await prisma.detailKenaikan.deleteMany()
  await prisma.prosesKenaikanKelas.deleteMany()
  await prisma.riwayatAkademik.deleteMany()
  await prisma.tahunAjaran.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.suratTeguran.deleteMany()
  await prisma.pelanggaran.deleteMany()
  await prisma.kategoriPelanggaran.deleteMany()
  await prisma.siswa.deleteMany()
  await prisma.kelas.deleteMany()
  await prisma.guru.deleteMany()
  await prisma.thresholdPoin.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.user.deleteMany()

  // 2. Buat Pengguna
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Administrator',
      email: 'admin@sips.sch.id',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      status: true,
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Staf Kesiswaan & BK',
      email: 'gurubk@sips.sch.id',
      password: hashedPassword,
      role: Role.ADMIN,
      status: true,
    },
  })

  console.log('✅ Pengguna berhasil dibuat:')
  console.log('   - admin@sips.sch.id / admin123 (SUPER_ADMIN)')
  console.log('   - gurubk@sips.sch.id / admin123 (ADMIN)')

  // 3. Threshold Poin
  const thresholds = [
    {
      namaStatus: 'Aman / Ringan',
      minimumPoin: 0,
      maximumPoin: 20,
      tindakan: 'Peringatan lisan oleh wali kelas & pembinaan',
      warna: '#22c55e',
    },
    {
      namaStatus: 'Peringatan I',
      minimumPoin: 21,
      maximumPoin: 45,
      tindakan: 'Surat Peringatan I & sesi konseling dengan Guru BK',
      warna: '#eab308',
    },
    {
      namaStatus: 'Peringatan II',
      minimumPoin: 46,
      maximumPoin: 75,
      tindakan: 'Surat Peringatan II & pemanggilan orang tua/wali ke sekolah',
      warna: '#f97316',
    },
    {
      namaStatus: 'Peringatan III / Kritis',
      minimumPoin: 76,
      maximumPoin: 100,
      tindakan: 'Surat Peringatan III, skorsing, atau sidang pleno kesiswaan',
      warna: '#ef4444',
    },
  ]

  for (const t of thresholds) {
    await prisma.thresholdPoin.create({ data: t })
  }
  console.log('✅ Threshold poin berhasil dibuat')

  // 4. Kategori Pelanggaran
  const kategoriList = [
    {
      nama: 'Terlambat Masuk Sekolah',
      poin: 5,
      tingkat: TingkatPelanggaran.RINGAN,
      deskripsi: 'Datang setelah bel masuk berbunyi (lewat pk. 07.00)',
    },
    {
      nama: 'Seragam Tidak Lengkap / Rapi',
      poin: 5,
      tingkat: TingkatPelanggaran.RINGAN,
      deskripsi: 'Tidak memakai dasi, sabuk, topi upacara, atau baju dikeluarkan',
    },
    {
      nama: 'Membuang Sampah Sembarangan',
      poin: 10,
      tingkat: TingkatPelanggaran.RINGAN,
      deskripsi: 'Mengotori lingkungan kelas atau area sekolah',
    },
    {
      nama: 'Membolos Jam Pelajaran',
      poin: 15,
      tingkat: TingkatPelanggaran.SEDANG,
      deskripsi: 'Meninggalkan kelas atau berada di kantin saat jam pelajaran',
    },
    {
      nama: 'Menggunakan HP Tanpa Izin Guru',
      poin: 20,
      tingkat: TingkatPelanggaran.SEDANG,
      deskripsi: 'Bermain game atau media sosial saat kegiatan belajar mengajar',
    },
    {
      nama: 'Merokok / Vape di Sekolah',
      poin: 30,
      tingkat: TingkatPelanggaran.SEDANG,
      deskripsi: 'Membawa atau menggunakan rokok/vape di lingkungan sekolah',
    },
    {
      nama: 'Berkelahi / Tindak Kekerasan',
      poin: 45,
      tingkat: TingkatPelanggaran.BERAT,
      deskripsi: 'Terlibat perkelahian fisik dengan sesama siswa',
    },
    {
      nama: 'Perundungan / Bullying',
      poin: 50,
      tingkat: TingkatPelanggaran.BERAT,
      deskripsi: 'Melakukan intimidasi fisik maupun verbal kepada siswa lain',
    },
    {
      nama: 'Merusak Fasilitas Sekolah',
      poin: 75,
      tingkat: TingkatPelanggaran.SANGAT_BERAT,
      deskripsi: 'Merusak sarana prasarana sekolah secara sengaja',
    },
    {
      nama: 'Terlibat Tawuran / Kriminalitas',
      poin: 100,
      tingkat: TingkatPelanggaran.SANGAT_BERAT,
      deskripsi: 'Terlibat aksi tawuran pelajar atau pelanggaran hukum pidana',
    },
  ]

  const createdKategori = []
  for (const k of kategoriList) {
    const item = await prisma.kategoriPelanggaran.create({ data: k })
    createdKategori.push(item)
  }
  console.log('✅ Kategori pelanggaran berhasil dibuat')

  // 5. Guru
  const guru1 = await prisma.guru.create({
    data: {
      niup: '198501012010011001',
      nama: 'Budi Santoso, S.Pd.',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      email: 'budi@sips.sch.id',
      nomorHp: '081234567891',
    },
  })

  const guru2 = await prisma.guru.create({
    data: {
      niup: '198702022011012002',
      nama: 'Siti Rahmawati, M.Pd.',
      jenisKelamin: JenisKelamin.PEREMPUAN,
      email: 'siti@sips.sch.id',
      nomorHp: '081234567892',
    },
  })

  const guru3 = await prisma.guru.create({
    data: {
      niup: '199003032015011003',
      nama: 'Ahmad Hidayat, S.Kom.',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      email: 'ahmad@sips.sch.id',
      nomorHp: '081234567893',
    },
  })

  console.log('✅ Data guru berhasil dibuat')

  // 6. Kelas
  const kelas10 = await prisma.kelas.create({
    data: {
      namaKelas: 'X Rekayasa Perangkat Lunak 1',
      tingkat: 'X',
      jurusan: 'RPL',
      waliKelasId: guru1.id,
    },
  })

  const kelas11 = await prisma.kelas.create({
    data: {
      namaKelas: 'XI Rekayasa Perangkat Lunak 1',
      tingkat: 'XI',
      jurusan: 'RPL',
      waliKelasId: guru2.id,
    },
  })

  const kelas12 = await prisma.kelas.create({
    data: {
      namaKelas: 'XII Teknik Komputer Jaringan 1',
      tingkat: 'XII',
      jurusan: 'TKJ',
      waliKelasId: guru3.id,
    },
  })

  console.log('✅ Data kelas berhasil dibuat')

  // 7. Siswa
  const siswaList = [
    {
      nisn: '0051234561',
      niup: '23241001',
      nama: 'Aditya Pratama',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      kelasId: kelas10.id,
      alamat: 'Jl. Merdeka No. 12, Bandung',
      tahunMasuk: 2024,
    },
    {
      nisn: '0051234562',
      niup: '23241002',
      nama: 'Bella Amanda Putri',
      jenisKelamin: JenisKelamin.PEREMPUAN,
      kelasId: kelas10.id,
      alamat: 'Jl. Melati No. 45, Bandung',
      tahunMasuk: 2024,
    },
    {
      nisn: '0041234563',
      niup: '22231015',
      nama: 'Dimas Bagus Saputra',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      kelasId: kelas11.id,
      alamat: 'Jl. Sudirman No. 88, Bandung',
      tahunMasuk: 2023,
    },
    {
      nisn: '0041234564',
      niup: '22231016',
      nama: 'Dina Lestari',
      jenisKelamin: JenisKelamin.PEREMPUAN,
      kelasId: kelas11.id,
      alamat: 'Jl. Gatot Subroto No. 3, Bandung',
      tahunMasuk: 2023,
    },
    {
      nisn: '0031234565',
      niup: '21221020',
      nama: 'Fajar Kurniawan',
      jenisKelamin: JenisKelamin.LAKI_LAKI,
      kelasId: kelas12.id,
      alamat: 'Jl. Asia Afrika No. 15, Bandung',
      tahunMasuk: 2022,
    },
  ]

  const createdSiswa = []
  for (const s of siswaList) {
    const item = await prisma.siswa.create({ data: s })
    createdSiswa.push(item)
  }

  console.log('✅ Data siswa berhasil dibuat')

  // 7b. Tahun Ajaran
  const tahunAjaran1 = await prisma.tahunAjaran.create({
    data: {
      nama: '2024/2025',
      mulai: new Date('2024-07-15'),
      selesai: new Date('2025-06-30'),
      isActive: false,
    },
  })

  const tahunAjaran2 = await prisma.tahunAjaran.create({
    data: {
      nama: '2025/2026',
      mulai: new Date('2025-07-14'),
      selesai: new Date('2026-06-30'),
      isActive: true,
    },
  })

  console.log('✅ Tahun ajaran berhasil dibuat')

  // 7c. Riwayat Akademik (siswa di tahun ajaran aktif)
  for (const siswa of createdSiswa) {
    await prisma.riwayatAkademik.create({
      data: {
        siswaId: siswa.id,
        tahunAjaranId: tahunAjaran2.id,
        kelasId: siswa.kelasId,
        status: 'AKTIF',
      },
    })
  }

  console.log('✅ Riwayat akademik berhasil dibuat')

  // 8. Contoh Catatan Pelanggaran
  await prisma.pelanggaran.create({
    data: {
      siswaId: createdSiswa[2].id, // Dimas
      kategoriPelanggaranId: createdKategori[0].id, // Terlambat (5 poin)
      waktu: '07:25',
      keterangan: 'Terlambat 20 menit pada jam pertama',
      poin: 5,
      dicatatOlehId: superAdmin.id,
      tanggal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.pelanggaran.create({
    data: {
      siswaId: createdSiswa[2].id, // Dimas
      kategoriPelanggaranId: createdKategori[3].id, // Membolos (15 poin)
      waktu: '10:15',
      keterangan: 'Ditemukan di warung belakang sekolah saat KBM',
      poin: 15,
      dicatatOlehId: admin.id,
      tanggal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.pelanggaran.create({
    data: {
      siswaId: createdSiswa[4].id, // Fajar
      kategoriPelanggaranId: createdKategori[1].id, // Seragam tidak rapi (5 poin)
      waktu: '06:55',
      keterangan: 'Tidak memakai dasi dan seragam dikeluarkan saat upacara',
      poin: 5,
      dicatatOlehId: superAdmin.id,
      tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Contoh pelanggaran berhasil dibuat')

  // 9. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'school_name', value: 'SMK Negeri 1 Teladan' },
      { key: 'school_address', value: 'Jl. Pendidikan No. 1, Jawa Barat' },
      { key: 'academic_year', value: '2025/2026' },
    ],
  })

  console.log('🎉 Seeding selesai dengan sukses!')
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
