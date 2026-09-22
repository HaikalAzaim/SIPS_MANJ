"use client"

import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react'

interface PromotionStatsProps {
  tahunAjaranAktif: string
  totalSiswa: number
  sudahDiproses: number
  belumDiproses: number
}

export function PromotionStats({ tahunAjaranAktif, totalSiswa, sudahDiproses, belumDiproses }: PromotionStatsProps) {
  const stats = [
    {
      label: 'Tahun Ajaran Aktif',
      value: tahunAjaranAktif,
      icon: Calendar,
      colorClass: 'gold',
      iconColor: 'text-[#D9A441]',
    },
    {
      label: 'Total Siswa',
      value: totalSiswa.toLocaleString('id-ID'),
      icon: Users,
      colorClass: '',
      iconColor: 'text-[#8FA0B8]',
    },
    {
      label: 'Sudah Diproses',
      value: sudahDiproses.toLocaleString('id-ID'),
      icon: CheckCircle2,
      colorClass: '',
      iconColor: 'text-[#4ade80]',
    },
    {
      label: 'Belum Diproses',
      value: belumDiproses.toLocaleString('id-ID'),
      icon: Clock,
      colorClass: '',
      iconColor: 'text-[#fb923c]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.label} className={`stat-card card-gradient ${s.colorClass}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={18} className={s.iconColor} />
              <span className="text-[11px] text-[var(--text-secondary)]">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.colorClass === 'gold' ? 'text-[#D9A441]' : 'text-[var(--text-primary)]'}`}>
              {s.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
