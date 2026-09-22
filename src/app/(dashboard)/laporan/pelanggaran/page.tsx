import { getLaporanPelanggaran } from '@/actions/laporan'
import { getAllKelas } from '@/actions/kelas'
import { getAllKategori } from '@/actions/kategori'
import { getSystemSettings } from '@/actions/pengaturan'
import { LaporanPelanggaranClient } from '@/components/laporan/laporan-pelanggaran-client'
import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default async function LaporanPelanggaranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kelasId?: string; kategoriId?: string; startDate?: string; endDate?: string; tingkat?: string }>
}) {
  const params = await searchParams
  const [result, kelasList, kategoriList, settings] = await Promise.all([
    getLaporanPelanggaran({
      page: Number(params.page) || 1,
      kelasId: params.kelasId,
      kategoriId: params.kategoriId,
      startDate: params.startDate,
      endDate: params.endDate,
      tingkat: params.tingkat,
    }),
    getAllKelas(),
    getAllKategori(),
    getSystemSettings(),
  ])

  // Ambil data tanda tangan dari system_settings
  const getSetting = (key: string) => settings.find((s: any) => s.key === key)?.value || ''
  const signatoryInfo = {
    kepalaSekolahNama: getSetting('kepala_sekolah_nama'),
    kepalaSekolahNip:  getSetting('kepala_sekolah_nip'),
    stafKesiswaanNama: getSetting('staf_kesiswaan_nama'),
    stafKesiswaanNip:  getSetting('staf_kesiswaan_nip'),
    showTtdLaporan:    getSetting('show_ttd_laporan') !== 'false',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={22} className="text-gold-400" />
            Laporan Pelanggaran
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Rekap seluruh catatan pelanggaran siswa</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelanggaran', value: result.total, highlight: true },
          { label: 'Halaman', value: `${result.page}/${result.totalPages}`, highlight: false },
        ].map((c) => (
          <div key={c.label} className={`stat-card card-gradient ${c.highlight ? 'gold' : ''}`}>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{c.value}</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <LaporanPelanggaranClient
          initialData={result.data}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          limit={result.limit}
          kelasList={kelasList}
          kategoriList={kategoriList}
          filterParams={{
            startDate: params.startDate,
            endDate: params.endDate,
            kelasId: params.kelasId,
            tingkat: params.tingkat,
          }}
          signatoryInfo={signatoryInfo}
        />
      </Card>
    </div>
  )
}
