"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

interface AcademicRecord {
  id: string
  status: string
  catatan: string | null
  tahunAjaran: { nama: string; isActive: boolean }
  kelas: { namaKelas: string; tingkat: string }
}

interface StudentAcademicHistoryProps {
  records: AcademicRecord[]
}

const statusLabels: Record<string, { label: string; variant: any }> = {
  AKTIF:          { label: 'Aktif',          variant: 'success'  },
  NAIK_KELAS:     { label: 'Naik Kelas',     variant: 'success'  },
  TINGGAL_KELAS:  { label: 'Tinggal Kelas',  variant: 'warning'  },
  LULUS:          { label: 'Lulus',           variant: 'info'     },
  PINDAH_SEKOLAH: { label: 'Pindah Sekolah', variant: 'outline'  },
  TIDAK_AKTIF:    { label: 'Tidak Aktif',     variant: 'danger'   },
}

export function StudentAcademicHistory({ records }: StudentAcademicHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[#64748B] mb-3">
          <Calendar size={24} />
        </div>
        <p className="text-[0.9375rem] font-semibold text-[#91A4BD]">Belum ada riwayat kelas</p>
        <p className="text-[0.8125rem] text-[#64748B] mt-1">Riwayat akan muncul setelah proses kenaikan kelas dilakukan</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '3.5rem' }}>No</th>
              <th style={{ width: '10rem' }}>Tahun Ajaran</th>
              <th>Kelas</th>
              <th style={{ width: '8rem' }} className="td-center">Status</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const cfg = statusLabels[r.status] || statusLabels.AKTIF
              return (
                <tr key={r.id}>
                  <td className="td-mono">{i + 1}</td>
                  <td className="td-primary font-medium">
                    {r.tahunAjaran.nama}
                    {r.tahunAjaran.isActive && (
                      <Badge variant="gold" className="ml-2 text-[9px]">Aktif</Badge>
                    )}
                  </td>
                  <td className="text-[#8FA4BD]">{r.kelas.namaKelas}</td>
                  <td className="td-center">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </td>
                  <td className="text-[11px] text-[#64748B]">{r.catatan || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
