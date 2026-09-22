const { PrismaClient, JenisKelamin } = require('@prisma/client');
const prisma = new PrismaClient();

const DATA_SISWA_RAW = [
  // 25 Siswa Laki-laki
  { nama: 'Ahmad Fauzi Ramadhan', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-04-12', alamat: 'Jl. Cihampelas No. 45, Bandung' },
  { nama: 'Bayu Aji Pratama', jk: 'LAKI_LAKI', kota: 'Cimahi', tglLahir: '2008-07-21', alamat: 'Jl. Gandawijaya No. 18, Cimahi' },
  { nama: 'Bima Arya Wijaya', jk: 'LAKI_LAKI', kota: 'Jakarta', tglLahir: '2007-11-03', alamat: 'Jl. Tebet Barat No. 82, Jakarta Selatan' },
  { nama: 'Daffa Rizki Pratama', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-01-15', alamat: 'Jl. Riau No. 102, Bandung' },
  { nama: 'Danendra Alamsyah', jk: 'LAKI_LAKI', kota: 'Bogor', tglLahir: '2007-09-28', alamat: 'Jl. Pajajaran No. 34, Bogor' },
  { nama: 'Derry Setiawan', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2006-12-05', alamat: 'Jl. Kopo Cirangrang No. 71, Bandung' },
  { nama: 'Eko Wahyudi', jk: 'LAKI_LAKI', kota: 'Surabaya', tglLahir: '2007-03-14', alamat: 'Jl. Darmo No. 55, Surabaya' },
  { nama: 'Farhan Maulana', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-06-19', alamat: 'Jl. Buah Batu No. 129, Bandung' },
  { nama: 'Galang Saputra', jk: 'LAKI_LAKI', kota: 'Garut', tglLahir: '2008-08-30', alamat: 'Jl. Cimanuk No. 23, Garut' },
  { nama: 'Gilang Ramadhan', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2007-05-11', alamat: 'Jl. Soekarno Hatta No. 420, Bandung' },
  { nama: 'Hafiz Zikri Akbar', jk: 'LAKI_LAKI', kota: 'Tasikmalaya', tglLahir: '2006-10-22', alamat: 'Jl. HZ Mustofa No. 88, Tasikmalaya' },
  { nama: 'Ilham Kurniawan', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-02-17', alamat: 'Jl. Setiabudi No. 201, Bandung' },
  { nama: 'Irfan Firmansyah', jk: 'LAKI_LAKI', kota: 'Cirebon', tglLahir: '2007-08-09', alamat: 'Jl. Kartini No. 15, Cirebon' },
  { nama: 'Kevin Julian Putra', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-11-25', alamat: 'Jl. Pasteur No. 63, Bandung' },
  { nama: 'Muhammad Ardiansyah', jk: 'LAKI_LAKI', kota: 'Semarang', tglLahir: '2007-04-04', alamat: 'Jl. Pemuda No. 90, Semarang' },
  { nama: 'Muhammad Fakhri Pratama', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-09-13', alamat: 'Jl. Antapani Raya No. 51, Bandung' },
  { nama: 'Muhammad Raihan', jk: 'LAKI_LAKI', kota: 'Depok', tglLahir: '2006-08-18', alamat: 'Jl. Margonda Raya No. 210, Depok' },
  { nama: 'Naufal Azhar', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-03-08', alamat: 'Jl. Sukajadi No. 112, Bandung' },
  { nama: 'Raditya Daniswara', jk: 'LAKI_LAKI', kota: 'Yogyakarta', tglLahir: '2007-07-07', alamat: 'Jl. Malioboro No. 40, Yogyakarta' },
  { nama: 'Rafi Ahmad Santoso', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-10-16', alamat: 'Jl. Dago No. 84, Bandung' },
  { nama: 'Rendy Saputra', jk: 'LAKI_LAKI', kota: 'Bekasi', tglLahir: '2006-11-19', alamat: 'Jl. Ahmad Yani No. 14, Bekasi' },
  { nama: 'Rizky Maulana', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2008-05-24', alamat: 'Jl. Dipatiukur No. 37, Bandung' },
  { nama: 'Satria Bagaskara', jk: 'LAKI_LAKI', kota: 'Surakarta', tglLahir: '2007-01-30', alamat: 'Jl. Slamet Riyadi No. 66, Surakarta' },
  { nama: 'Tegar Wicaksono', jk: 'LAKI_LAKI', kota: 'Bandung', tglLahir: '2006-09-02', alamat: 'Jl. Laswi No. 19, Bandung' },
  { nama: 'Yusuf Al-Farizi', jk: 'LAKI_LAKI', kota: 'Sukabumi', tglLahir: '2007-12-14', alamat: 'Jl. Suryakencana No. 72, Sukabumi' },

  // 25 Siswi Perempuan
  { nama: 'Amanda Putri Rahayu', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2008-03-25', alamat: 'Jl. Anggrek No. 14, Bandung' },
  { nama: 'Anindya Zahra Kirana', jk: 'PEREMPUAN', kota: 'Jakarta', tglLahir: '2008-06-14', alamat: 'Jl. Kemang Raya No. 27, Jakarta Selatan' },
  { nama: 'Annisa Permata Sari', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2007-10-09', alamat: 'Jl. Cempaka No. 5, Bandung' },
  { nama: 'Ayu Lestari Dewi', jk: 'PEREMPUAN', kota: 'Cimahi', tglLahir: '2008-01-19', alamat: 'Jl. Kolonel Masturi No. 42, Cimahi' },
  { nama: 'Cantika Dwi Cahyani', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2006-12-31', alamat: 'Jl. Kenanga No. 8, Bandung' },
  { nama: 'Chelsea Olivia Putri', jk: 'PEREMPUAN', kota: 'Bogor', tglLahir: '2007-05-02', alamat: 'Jl. Pajajaran No. 110, Bogor' },
  { nama: 'Dea Ananda', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2008-07-08', alamat: 'Jl. Melati No. 63, Bandung' },
  { nama: 'Desi Ratnasari', jk: 'PEREMPUAN', kota: 'Sukabumi', tglLahir: '2007-09-17', alamat: 'Jl. RE Martadinata No. 21, Sukabumi' },
  { nama: 'Farah Salsabila', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2008-04-03', alamat: 'Jl. Terusan Buah Batu No. 91, Bandung' },
  { nama: 'Fitri Handayani', jk: 'PEREMPUAN', kota: 'Garut', tglLahir: '2006-11-12', alamat: 'Jl. Patriot No. 33, Garut' },
  { nama: 'Indah Permatasari', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2007-08-20', alamat: 'Jl. Cisangkuy No. 16, Bandung' },
  { nama: 'Intan Nur Aini', jk: 'PEREMPUAN', kota: 'Cirebon', tglLahir: '2008-02-28', alamat: 'Jl. Siliwangi No. 48, Cirebon' },
  { nama: 'Keisha Aurelia', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2008-10-05', alamat: 'Jl. Progo No. 9, Bandung' },
  { nama: 'Larasati Sekar Arum', jk: 'PEREMPUAN', kota: 'Yogyakarta', tglLahir: '2007-06-18', alamat: 'Jl. Kaliurang Km 5 No. 12, Yogyakarta' },
  { nama: 'Melati Sukma Dewi', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2006-10-10', alamat: 'Jl. Trunojoyo No. 25, Bandung' },
  { nama: 'Nabilla Syakira', jk: 'PEREMPUAN', kota: 'Tangerang', tglLahir: '2008-08-15', alamat: 'Jl. BSD Raya Utama No. 8, Tangerang' },
  { nama: 'Nadya Putri Utami', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2007-03-22', alamat: 'Jl. Lombok No. 11, Bandung' },
  { nama: 'Nasywa Kayla', jk: 'PEREMPUAN', kota: 'Depok', tglLahir: '2008-12-01', alamat: 'Jl. Juanda No. 70, Depok' },
  { nama: 'Putri Rahmadani', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2007-01-14', alamat: 'Jl. Banda No. 30, Bandung' },
  { nama: 'Raisa Azzahra', jk: 'PEREMPUAN', kota: 'Jakarta', tglLahir: '2008-05-09', alamat: 'Jl. Menteng Raya No. 44, Jakarta Pusat' },
  { nama: 'Rania Maharani', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2006-07-29', alamat: 'Jl. Gempol No. 7, Bandung' },
  { nama: 'Salma Khairunnisa', jk: 'PEREMPUAN', kota: 'Malang', tglLahir: '2008-09-16', alamat: 'Jl. Ijen No. 52, Malang' },
  { nama: 'Salsabila Putri', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2007-11-23', alamat: 'Jl. Supratman No. 89, Bandung' },
  { nama: 'Siti Aisyah Nurhaliza', jk: 'PEREMPUAN', kota: 'Tasikmalaya', tglLahir: '2008-04-18', alamat: 'Jl. Sutisna Senjaya No. 64, Tasikmalaya' },
  { nama: 'Tiara Maharani', jk: 'PEREMPUAN', kota: 'Bandung', tglLahir: '2006-08-04', alamat: 'Jl. Bengawan No. 22, Bandung' },
];

async function main() {
  console.log('🚀 Memulai penambahan 50 data siswa demo & testing...');

  // 1. Ambil data pendukung
  const kelasList = await prisma.kelas.findMany({
    where: { deletedAt: null },
    orderBy: { tingkat: 'asc' },
  });

  if (kelasList.length === 0) {
    throw new Error('Tidak ada data kelas yang aktif! Harap buat kelas terlebih dahulu.');
  }

  const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
  });

  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
  });

  const kategoriPelanggaranList = await prisma.kategoriPelanggaran.findMany({
    where: { deletedAt: null },
    orderBy: { poin: 'asc' },
  });

  console.log(`ℹ️ Ditemukan ${kelasList.length} kelas aktif:`);
  kelasList.forEach((k, idx) => console.log(`   ${idx + 1}. [${k.tingkat}] ${k.namaKelas} (ID: ${k.id})`));
  console.log(`ℹ️ Tahun Ajaran Aktif: ${tahunAjaranAktif ? tahunAjaranAktif.nama : 'TIDAK ADA'}`);

  // 2. Tentukan offset NISN & NIUP agar tidak duplikat dengan data yang ada
  const existingSiswa = await prisma.siswa.findMany({
    select: { nisn: true, niup: true },
  });
  const existingNisns = new Set(existingSiswa.map((s) => s.nisn));
  const existingNiups = new Set(existingSiswa.map((s) => s.niup));

  let nisnCounter = 600;
  let niupCounter = 100;

  function generateUniqueNisn() {
    while (true) {
      nisnCounter++;
      const candidate = `0081234${String(nisnCounter).padStart(3, '0')}`;
      if (!existingNisns.has(candidate)) {
        existingNisns.add(candidate);
        return candidate;
      }
    }
  }

  function generateUniqueNiup(tahunMasuk) {
    while (true) {
      niupCounter++;
      const prefix = tahunMasuk === 2024 ? '2425' : tahunMasuk === 2023 ? '2324' : '2223';
      const candidate = `${prefix}${String(niupCounter).padStart(4, '0')}`;
      if (!existingNiups.has(candidate)) {
        existingNiups.add(candidate);
        return candidate;
      }
    }
  }

  // 3. Masukkan 50 data siswa
  const createdStudents = [];
  for (let i = 0; i < DATA_SISWA_RAW.length; i++) {
    const raw = DATA_SISWA_RAW[i];
    // Distribusi kelas merata
    const targetKelas = kelasList[i % kelasList.length];

    // Tentukan tahunMasuk berdasarkan tingkat kelas
    let tahunMasuk = 2024;
    if (targetKelas.tingkat === 'XI') tahunMasuk = 2023;
    if (targetKelas.tingkat === 'XII') tahunMasuk = 2022;

    const nisn = generateUniqueNisn();
    const niup = generateUniqueNiup(tahunMasuk);

    const siswa = await prisma.siswa.create({
      data: {
        nisn,
        niup,
        nama: raw.nama,
        jenisKelamin: raw.jk === 'LAKI_LAKI' ? JenisKelamin.LAKI_LAKI : JenisKelamin.PEREMPUAN,
        kelasId: targetKelas.id,
        tempatLahir: raw.kota,
        tanggalLahir: new Date(raw.tglLahir),
        alamat: raw.alamat,
        tahunMasuk,
        status: true,
      },
    });

    // Buat riwayat akademik jika tahun ajaran aktif ada
    if (tahunAjaranAktif) {
      await prisma.riwayatAkademik.create({
        data: {
          siswaId: siswa.id,
          tahunAjaranId: tahunAjaranAktif.id,
          kelasId: targetKelas.id,
          status: 'AKTIF',
        },
      });
    }

    createdStudents.push({
      siswa,
      kelas: targetKelas,
    });
  }

  console.log(`✅ Berhasil menambahkan ${createdStudents.length} siswa demo ke database.`);

  // 4. Tambahkan demo pelanggaran untuk ~18 siswa agar pagination & filter poin/pelanggaran dapat dites secara realistis
  if (adminUser && kategoriPelanggaranList.length > 0) {
    console.log('📌 Menambahkan contoh pelanggaran realistis untuk pengujian...');

    // Pelanggaran ringan (terlambat, seragam)
    const pelanggaranSamples = [
      { studentIdx: 0, katIdx: 0, waktu: '07:15', ket: 'Terlambat 15 menit apel pagi', daysAgo: 2 },
      { studentIdx: 0, katIdx: 1, waktu: '07:30', ket: 'Tidak memakai dasi upacara', daysAgo: 5 },
      { studentIdx: 2, katIdx: 3, waktu: '10:20', ket: 'Membolos saat pelajaran matematika di kantin', daysAgo: 4 },
      { studentIdx: 3, katIdx: 0, waktu: '07:25', ket: 'Terlambat masuk sekolah gerbang ditutup', daysAgo: 8 },
      { studentIdx: 5, katIdx: 4, waktu: '11:00', ket: 'Bermain game online saat jam pelajaran', daysAgo: 6 },
      { studentIdx: 7, katIdx: 0, waktu: '07:20', ket: 'Terlambat 20 menit jam pertama', daysAgo: 1 },
      { studentIdx: 8, katIdx: 2, waktu: '12:45', ket: 'Membuang bungkus makanan di selasar kelas', daysAgo: 9 },
      { studentIdx: 10, katIdx: 5, waktu: '14:10', ket: 'Membawa rokok/vape di toilet lantai 2', daysAgo: 3 },
      { studentIdx: 12, katIdx: 1, waktu: '07:05', ket: 'Sepatu tidak sesuai ketentuan (berwarna)', daysAgo: 7 },
      { studentIdx: 14, katIdx: 3, waktu: '09:45', ket: 'Tidak kembali ke kelas setelah jam istirahat', daysAgo: 11 },
      { studentIdx: 16, katIdx: 0, waktu: '07:10', ket: 'Terlambat 10 menit gerbang sekolah', daysAgo: 10 },
      { studentIdx: 18, katIdx: 6, waktu: '13:30', ket: 'Terlibat percekcokan fisik di area parkir', daysAgo: 12 },
      { studentIdx: 21, katIdx: 4, waktu: '10:30', ket: 'Menggunakan headset saat guru menjelaskan materi', daysAgo: 14 },
      { studentIdx: 25, katIdx: 0, waktu: '07:18', ket: 'Terlambat jam pertama upacara', daysAgo: 4 },
      { studentIdx: 27, katIdx: 1, waktu: '07:00', ket: 'Seragam tidak dimasukkan dan tidak mengenakan ikat pinggang', daysAgo: 15 },
      { studentIdx: 30, katIdx: 2, waktu: '12:30', ket: 'Meninggalkan sampah plastik di bangku kelas', daysAgo: 6 },
      { studentIdx: 35, katIdx: 0, waktu: '07:22', ket: 'Terlambat masuk kelas setelah istirahat', daysAgo: 8 },
      { studentIdx: 40, katIdx: 4, waktu: '08:40', ket: 'Membuat konten medsos saat KBM berlangsung', daysAgo: 5 },
    ];

    let countPelanggaran = 0;
    for (const sample of pelanggaranSamples) {
      if (sample.studentIdx < createdStudents.length) {
        const student = createdStudents[sample.studentIdx].siswa;
        const kat = kategoriPelanggaranList[sample.katIdx % kategoriPelanggaranList.length];
        const tanggal = new Date();
        tanggal.setDate(tanggal.getDate() - sample.daysAgo);

        await prisma.pelanggaran.create({
          data: {
            siswaId: student.id,
            kategoriPelanggaranId: kat.id,
            tanggal,
            waktu: sample.waktu,
            lokasi: 'Lingkungan Sekolah',
            keterangan: sample.ket,
            poin: kat.poin,
            dicatatOlehId: adminUser.id,
          },
        });
        countPelanggaran++;
      }
    }
    console.log(`✅ Berhasil menambahkan ${countPelanggaran} data pelanggaran untuk testing.`);
  }

  // 5. Tampilkan ringkasan data akhir
  const totalSiswaNow = await prisma.siswa.count({ where: { deletedAt: null } });
  const totalPelanggaranNow = await prisma.pelanggaran.count();

  console.log('\n========================================');
  console.log('🎉 SEED 50 DATA SISWA SUKSES!');
  console.log(`📊 Total Siswa di Database Sekarang : ${totalSiswaNow} siswa`);
  console.log(`📊 Total Pelanggaran di Database    : ${totalPelanggaranNow} catatan`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seed data siswa:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
