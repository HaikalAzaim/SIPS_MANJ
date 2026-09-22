"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, Calendar, Star, X, RotateCcw } from 'lucide-react'
import { createTahunAjaran, updateTahunAjaran, deleteTahunAjaran, setActiveTahunAjaran } from '@/actions/tahun-ajaran'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface TahunAjaranTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export function TahunAjaranTable({ data, total, page, totalPages, limit }: TahunAjaranTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/tahun-ajaran?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/tahun-ajaran?${params.toString()}`)
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/tahun-ajaran?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const formData = {
      nama: form.get('nama') as string,
      mulai: form.get('mulai') as string,
      selesai: form.get('selesai') as string,
      isActive: form.get('isActive') === 'on',
    }

    const result = editData
      ? await updateTahunAjaran(editData.id, formData)
      : await createTahunAjaran(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editData ? 'Tahun ajaran berhasil diubah' : 'Tahun ajaran berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteTahunAjaran(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Tahun ajaran berhasil dihapus')
    router.refresh()
  }

  async function handleSetActive(id: string) {
    const result = await setActiveTahunAjaran(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Tahun ajaran aktif berhasil diubah')
    router.refresh()
  }

  function openEdit(item: any) {
    setEditData({
      ...item,
      mulai: new Date(item.mulai).toISOString().split('T')[0],
      selesai: new Date(item.selesai).toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  const isFiltered = Boolean(search)

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <Input
              placeholder="Cari tahun ajaran..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[var(--text-primary)] cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
          {isFiltered && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); router.push('/tahun-ajaran') }}>
              <RotateCcw size={14} /> Reset
            </Button>
          )}
        </form>
        <Button onClick={() => { setEditData(null); setShowForm(true) }}>
          <Plus size={15} /> Tambah Tahun Ajaran
        </Button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th style={{ width: '10rem' }}>Nama</th>
                <th style={{ width: '10rem' }}>Tanggal Mulai</th>
                <th style={{ width: '10rem' }}>Tanggal Selesai</th>
                <th style={{ width: '6rem' }} className="td-center">Siswa</th>
                <th style={{ width: '6rem' }} className="td-center">Status</th>
                <th style={{ width: '8rem' }} className="td-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<Calendar size={24} />}
                      title="Belum ada tahun ajaran"
                      description="Tambahkan tahun ajaran untuk mulai mengelola data akademik"
                    />
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={item.id}>
                    <td className="td-mono">{(page - 1) * 10 + i + 1}</td>
                    <td className="td-primary font-semibold">{item.nama}</td>
                    <td className="text-[var(--text-muted)] text-[12px]">{formatDate(item.mulai)}</td>
                    <td className="text-[var(--text-muted)] text-[12px]">{formatDate(item.selesai)}</td>
                    <td className="td-center font-semibold text-[var(--text-primary)]">{item._count?.riwayatAkademik || 0}</td>
                    <td className="td-center">
                      {item.isActive ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Tidak Aktif</Badge>
                      )}
                    </td>
                    <td className="td-center">
                      <div className="flex items-center justify-center gap-1">
                        {!item.isActive && (
                          <Button variant="ghost" size="icon-sm" title="Set Aktif" onClick={() => handleSetActive(item.id)}>
                            <Star size={14} className="text-[#D9A441]" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => openEdit(item)}>
                          <Pencil size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" title="Hapus">
                              <Trash2 size={14} className="text-red-400" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Tahun Ajaran</AlertDialogTitle>
                              <AlertDialogDescription>Yakin ingin menghapus tahun ajaran {item.nama}? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-[12px] text-[#64748B]">
          <span>Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, total)} dari {total}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => handlePage(page - 1)}>
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="icon-sm" onClick={() => handlePage(i + 1)}>
                {i + 1}
              </Button>
            )).slice(Math.max(0, page - 3), page + 2)}
            <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditData(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}</DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah data tahun ajaran' : 'Masukkan data tahun ajaran baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama Tahun Ajaran</Label>
              <Input id="nama" name="nama" placeholder="2025/2026" defaultValue={editData?.nama || ''} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mulai">Tanggal Mulai</Label>
                <Input
                  id="mulai"
                  name="mulai"
                  type="date"
                  defaultValue={editData?.mulai ? new Date(editData.mulai).toISOString().split('T')[0] : ''}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="selesai">Tanggal Selesai</Label>
                <Input
                  id="selesai"
                  name="selesai"
                  type="date"
                  defaultValue={editData?.selesai ? new Date(editData.selesai).toISOString().split('T')[0] : ''}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" defaultChecked={editData?.isActive || false} className="rounded border-[var(--border)] bg-[var(--input)]" />
              <Label htmlFor="isActive" className="text-[13px] cursor-pointer">Tahun ajaran aktif</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditData(null) }}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                {editData ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
