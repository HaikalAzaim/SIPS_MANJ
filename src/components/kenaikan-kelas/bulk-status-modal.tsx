"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { bulkUpdateStudentStatus } from '@/actions/kenaikan-kelas'
import { toast } from 'sonner'

interface BulkStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processId: string
  selectedIds: string[]
  kelasList: any[]
  onSuccess: () => void
}

const statusOptions = [
  { value: 'NAIK_KELAS', label: 'Naik Kelas' },
  { value: 'TINGGAL_KELAS', label: 'Tinggal Kelas' },
  { value: 'LULUS', label: 'Lulus' },
  { value: 'PINDAH_SEKOLAH', label: 'Pindah Sekolah' },
  { value: 'TIDAK_AKTIF', label: 'Tidak Aktif' },
  { value: 'BELUM_DITENTUKAN', label: 'Belum Ditentukan' },
]

export function BulkStatusModal({ open, onOpenChange, processId, selectedIds, kelasList, onSuccess }: BulkStatusModalProps) {
  const [status, setStatus] = useState('')
  const [keKelasId, setKeKelasId] = useState('')
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  const needsClass = status === 'NAIK_KELAS' || status === 'TINGGAL_KELAS'

  async function handleSubmit() {
    if (!status) {
      toast.error('Status wajib dipilih')
      return
    }
    if (needsClass && !keKelasId) {
      toast.error('Kelas tujuan wajib dipilih')
      return
    }

    setLoading(true)
    const result = await bulkUpdateStudentStatus(processId, {
      studentIds: selectedIds,
      status: status as any,
      keKelasId: needsClass ? keKelasId : null,
      catatan: catatan || undefined,
    })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`${selectedIds.length} siswa berhasil diperbarui`)
    onOpenChange(false)
    setStatus('')
    setKeKelasId('')
    setCatatan('')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Massal</DialogTitle>
          <DialogDescription>{selectedIds.length} siswa dipilih</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status Kenaikan</Label>
            <Select value={status} onValueChange={v => { setStatus(v); if (v !== 'NAIK_KELAS' && v !== 'TINGGAL_KELAS') setKeKelasId('') }}>
              <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsClass && (
            <div className="space-y-1.5">
              <Label>Kelas Tujuan</Label>
              <Select value={keKelasId} onValueChange={setKeKelasId}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas tujuan" /></SelectTrigger>
                <SelectContent>
                  {kelasList.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Catatan (opsional)</Label>
            <Textarea value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Tambahkan catatan..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={loading || !status}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Terapkan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
