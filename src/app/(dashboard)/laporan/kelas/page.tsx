import { getLaporanKelas } from '@/actions/laporan'
import { ExportButtons } from '@/components/laporan/laporan-export'
import { Card } from '@/components/ui/card'
import { School } from 'lucide-react'
import { LaporanKelasClient } from '@/components/laporan/laporan-kelas-client'

export default async function LaporanKelasPage() {
  const data = await getLaporanKelas()

  const totalKelas = data.length
  const totalSiswa = data.reduce((s, k) => s + k.jumlahSiswa, 0)
  const totalPelanggaran = data.reduce((s, k) => s + k.totalPelanggaran, 0)
  const totalPoin = data.reduce((s, k) => s + k.totalPoin, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <School size={22} className="text-gold-400" />
          Laporan Rekap Kelas
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Rekap pelanggaran per kelas</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Kelas', value: totalKelas, highlight: true },
          { label: 'Total Siswa', value: totalSiswa, highlight: false },
          { label: 'Total Pelanggaran', value: totalPelanggaran, highlight: false },
          { label: 'Total Poin', value: totalPoin, highlight: false },
        ].map((c) => (
          <div key={c.label} className={`stat-card card-gradient ${c.highlight ? 'gold' : ''}`}>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{c.value}</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <LaporanKelasClient data={data} />
      </Card>
    </div>
  )
}
