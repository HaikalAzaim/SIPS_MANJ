import { getSuratTeguranList } from '@/actions/surat-teguran'
import { getSiswaForSelect } from '@/actions/siswa'
import { getSystemSettings } from '@/actions/pengaturan'
import { SuratTeguranTable } from '@/components/surat-teguran/surat-teguran-table'
import { BookOpen } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function SuratTeguranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const [result, siswaList, statusCounts, settings] = await Promise.all([
    getSuratTeguranList({
      page: Number(params.page) || 1,
      search: params.search,
      status: params.status,
    }),
    getSiswaForSelect(),
    prisma.suratTeguran.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    getSystemSettings(),
  ])

  const countMap: Record<string, number> = {}
  statusCounts.forEach(s => { countMap[s.status] = s._count.id })

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value || ''
  const signatoryInfo = {
    penandatanganNama:    getSetting('surat_teguran_penandatangan_nama'),
    penandatanganJabatan: getSetting('surat_teguran_penandatangan_jabatan'),
    penandatanganNip:     getSetting('surat_teguran_penandatangan_nip'),
    tempatTanggal:        getSetting('surat_teguran_tempat_tanggal'),
    namaSekolah:          'MA NURUL JADID',
    showTtd:              getSetting('show_ttd_surat_teguran') !== 'false',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen size={22} className="text-gold-400" />
          Surat Teguran
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Buat dan kelola surat teguran siswa</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Surat', value: result.total, highlight: true },
          { label: 'Draft', value: countMap['DRAFT'] || 0, highlight: false },
          { label: 'Diterbitkan', value: countMap['DITERBITKAN'] || 0, highlight: false },
          { label: 'Dikirim', value: countMap['DIKIRIM'] || 0, highlight: false },
        ].map((c) => (
          <div key={c.label} className={`stat-card card-gradient ${c.highlight ? 'gold' : ''}`}>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{c.value}</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <SuratTeguranTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
        siswaList={siswaList as any}
        signatoryInfo={signatoryInfo}
      />
    </div>
  )
}
