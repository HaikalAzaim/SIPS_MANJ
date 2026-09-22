"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Edit3, Users } from 'lucide-react'
import { getPromotionStudents, updateStudentPromotionStatus } from '@/actions/kenaikan-kelas'
import { getAllKelas } from '@/actions/kelas'
import { BulkStatusModal } from '../bulk-status-modal'
import { toast } from 'sonner'

interface StudentVerificationStepProps {
  processId: string
  onNext: () => void
  onBack: () => void
}

const statusLabels: Record<string, { label: string; variant: any }> = {
  NAIK_KELAS:      { label: 'Naik Kelas',      variant: 'success'   },
  TINGGAL_KELAS:   { label: 'Tinggal Kelas',   variant: 'warning'   },
  LULUS:           { label: 'Lulus',            variant: 'info'      },
  PINDAH_SEKOLAH:  { label: 'Pindah Sekolah',  variant: 'outline'   },
  TIDAK_AKTIF:     { label: 'Tidak Aktif',      variant: 'danger'    },
  BELUM_DITENTUKAN:{ label: 'Belum Ditentukan', variant: 'outline'   },
}

export function StudentVerificationStep({ processId, onNext, onBack }: StudentVerificationStepProps) {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [kelasList, setKelasList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulk, setShowBulk] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editKelasId, setEditKelasId] = useState('')
  const [editCatatan, setEditCatatan] = useState('')
  const [saving, setSaving] = useState(false)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    const [result, kelas] = await Promise.all([
      getPromotionStudents(processId, { search, kelasId: filterKelas, status: filterStatus }),
      getAllKelas(),
    ])
    if (result.success) {
      setStudents(result.data)
    }
    setKelasList(kelas)
    setLoading(false)
  }, [processId, search, filterKelas, filterStatus])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  function toggleSelect(siswaId: string) {
    setSelectedIds(prev =>
      prev.includes(siswaId) ? prev.filter(id => id !== siswaId) : [...prev, siswaId]
    )
  }

  function toggleSelectAll() {
    if (selectedIds.length === students.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(students.map(s => s.siswaId))
    }
  }

  function startEdit(detail: any) {
    setEditingId(detail.id)
    setEditStatus(detail.status)
    setEditKelasId(detail.keKelasId || '')
    setEditCatatan(detail.catatan || '')
  }

  async function saveEdit(detailId: string) {
    setSaving(true)
    const result = await updateStudentPromotionStatus(detailId, {
      status: editStatus as any,
      keKelasId: (editStatus === 'NAIK_KELAS' || editStatus === 'TINGGAL_KELAS') ? editKelasId : null,
      catatan: editCatatan || undefined,
    })
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setEditingId(null)
    toast.success('Status siswa berhasil diperbarui')
    loadStudents()
  }

  // Get unique kelas from students
  const sourceClasses = Array.from(
    new Map(students.map(s => [s.dariKelasId, s.dariKelas])).values()
  )

  const undetermined = students.filter(s => s.status === 'BELUM_DITENTUKAN').length

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Verifikasi Siswa</h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Periksa dan ubah status kenaikan kelas per siswa.
                {undetermined > 0 && (
                  <span className="text-[#fb923c]"> {undetermined} siswa belum ditentukan.</span>
                )}
              </p>
            </div>
            {selectedIds.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setShowBulk(true)}>
                <Users size={14} /> Ubah Massal ({selectedIds.length})
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <Input placeholder="Cari nama / NIUP..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-[12px]" />
            </div>
            <Select value={filterKelas} onValueChange={setFilterKelas}>
              <SelectTrigger className="w-[180px] h-8 text-[12px]"><SelectValue placeholder="Kelas Asal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {sourceClasses.map(k => (
                  <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] h-8 text-[12px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="NAIK_KELAS">Naik Kelas</SelectItem>
                <SelectItem value="TINGGAL_KELAS">Tinggal Kelas</SelectItem>
                <SelectItem value="LULUS">Lulus</SelectItem>
                <SelectItem value="PINDAH_SEKOLAH">Pindah Sekolah</SelectItem>
                <SelectItem value="TIDAK_AKTIF">Tidak Aktif</SelectItem>
                <SelectItem value="BELUM_DITENTUKAN">Belum Ditentukan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#D9A441]" />
              <span className="ml-3 text-[#8FA4BD]">Memuat data siswa...</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '2.5rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === students.length && students.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-[rgba(255,255,255,0.15)] cursor-pointer"
                        />
                      </th>
                      <th>NIUP</th>
                      <th>Nama Siswa</th>
                      <th>Kelas Asal</th>
                      <th>Status</th>
                      <th>Kelas Tujuan</th>
                      <th>Catatan</th>
                      <th style={{ width: '3.5rem' }} className="td-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-[#64748B]">Tidak ada data siswa</td>
                      </tr>
                    ) : (
                      students.map(detail => {
                        const cfg = statusLabels[detail.status] || statusLabels.BELUM_DITENTUKAN
                        const isEditing = editingId === detail.id

                        return (
                          <tr key={detail.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(detail.siswaId)}
                                onChange={() => toggleSelect(detail.siswaId)}
                                className="rounded border-[rgba(255,255,255,0.15)] cursor-pointer"
                              />
                            </td>
                            <td className="td-mono text-[12px]">{detail.siswa.niup}</td>
                            <td className="td-primary font-medium">{detail.siswa.nama}</td>
                            <td className="text-[12px] text-[#8FA4BD]">{detail.dariKelas?.namaKelas}</td>
                            <td>
                              {isEditing ? (
                                <Select value={editStatus} onValueChange={v => { setEditStatus(v); if (v === 'TINGGAL_KELAS') setEditKelasId(detail.dariKelasId) }}>
                                  <SelectTrigger className="h-7 text-[11px] w-[130px]"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NAIK_KELAS">Naik Kelas</SelectItem>
                                    <SelectItem value="TINGGAL_KELAS">Tinggal Kelas</SelectItem>
                                    <SelectItem value="LULUS">Lulus</SelectItem>
                                    <SelectItem value="PINDAH_SEKOLAH">Pindah Sekolah</SelectItem>
                                    <SelectItem value="TIDAK_AKTIF">Tidak Aktif</SelectItem>
                                    <SelectItem value="BELUM_DITENTUKAN">Belum Ditentukan</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                              )}
                            </td>
                            <td>
                              {isEditing && (editStatus === 'NAIK_KELAS' || editStatus === 'TINGGAL_KELAS') ? (
                                <Select value={editKelasId} onValueChange={setEditKelasId}>
                                  <SelectTrigger className="h-7 text-[11px] w-[140px]"><SelectValue placeholder="Pilih" /></SelectTrigger>
                                  <SelectContent>
                                    {kelasList.map(k => (
                                      <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-[12px] text-[#8FA4BD]">{detail.keKelas?.namaKelas || '—'}</span>
                              )}
                            </td>
                            <td className="text-[11px] text-[#64748B] max-w-[120px] truncate">{detail.catatan || '—'}</td>
                            <td className="td-center">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon-sm" onClick={() => saveEdit(detail.id)} disabled={saving}>
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : '✓'}
                                  </Button>
                                  <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(null)}>✕</Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="icon-sm" onClick={() => startEdit(detail)} title="Edit">
                                  <Edit3 size={13} />
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.07)]">
            <Button variant="outline" onClick={onBack}>Kembali</Button>
            <Button onClick={onNext}>
              Lanjutkan
            </Button>
          </div>
        </div>

        <BulkStatusModal
          open={showBulk}
          onOpenChange={setShowBulk}
          processId={processId}
          selectedIds={selectedIds}
          kelasList={kelasList}
          onSuccess={() => {
            setSelectedIds([])
            loadStudents()
          }}
        />
      </CardContent>
    </Card>
  )
}
