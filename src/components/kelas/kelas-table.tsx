"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, School, X, RotateCcw } from 'lucide-react'
import { createKelas, updateKelas, deleteKelas } from '@/actions/kelas'
import { toast } from 'sonner'

interface KelasTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  guruList: any[]
}

export function KelasTable({ data, total, page, totalPages, limit, guruList }: KelasTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const isFiltered = Boolean(search)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/kelas?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/kelas?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/kelas')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/kelas?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const formData = {
      namaKelas: form.get('namaKelas') as string,
      tingkat: Number(form.get('tingkat')),
      jurusan: form.get('jurusan') as string,
      waliKelasId: (form.get('waliKelasId') as string) || undefined,
    }

    const result = editData
      ? await updateKelas(editData.id, formData)
      : await createKelas(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editData ? 'Data kelas berhasil diubah' : 'Kelas berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteKelas(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Kelas berhasil dihapus')
    router.refresh()
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="table-toolbar-group">
          <form onSubmit={handleSearch} className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kelas..."
              className="search-input-field"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="search-clear-btn"
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetAll}
              className="toolbar-reset-btn"
              title="Reset semua filter"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
        <Button onClick={() => { setEditData(null); setShowForm(true) }} className="flex-shrink-0">
          <Plus size={15} />
          Tambah Kelas
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '2.5rem' }}>No</th>
                <th>Nama Kelas</th>
                <th>Tingkat</th>
                <th>Jurusan</th>
                <th>Wali Kelas</th>
                <th className="td-center">Jml Siswa</th>
                <th>Status</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      icon={<School size={22} />}
                      title={isFiltered ? "Tidak ada kelas yang sesuai" : "Belum ada data kelas"}
                      description={isFiltered ? "Coba gunakan kata kunci lain untuk mencari kelas." : "Tambahkan kelas baru ke dalam sistem."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => { setEditData(null); setShowForm(true) }}>
                            <Plus size={14} />
                            Tambah Kelas
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((k, i) => (
                  <tr key={k.id}>
                    <td className="td-mono">{startItem + i}</td>
                    <td className="td-primary">{k.namaKelas}</td>
                    <td className="text-[#91A4BD]">{k.tingkat}</td>
                    <td className="td-muted">{k.jurusan || '—'}</td>
                    <td className="text-[#91A4BD] text-[12px]">
                      {k.waliKelas?.nama || <span className="text-[#64748B] italic">Belum ditentukan</span>}
                    </td>
                    <td className="td-center font-bold text-[#D9A441]">{k._count?.siswa ?? 0}</td>
                    <td>
                      <Badge variant={k.status ? 'normal' : 'danger'}>
                        {k.status ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="td-actions">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="action-btn" title="Edit kelas" onClick={() => { setEditData(k); setShowForm(true) }}>
                          <Pencil size={14} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="action-btn danger" title="Hapus kelas">
                              <Trash2 size={14} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin menghapus kelas <strong>{k.namaKelas}</strong>? Kelas yang memiliki siswa tidak dapat dihapus.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(k.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="table-info-bar">
            <span className="table-info-text">
              Menampilkan {startItem}–{endItem} dari {total} kelas
            </span>
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => handlePage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2
                if (p < 1 || p > totalPages) return null
                return (
                  <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => handlePage(p)}>
                    {p}
                  </button>
                )
              })}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditData(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School size={18} className="text-gold-400" />
              {editData ? 'Edit Kelas' : 'Tambah Kelas'}
            </DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah data kelas yang sudah ada' : 'Tambahkan kelas baru ke dalam sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaKelas">Nama Kelas *</Label>
              <Input id="namaKelas" name="namaKelas" defaultValue={editData?.namaKelas} required placeholder="Misal: X-IPA 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tingkat">Tingkat *</Label>
                <Select name="tingkat" defaultValue={editData?.tingkat || 'X'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">X</SelectItem>
                    <SelectItem value="XI">XI</SelectItem>
                    <SelectItem value="XII">XII</SelectItem>
                    <SelectItem value="VII">VII</SelectItem>
                    <SelectItem value="VIII">VIII</SelectItem>
                    <SelectItem value="IX">IX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan / Peminatan</Label>
                <Input id="jurusan" name="jurusan" defaultValue={editData?.jurusan || ''} placeholder="IPA, IPS, TKJ..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Wali Kelas</Label>
              <Select name="waliKelasId" defaultValue={editData?.waliKelasId || 'none'}>
                <SelectTrigger><SelectValue placeholder="Pilih wali kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Belum ditentukan —</SelectItem>
                  {guruList.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={editData ? String(editData.status) : 'true'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
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
