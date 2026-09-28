-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: sips_db
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_log` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_log_user_id_idx` (`user_id`),
  KEY `audit_log_action_idx` (`action`),
  KEY `audit_log_module_idx` (`module`),
  KEY `audit_log_created_at_idx` (`created_at`),
  CONSTRAINT `audit_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detail_kenaikan`
--

DROP TABLE IF EXISTS `detail_kenaikan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detail_kenaikan` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proses_kenaikan_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siswa_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dari_kelas_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ke_kelas_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NAIK_KELAS','TINGGAL_KELAS','LULUS','PINDAH_SEKOLAH','TIDAK_AKTIF','BELUM_DITENTUKAN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BELUM_DITENTUKAN',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `detail_kenaikan_proses_kenaikan_id_siswa_id_key` (`proses_kenaikan_id`,`siswa_id`),
  KEY `detail_kenaikan_proses_kenaikan_id_idx` (`proses_kenaikan_id`),
  KEY `detail_kenaikan_siswa_id_idx` (`siswa_id`),
  KEY `detail_kenaikan_dari_kelas_id_fkey` (`dari_kelas_id`),
  KEY `detail_kenaikan_ke_kelas_id_fkey` (`ke_kelas_id`),
  CONSTRAINT `detail_kenaikan_dari_kelas_id_fkey` FOREIGN KEY (`dari_kelas_id`) REFERENCES `kelas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `detail_kenaikan_ke_kelas_id_fkey` FOREIGN KEY (`ke_kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `detail_kenaikan_proses_kenaikan_id_fkey` FOREIGN KEY (`proses_kenaikan_id`) REFERENCES `proses_kenaikan_kelas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detail_kenaikan_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guru`
--

DROP TABLE IF EXISTS `guru`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guru` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niup` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_kelamin` enum('LAKI_LAKI','PEREMPUAN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_hp` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guru_niup_key` (`niup`),
  KEY `guru_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kategori_pelanggaran`
--

DROP TABLE IF EXISTS `kategori_pelanggaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kategori_pelanggaran` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `poin` int NOT NULL,
  `tingkat` enum('RINGAN','SEDANG','BERAT','SANGAT_BERAT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RINGAN',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `kategori_pelanggaran_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kelas`
--

DROP TABLE IF EXISTS `kelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kelas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_kelas` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tingkat` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jurusan` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wali_kelas_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `kelas_wali_kelas_id_idx` (`wali_kelas_id`),
  KEY `kelas_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `kelas_wali_kelas_id_fkey` FOREIGN KEY (`wali_kelas_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `judul` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pesan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis` enum('THRESHOLD','SURAT_TEGURAN','PELANGGARAN_BARU','SISTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `dibaca` tinyint(1) NOT NULL DEFAULT '0',
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_idx` (`user_id`),
  KEY `notifications_dibaca_idx` (`dibaca`),
  KEY `notifications_created_at_idx` (`created_at`),
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pelanggaran`
--

DROP TABLE IF EXISTS `pelanggaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pelanggaran` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siswa_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori_pelanggaran_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` datetime(3) NOT NULL,
  `waktu` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lokasi` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `poin` int NOT NULL,
  `dicatat_oleh_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pelanggaran_siswa_id_idx` (`siswa_id`),
  KEY `pelanggaran_kategori_pelanggaran_id_idx` (`kategori_pelanggaran_id`),
  KEY `pelanggaran_dicatat_oleh_id_idx` (`dicatat_oleh_id`),
  KEY `pelanggaran_tanggal_idx` (`tanggal`),
  KEY `pelanggaran_created_at_idx` (`created_at`),
  CONSTRAINT `pelanggaran_dicatat_oleh_id_fkey` FOREIGN KEY (`dicatat_oleh_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `pelanggaran_kategori_pelanggaran_id_fkey` FOREIGN KEY (`kategori_pelanggaran_id`) REFERENCES `kategori_pelanggaran` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `pelanggaran_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proses_kenaikan_kelas`
--

DROP TABLE IF EXISTS `proses_kenaikan_kelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proses_kenaikan_kelas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dari_tahun_ajaran_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ke_tahun_ajaran_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','SEDANG_DIPROSES','SELESAI','GAGAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `total_siswa` int NOT NULL DEFAULT '0',
  `jumlah_naik` int NOT NULL DEFAULT '0',
  `jumlah_tinggal` int NOT NULL DEFAULT '0',
  `jumlah_lulus` int NOT NULL DEFAULT '0',
  `jumlah_pindah` int NOT NULL DEFAULT '0',
  `jumlah_tidak_aktif` int NOT NULL DEFAULT '0',
  `diproses_oleh_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diproses_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `proses_kenaikan_kelas_dari_tahun_ajaran_id_ke_tahun_ajaran_i_key` (`dari_tahun_ajaran_id`,`ke_tahun_ajaran_id`),
  KEY `proses_kenaikan_kelas_dari_tahun_ajaran_id_idx` (`dari_tahun_ajaran_id`),
  KEY `proses_kenaikan_kelas_ke_tahun_ajaran_id_idx` (`ke_tahun_ajaran_id`),
  KEY `proses_kenaikan_kelas_diproses_oleh_id_fkey` (`diproses_oleh_id`),
  CONSTRAINT `proses_kenaikan_kelas_dari_tahun_ajaran_id_fkey` FOREIGN KEY (`dari_tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `proses_kenaikan_kelas_diproses_oleh_id_fkey` FOREIGN KEY (`diproses_oleh_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `proses_kenaikan_kelas_ke_tahun_ajaran_id_fkey` FOREIGN KEY (`ke_tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `riwayat_akademik`
--

DROP TABLE IF EXISTS `riwayat_akademik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `riwayat_akademik` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siswa_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tahun_ajaran_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelas_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AKTIF','NAIK_KELAS','TINGGAL_KELAS','LULUS','PINDAH_SEKOLAH','TIDAK_AKTIF') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AKTIF',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `riwayat_akademik_siswa_id_tahun_ajaran_id_key` (`siswa_id`,`tahun_ajaran_id`),
  KEY `riwayat_akademik_siswa_id_idx` (`siswa_id`),
  KEY `riwayat_akademik_tahun_ajaran_id_idx` (`tahun_ajaran_id`),
  KEY `riwayat_akademik_kelas_id_idx` (`kelas_id`),
  CONSTRAINT `riwayat_akademik_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `riwayat_akademik_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `riwayat_akademik_tahun_ajaran_id_fkey` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `siswa`
--

DROP TABLE IF EXISTS `siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `siswa` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nisn` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niup` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_kelamin` enum('LAKI_LAKI','PEREMPUAN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelas_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tempat_lahir` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal_lahir` datetime(3) DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `tahun_masuk` int DEFAULT NULL,
  `foto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siswa_nisn_key` (`nisn`),
  UNIQUE KEY `siswa_niup_key` (`niup`),
  KEY `siswa_kelas_id_idx` (`kelas_id`),
  KEY `siswa_nisn_idx` (`nisn`),
  KEY `siswa_niup_idx` (`niup`),
  KEY `siswa_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `siswa_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `surat_teguran`
--

DROP TABLE IF EXISTS `surat_teguran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `surat_teguran` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomor_surat` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siswa_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis_teguran` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_poin` int NOT NULL,
  `total_pelanggaran` int NOT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `tanggal` datetime(3) NOT NULL,
  `status` enum('DRAFT','DITERBITKAN','DIKIRIM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `dibuat_oleh_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `surat_teguran_nomor_surat_key` (`nomor_surat`),
  KEY `surat_teguran_siswa_id_idx` (`siswa_id`),
  KEY `surat_teguran_dibuat_oleh_id_idx` (`dibuat_oleh_id`),
  KEY `surat_teguran_tanggal_idx` (`tanggal`),
  CONSTRAINT `surat_teguran_dibuat_oleh_id_fkey` FOREIGN KEY (`dibuat_oleh_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `surat_teguran_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tahun_ajaran`
--

DROP TABLE IF EXISTS `tahun_ajaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tahun_ajaran` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mulai` datetime(3) NOT NULL,
  `selesai` datetime(3) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tahun_ajaran_nama_key` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `threshold_poin`
--

DROP TABLE IF EXISTS `threshold_poin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `threshold_poin` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minimum_poin` int NOT NULL,
  `maximum_poin` int DEFAULT NULL,
  `tindakan` text COLLATE utf8mb4_unicode_ci,
  `warna` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#22c55e',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ADMIN',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime(3) DEFAULT NULL,
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_email_idx` (`email`),
  KEY `users_role_idx` (`role`),
  KEY `users_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-28 11:40:47

-- ============================================
-- DATA: users table only (login data)
-- ============================================

-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: sips_db
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `last_login`, `avatar`, `deleted_at`, `created_at`, `updated_at`) VALUES ('cmu24l7mf0000ssv4wsjdzsxm','Super Administrator','admin@sips.sch.id','$2a$12$2j9S8PjmUVujFH/.KJdrOurK1KRnmIYr3Kf76YL0nwy9AcOTB3A42','SUPER_ADMIN',1,'2026-09-22 11:32:57.404',NULL,NULL,'2026-09-15 03:42:00.663','2026-09-22 11:32:57.411'),('cmu24l7mw0001ssv4zsv751nw','Staf Kesiswaan & BK','gurubk@sips.sch.id','$2a$12$2j9S8PjmUVujFH/.KJdrOurK1KRnmIYr3Kf76YL0nwy9AcOTB3A42','ADMIN',1,'2026-09-17 13:02:06.145',NULL,NULL,'2026-09-15 03:42:00.680','2026-09-17 13:02:06.147');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-28 11:40:56