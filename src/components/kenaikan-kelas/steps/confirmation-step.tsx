"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, CheckCircle2, ArrowUpCircle, ArrowDownCircle, GraduationCap, LogOut, XCircle } from 'lucide-react'
import { getPromotionById, executePromotion } from '@/actions/kenaikan-kelas'
import { toast } from 'sonner'

interface ConfirmationStepProps {
  processId: string
  onBack: () => void
  onComplete: () => void
}

export function ConfirmationStep({ processId, onBack, onComplete }: ConfirmationStepProps) {
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [process, setProcess] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [processId])

  async function loadData() {
    setLoading(true)
    const data = await getPromotionById(processId)
    setProcess(data)
    setLoading(false)
  }

  async function handleExecute() {
    if (!confirmed) {
      toast.error('Centang checkbox konfirmasi terlebih dahulu')
      return
    }

    setExecuting(true)
    const result = await executePromotion(processId)
    setExecuting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Proses kenaikan kelas berhasil dieksekusi!')
    onComplete()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#D9A441]" />
          <span className="ml-3 text-[#8FA4BD]">Memuat ringkasan...</span>
        </CardContent>
      </Card>
    )
  }

  if (!process) return null

  const details = process.detailKenaikan || []
  const statusCounts = {
    NAIK_KELAS: details.filter((d: any) => d.status === 'NAIK_KELAS').length,
    TINGGAL_KELAS: details.filter((d: any) => d.status === 'TINGGAL_KELAS').length,
    LULUS: details.filter((d: any) => d.status === 'LULUS').length,
    PINDAH_SEKOLAH: details.filter((d: any) => d.status === 'PINDAH_SEKOLAH').length,
    TIDAK_AKTIF: details.filter((d: any) => d.status === 'TIDAK_AKTIF').length,
    BELUM_DITENTUKAN: details.filter((d: any) => d.status === 'BELUM_DITENTUKAN').length,
  }

  const hasUndetermined = statusCounts.BELUM_DITENTUKAN > 0

  // Group by class for summary table
  const classGroups = new Map<string, { namaKelas: string; target: string; count: number }>()
  for (const d of details) {
    const key = `${d.dariKelasId}-${d.keKelasId || 'none'}-${d.status}`
    if (!classGroups.has(key)) {
      classGroups.set(key, {
        namaKelas: d.dariKelas?.namaKelas || '-',
        target: d.keKelas?.namaKelas || (d.status === 'LULUS' ? 'Lulus' : d.status === 'PINDAH_SEKOLAH' ? 'Pindah' : d.status === 'TIDAK_AKTIF' ? 'Tidak Aktif' : '-'),
        count: 0,
      })
    }
    classGroups.get(key)!.count++
  }

  const summaryItems = [
    { icon: ArrowUpCircle, label: 'Naik Kelas', count: statusCounts.NAIK_KELAS, color: 'text-[#4ade80]' },
    { icon: ArrowDownCircle, label: 'Tinggal Kelas', count: statusCounts.TINGGAL_KELAS, color: 'text-[#fb923c]' },
    { icon: GraduationCap, label: 'Lulus', count: statusCounts.LULUS, color: 'text-[#7aa5cc]' },
    { icon: LogOut, label: 'Pindah Sekolah', count: statusCounts.PINDAH_SEKOLAH, color: 'text-[#8FA4BD]' },
    { icon: XCircle, label: 'Tidak Aktif', count: statusCounts.TIDAK_AKTIF, color: 'text-[#f87171]' },
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--foreground)] mb-1">Konfirmasi Kenaikan Kelas</h3>
            <p className="text-[13px] text-[#64748B]">
              Periksa ringkasan data sebelum memproses kenaikan kelas.
            </p>
          </div>

          {/* Tahun Ajaran */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] text-[#64748B] mb-1">Tahun Ajaran Asal</p>
              <p className="text-[15px] font-semibold text-[var(--foreground)]">{process.dariTahunAjaran?.nama}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] text-[#64748B] mb-1">Tahun Ajaran Tujuan</p>
              <p className="text-[15px] font-semibold text-[#D9A441]">{process.keTahunAjaran?.nama}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div>
            <p className="text-[12px] font-semibold text-[#8FA4BD] mb-3">RINGKASAN ({details.length} siswa)</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {summaryItems.map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-center">
                    <Icon size={18} className={`${item.color} mx-auto mb-1`} />
                    <p className="text-xl font-bold text-[var(--foreground)]">{item.count}</p>
                    <p className="text-[10px] text-[#64748B]">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Class Summary Table */}
          <div>
            <p className="text-[12px] font-semibold text-[#8FA4BD] mb-3">RINGKASAN PER KELAS</p>
            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kelas Asal</th>
                      <th>Kelas Tujuan</th>
                      <th className="td-center">Jumlah Siswa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(classGroups.values()).map((g, i) => (
                      <tr key={i}>
                        <td className="td-primary">{g.namaKelas}</td>
                        <td className="text-[#8FA4BD] text-[12px]">{g.target}</td>
                        <td className="td-center font-semibold text-[var(--foreground)]">{g.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 rounded-lg bg-[rgba(217,164,65,0.06)] border border-[rgba(217,164,65,0.15)]">
            <AlertTriangle size={18} className="text-[#D9A441] flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#8FA4BD] leading-relaxed">
              <p className="font-medium text-[#D9A441] mb-1">Perhatian</p>
              <p>Proses ini akan membuat riwayat kelas baru untuk siswa yang diproses. Data pelanggaran tahun sebelumnya <strong>tetap tersimpan dan tidak akan dihapus</strong>.</p>
            </div>
          </div>

          {hasUndetermined && (
            <div className="flex gap-3 p-4 rounded-lg bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)]">
              <AlertTriangle size={18} className="text-[#f87171] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#f87171]">
                Masih ada <strong>{statusCounts.BELUM_DITENTUKAN} siswa</strong> yang belum ditentukan statusnya. Kembali ke langkah sebelumnya untuk menyelesaikan.
              </p>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="rounded border-[var(--border)] w-4 h-4"
              disabled={hasUndetermined}
            />
            <span className="text-[13px] text-[#8FA4BD]">
              Saya telah memeriksa data kenaikan kelas dan siap untuk memproses.
            </span>
          </label>

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)]">
            <Button variant="outline" onClick={onBack}>Kembali</Button>
            <Button onClick={handleExecute} disabled={!confirmed || executing || hasUndetermined}>
              {executing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Proses Kenaikan Kelas
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
