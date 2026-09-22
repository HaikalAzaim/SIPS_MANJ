import { getLaporanSiswa } from '@/actions/laporan'
import { getAllKelas } from '@/actions/kelas'
import { getThresholds } from '@/actions/dashboard'
import { LaporanSiswaClient } from '@/components/laporan/laporan-siswa-client'
import { Card } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

export default async function LaporanSiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kelasId?: string; search?: string }>
}) {
  const params = await searchParams
  const [result, kelasList, thresholds] = await Promise.all([
    getLaporanSiswa({
      page: Number(params.page) || 1,
      kelasId: params.kelasId,
      search: params.search,
    }),
    getAllKelas(),
    getThresholds(),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GraduationCap size={22} className="text-gold-400" />
          Laporan Rekap Siswa
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Rekap pelanggaran per siswa</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Siswa', value: result.total, highlight: true },
          { label: 'Halaman', value: `${result.page}/${result.totalPages}`, highlight: false },
        ].map((c) => (
          <div key={c.label} className={`stat-card card-gradient ${c.highlight ? 'gold' : ''}`}>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{c.value}</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <LaporanSiswaClient
          data={result.data}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          limit={result.limit}
          kelasList={kelasList}
          thresholds={thresholds as any}
          filterParams={{ kelasId: params.kelasId, search: params.search }}
        />
      </Card>
    </div>
  )
}
