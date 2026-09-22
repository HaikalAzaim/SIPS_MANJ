"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Wand2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getClassMappingSuggestions, saveClassMappings } from '@/actions/kenaikan-kelas'
import { toast } from 'sonner'
import type { StatusKenaikan } from '@/lib/schemas'

interface ClassMappingStepProps {
  processId: string
  onNext: () => void
  onBack: () => void
}

interface ClassMapping {
  kelasId: string
  namaKelas: string
  tingkat: string
  jurusan: string | null
  jumlahSiswa: number
  suggestedTargetId: string | null
  suggestedTargetName: string | null
  suggestedAction: 'NAIK_KELAS' | 'LULUS'
  existingTargetId?: string | null
  existingStatus?: StatusKenaikan | null
  selectedTargetId: string | null
  selectedStatus: StatusKenaikan
}

export function ClassMappingStep({ processId, onNext, onBack }: ClassMappingStepProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mappings, setMappings] = useState<ClassMapping[]>([])
  const [allKelas, setAllKelas] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [processId])

  async function loadData() {
    setLoading(true)
    const result = await getClassMappingSuggestions(processId)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    const { classes, allKelas: kelasList } = result.data!
    setAllKelas(kelasList)
    setMappings(classes.map((c: any) => ({
      ...c,
      selectedTargetId: c.existingTargetId || (c.suggestedAction === 'LULUS' ? null : c.suggestedTargetId),
      selectedStatus: (c.existingStatus || (c.suggestedAction === 'LULUS' ? 'LULUS' : (c.suggestedTargetId ? 'NAIK_KELAS' : 'BELUM_DITENTUKAN'))) as StatusKenaikan,
    })))
    setLoading(false)
  }

  function handleAutoMap() {
    setMappings(prev => prev.map(m => ({
      ...m,
      selectedTargetId: m.suggestedAction === 'LULUS' ? null : m.suggestedTargetId,
      selectedStatus: m.suggestedAction === 'LULUS' ? 'LULUS' as StatusKenaikan : (m.suggestedTargetId ? 'NAIK_KELAS' as StatusKenaikan : 'BELUM_DITENTUKAN' as StatusKenaikan),
    })))
    toast.success('Pemetaan otomatis diterapkan')
  }

  function updateMapping(kelasId: string, field: 'selectedTargetId' | 'selectedStatus', value: string | null) {
    setMappings(prev => prev.map(m => {
      if (m.kelasId !== kelasId) return m
      const updated = { ...m, [field]: value }
      if (field === 'selectedStatus') {
        if (value === 'LULUS' || value === 'PINDAH_SEKOLAH' || value === 'TIDAK_AKTIF') {
          updated.selectedTargetId = null
        } else if (value === 'TINGGAL_KELAS') {
          updated.selectedTargetId = m.kelasId // Same class
        } else if (value === 'NAIK_KELAS') {
          if (!updated.selectedTargetId && m.suggestedTargetId) {
            updated.selectedTargetId = m.suggestedTargetId
          }
        }
      }
      return updated
    }))
  }

  async function handleSave() {
    // Validate: all must be mapped
    const unmapped = mappings.filter(m => m.selectedStatus === 'BELUM_DITENTUKAN')
    if (unmapped.length > 0) {
      toast.error(`${unmapped.length} kelas belum dipetakan`)
      return
    }

    const needsTarget = mappings.filter(
      m => (m.selectedStatus === 'NAIK_KELAS' || m.selectedStatus === 'TINGGAL_KELAS') && !m.selectedTargetId
    )
    if (needsTarget.length > 0) {
      toast.error(`${needsTarget.length} kelas naik/tinggal belum memiliki kelas tujuan`)
      return
    }

    setSaving(true)
    const result = await saveClassMappings(
      processId,
      mappings.map(m => ({
        dariKelasId: m.kelasId,
        keKelasId: m.selectedTargetId,
        status: m.selectedStatus,
      }))
    )
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Pemetaan kelas berhasil disimpan')
    onNext()
  }

  const filtered = search
    ? mappings.filter(m => m.namaKelas.toLowerCase().includes(search.toLowerCase()))
    : mappings

  const mappedCount = mappings.filter(m => m.selectedStatus !== 'BELUM_DITENTUKAN').length
  const totalCount = mappings.length

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#D9A441]" />
          <span className="ml-3 text-[#8FA4BD]">Memuat data kelas...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Pemetaan Kelas</h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Tentukan kelas tujuan untuk setiap kelas asal. <span className="text-[var(--text-muted)]">{mappedCount}/{totalCount} terpetakan</span>
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative max-w-[200px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input placeholder="Cari kelas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-[12px]" />
              </div>
              <Button variant="secondary" size="sm" onClick={handleAutoMap}>
                <Wand2 size={14} /> Pemetaan Otomatis
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '3rem' }}>No</th>
                    <th>Kelas Asal</th>
                    <th style={{ width: '5rem' }} className="td-center">Siswa</th>
                    <th style={{ width: '11rem' }}>Status</th>
                    <th>Kelas Tujuan</th>
                    <th style={{ width: '6rem' }} className="td-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const isMapped = m.selectedStatus !== 'BELUM_DITENTUKAN'
                    const needsTarget = (m.selectedStatus === 'NAIK_KELAS' || m.selectedStatus === 'TINGGAL_KELAS') && !m.selectedTargetId
                    return (
                      <tr key={m.kelasId}>
                        <td className="td-mono">{i + 1}</td>
                        <td className="td-primary font-medium">{m.namaKelas}</td>
                        <td className="td-center font-semibold text-[var(--text-primary)]">{m.jumlahSiswa}</td>
                        <td>
                          <Select
                            value={m.selectedStatus}
                            onValueChange={v => updateMapping(m.kelasId, 'selectedStatus', v)}
                          >
                            <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BELUM_DITENTUKAN">Belum Ditentukan</SelectItem>
                              <SelectItem value="NAIK_KELAS">Naik Kelas</SelectItem>
                              <SelectItem value="TINGGAL_KELAS">Tinggal Kelas</SelectItem>
                              <SelectItem value="LULUS">Lulus</SelectItem>
                              <SelectItem value="PINDAH_SEKOLAH">Pindah Sekolah</SelectItem>
                              <SelectItem value="TIDAK_AKTIF">Tidak Aktif</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td>
                          {m.selectedStatus === 'NAIK_KELAS' ? (
                            <Select
                              value={m.selectedTargetId || undefined}
                              onValueChange={v => updateMapping(m.kelasId, 'selectedTargetId', v)}
                            >
                              <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                              <SelectContent>
                                {allKelas.map(k => (
                                  <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : m.selectedStatus === 'TINGGAL_KELAS' ? (
                            <span className="text-[12px] text-[#8FA4BD]">{m.namaKelas} (tetap)</span>
                          ) : m.selectedStatus === 'LULUS' || m.selectedStatus === 'PINDAH_SEKOLAH' || m.selectedStatus === 'TIDAK_AKTIF' ? (
                            <span className="text-[12px] text-[#64748B]">—</span>
                          ) : (
                            <span className="text-[12px] text-[#64748B]">Tentukan status terlebih dahulu</span>
                          )}
                        </td>
                        <td className="td-center">
                          {isMapped && !needsTarget ? (
                            <CheckCircle2 size={16} className="text-[#4ade80] mx-auto" />
                          ) : needsTarget ? (
                            <AlertCircle size={16} className="text-[#fb923c] mx-auto" />
                          ) : (
                            <AlertCircle size={16} className="text-[#64748B] mx-auto" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.07)]">
            <Button variant="outline" onClick={onBack}>Kembali</Button>
            <Button
              onClick={handleSave}
              disabled={saving || mappings.length === 0 || mappings.some(m => m.selectedStatus === 'BELUM_DITENTUKAN' || ((m.selectedStatus === 'NAIK_KELAS' || m.selectedStatus === 'TINGGAL_KELAS') && !m.selectedTargetId))}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Lanjutkan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
