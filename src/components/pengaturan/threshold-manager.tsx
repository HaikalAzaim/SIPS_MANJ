"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { createThreshold, updateThreshold, deleteThreshold } from '@/actions/pengaturan'
import { toast } from 'sonner'

interface ThresholdManagerProps {
  thresholds: any[]
}

export function ThresholdManager({ thresholds }: ThresholdManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const maximumPoin = form.get('maximumPoin') as string
    const formData = {
      namaStatus: form.get('namaStatus') as string,
      minimumPoin: Number(form.get('minimumPoin')),
      maximumPoin: maximumPoin ? Number(maximumPoin) : null,
      tindakan: form.get('tindakan') as string,
      warna: form.get('warna') as string,
    }

    const result = editData
      ? await updateThreshold(editData.id, formData)
      : await createThreshold(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editData ? 'Threshold berhasil diperbarui' : 'Threshold berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteThreshold(id)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('Threshold berhasil dihapus')
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Konfigurasi Threshold Poin</h3>
        <Button size="sm" onClick={() => { setEditData(null); setShowForm(true) }}>
          <Plus size={14} />
          Tambah Threshold
        </Button>
      </div>

      <div className="space-y-3">
        {thresholds.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <p>Belum ada threshold. Tambahkan threshold poin untuk mengkategorikan status siswa.</p>
          </div>
        ) : (
          thresholds.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              style={{ borderLeft: `4px solid ${t.warna}` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-sm font-bold"
                    style={{ color: t.warna }}
                  >
                    {t.namaStatus}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {t.minimumPoin} poin
                    {t.maximumPoin !== null ? ` – ${t.maximumPoin} poin` : ' ke atas'}
                  </span>
                </div>
                {t.tindakan && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Tindakan: {t.tindakan}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="icon-sm" onClick={() => { setEditData(t); setShowForm(true) }}>
                  <Pencil size={14} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300">
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Threshold</AlertDialogTitle>
                      <AlertDialogDescription>
                        Yakin menghapus threshold <strong>{t.namaStatus}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(t.id)}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditData(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Threshold' : 'Tambah Threshold Poin'}</DialogTitle>
            <DialogDescription>
              Konfigurasi batas poin dan tindakan yang diperlukan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaStatus">Nama Status *</Label>
              <Input id="namaStatus" name="namaStatus" defaultValue={editData?.namaStatus} required placeholder="Misal: Perhatian, Peringatan..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumPoin">Min. Poin *</Label>
                <Input id="minimumPoin" name="minimumPoin" type="number" min={0} defaultValue={editData?.minimumPoin ?? 0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maximumPoin">Maks. Poin</Label>
                <Input id="maximumPoin" name="maximumPoin" type="number" min={0} defaultValue={editData?.maximumPoin ?? ''} placeholder="Kosong = tak terbatas" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warna">Warna *</Label>
              <div className="flex gap-2">
                <Input id="warna" name="warna" type="color" defaultValue={editData?.warna || '#f59e0b'} className="w-14 h-9 p-1 cursor-pointer" />
                <Input
                  type="text"
                  defaultValue={editData?.warna || '#f59e0b'}
                  placeholder="#hex"
                  className="flex-1"
                  onChange={(e) => {
                    const colorInput = document.getElementById('warna') as HTMLInputElement
                    if (colorInput && e.target.value.match(/^#[0-9a-f]{6}$/i)) {
                      colorInput.value = e.target.value
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tindakan">Tindakan / Deskripsi</Label>
              <Textarea id="tindakan" name="tindakan" defaultValue={editData?.tindakan || ''} rows={2} placeholder="Tindakan yang diambil pada status ini..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                {editData ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
