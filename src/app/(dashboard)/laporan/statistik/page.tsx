import { getLaporanStatistik } from '@/actions/laporan'
import { StatistikClient } from '@/components/laporan/statistik-client'
import { BarChart3 } from 'lucide-react'

export default async function LaporanStatistikPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>
}) {
  const params = await searchParams
  const tahun = params.tahun ? Number(params.tahun) : undefined
  const data = await getLaporanStatistik(tahun)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BarChart3 size={22} className="text-gold-400" />
          Statistik Pelanggaran
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Visualisasi data pelanggaran siswa</p>
      </div>

      <StatistikClient data={data} selectedYear={tahun || new Date().getFullYear()} />
    </div>
  )
}
