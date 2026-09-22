import { getLaporanThreshold } from '@/actions/laporan'
import { ThresholdLaporanClient } from '@/components/laporan/threshold-laporan-client'
import { FileWarning } from 'lucide-react'

export default async function LaporanThresholdPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const result = await getLaporanThreshold({
    page: Number(params.page) || 1,
    search: params.search,
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileWarning size={22} className="text-gold-400" />
          Siswa Melewati Threshold
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Daftar siswa yang melewati batas poin pelanggaran</p>
      </div>

      <ThresholdLaporanClient
        siswa={result.siswa}
        thresholds={result.thresholds}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
      />
    </div>
  )
}
