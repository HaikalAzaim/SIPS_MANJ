"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Info, Loader2, Plus, ArrowRight } from 'lucide-react'
import { createPromotionProcess } from '@/actions/kenaikan-kelas'
import { createTahunAjaran } from '@/actions/tahun-ajaran'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface PreparationStepProps {
  tahunAjaranList: any[]
  onProcessCreated: (id: string, data?: any) => void
  onCancel: () => void
}

export function PreparationStep({ tahunAjaranList, onProcessCreated, onCancel }: PreparationStepProps) {
  const router = useRouter()
  const [dariTahunAjaranId, setDariTahunAjaranId] = useState('')
  const [keTahunAjaranId, setKeTahunAjaranId] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewTA, setShowNewTA] = useState(false)
  const [newTALoading, setNewTALoading] = useState(false)
  const [localTAList, setLocalTAList] = useState(tahunAjaranList)

  const dariTA = localTAList.find(t => t.id === dariTahunAjaranId)
  const keTA = localTAList.find(t => t.id === keTahunAjaranId)
  const isValid = dariTahunAjaranId && keTahunAjaranId && dariTahunAjaranId !== keTahunAjaranId

  async function handleContinue() {
    if (!isValid) return
    setLoading(true)

    const result = await createPromotionProcess({
      dariTahunAjaranId,
      keTahunAjaranId,
    })

    setLoading(false)

    if (result.error) {
      if (result.existingId) {
        toast.error(result.error)
        // Redirect to existing draft
        router.push(`/kenaikan-kelas/proses?id=${result.existingId}`)
        return
      }
      toast.error(result.error)
      return
    }

    toast.success('Proses kenaikan kelas berhasil dibuat')
    onProcessCreated(result.data!.id, result.data)
  }

  async function handleCreateTA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNewTALoading(true)
    const form = new FormData(e.currentTarget)
    const data = {
      nama: form.get('nama') as string,
      mulai: form.get('mulai') as string,
      selesai: form.get('selesai') as string,
      isActive: false,
    }

    const result = await createTahunAjaran(data)
    setNewTALoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Tahun ajaran berhasil ditambahkan')
    setLocalTAList(prev => [result.data!, ...prev])
    setShowNewTA(false)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6 max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Persiapan Kenaikan Kelas</h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Pilih tahun ajaran asal dan tujuan untuk proses kenaikan kelas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tahun Ajaran Asal</Label>
              <Select value={dariTahunAjaranId} onValueChange={setDariTahunAjaranId}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran asal" /></SelectTrigger>
                <SelectContent>
                  {localTAList.map(ta => (
                    <SelectItem key={ta.id} value={ta.id} disabled={ta.id === keTahunAjaranId}>
                      {ta.nama} {ta.isActive ? '(Aktif)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight size={20} className="text-[#64748B]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Tahun Ajaran Tujuan</Label>
                <Button variant="link" size="sm" onClick={() => setShowNewTA(true)} className="text-[11px] h-auto p-0">
                  <Plus size={12} /> Buat Baru
                </Button>
              </div>
              <Select value={keTahunAjaranId} onValueChange={setKeTahunAjaranId}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran tujuan" /></SelectTrigger>
                <SelectContent>
                  {localTAList.map(ta => (
                    <SelectItem key={ta.id} value={ta.id} disabled={ta.id === dariTahunAjaranId}>
                      {ta.nama} {ta.isActive ? '(Aktif)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dariTahunAjaranId === keTahunAjaranId && dariTahunAjaranId && (
              <p className="text-[12px] text-red-400">Tahun ajaran asal dan tujuan tidak boleh sama.</p>
            )}

            {dariTA && keTA && dariTahunAjaranId !== keTahunAjaranId && (
              <div className="rounded-lg bg-[rgba(217,164,65,0.06)] border border-[rgba(217,164,65,0.15)] p-4">
                <p className="text-[13px] text-[#D9A441] font-medium mb-1">
                  {dariTA.nama} → {keTA.nama}
                </p>
                <p className="text-[12px] text-[#8FA4BD]">
                  Siswa akan diproses dari tahun ajaran <strong>{dariTA.nama}</strong> ke <strong>{keTA.nama}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-[rgba(91,122,157,0.08)] border border-[rgba(91,122,157,0.15)]">
            <Info size={18} className="text-[#7aa5cc] flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#8FA4BD] leading-relaxed">
              <p>Data siswa dan riwayat pelanggaran tahun sebelumnya <strong>tidak akan dihapus</strong>. Sistem akan membuat riwayat kelas baru untuk tahun ajaran tujuan.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.07)]">
            <Button variant="outline" onClick={onCancel}>Batal</Button>
            <Button onClick={handleContinue} disabled={!isValid || loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Lanjutkan
            </Button>
          </div>
        </div>
      </CardContent>

      {/* New Tahun Ajaran Dialog */}
      <Dialog open={showNewTA} onOpenChange={setShowNewTA}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Tahun Ajaran Baru</DialogTitle>
            <DialogDescription>Tahun ajaran baru akan tersedia sebagai tujuan kenaikan kelas</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTA} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ta-nama">Nama</Label>
              <Input id="ta-nama" name="nama" placeholder="2026/2027" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ta-mulai">Mulai</Label>
                <Input id="ta-mulai" name="mulai" type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ta-selesai">Selesai</Label>
                <Input id="ta-selesai" name="selesai" type="date" required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewTA(false)}>Batal</Button>
              <Button type="submit" disabled={newTALoading}>
                {newTALoading && <Loader2 size={14} className="animate-spin" />}
                Buat
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
