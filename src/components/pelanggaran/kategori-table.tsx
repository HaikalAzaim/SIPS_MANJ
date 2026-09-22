"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, List, X, RotateCcw } from 'lucide-react'
import { createKategori, updateKategori, deleteKategori } from '@/actions/kategori'
import { toast } from 'sonner'

interface KategoriTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
}

// Tingkat badge config
const tingkatConfig: Record<string, { badgeClass: string; label: string }> = {
  RINGAN:       { badgeClass: 'badge badge-ringan',       label: 'Ringan' },
  SEDANG:       { badgeClass: 'badge badge-sedang',       label: 'Sedang' },
  BERAT:        { badgeClass: 'badge badge-berat',        label: 'Berat' },
  SANGAT_BERAT: { badgeClass: 'badge badge-sangat-berat', label: 'Sangat Berat' },
}

export function KategoriTable({ data, total, page, totalPages, limit }: KategoriTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [tingkatFilter, setTingkatFilter] = useState(searchParams.get('tingkat') || '')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const isFiltered = Boolean(search || (tingkatFilter && tingkatFilter !== 'all'))

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/pelanggaran/kategori?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/pelanggaran/kategori?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    setTingkatFilter('')
    router.push('/pelanggaran/kategori')
  }

  function handleTingkatFilter(value: string) {
    setTingkatFilter(value)
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set('tingkat', value)
    else params.delete('tingkat')
    params.set('page', '1')
    router.push(`/pelanggaran/kategori?${params.toString()}`)
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/pelanggaran/kategori?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const formData = {
      nama: form.get('nama') as string,
      deskripsi: form.get('deskripsi') as string,
      tingkat: form.get('tingkat') as any,
      poin: Number(form.get('poin')),
    }
    const result = editData
      ? await updateKategori(editData.id, formData)
      : await createKategori(formData)
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success(editData ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteKategori(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Kategori berhasil dihapus')
    router.refresh()
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="table-toolbar-group">
          {/* Search */}
          <form onSubmit={handleSearch} className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kategori..."
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

          {/* Filter Tingkat */}
          <Select onValueChange={handleTingkatFilter} value={tingkatFilter || 'all'}>
            <SelectTrigger className="w-[155px]">
              <SelectValue placeholder="Semua Tingkat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkat</SelectItem>
              <SelectItem value="RINGAN">Ringan</SelectItem>
              <SelectItem value="SEDANG">Sedang</SelectItem>
              <SelectItem value="BERAT">Berat</SelectItem>
              <SelectItem value="SANGAT_BERAT">Sangat Berat</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset button if filtered */}
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
          Tambah Kategori
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '2.5rem' }}>No</th>
                <th>Nama Pelanggaran</th>
                <th>Deskripsi</th>
                <th>Tingkat</th>
                <th className="td-center">Poin</th>
                <th>Status</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={<List size={22} />}
                      title={isFiltered ? "Tidak ada kategori yang sesuai" : "Belum ada kategori pelanggaran"}
                      description={isFiltered ? "Coba ubah kata kunci atau filter tingkat pelanggaran." : "Tambahkan kategori pelanggaran baru beserta bobot poinnya."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => { setEditData(null); setShowForm(true) }}>
                            <Plus size={14} />
                            Tambah Kategori
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((k, i) => {
                  const tCfg = tingkatConfig[k.tingkat] ?? { badgeClass: 'badge badge-info', label: k.tingkat }
                  return (
                    <tr key={k.id}>
                      <td className="td-mono">{startItem + i}</td>
                      <td className="td-primary">{k.nama}</td>
                      <td>
                        <span
                          className="td-muted block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                          title={k.deskripsi || ''}
                        >
                          {k.deskripsi || <span className="italic text-[#3d506a]">—</span>}
                        </span>
                      </td>
                      <td>
                        <span className={tCfg.badgeClass}>{tCfg.label}</span>
                      </td>
                      <td className="td-center">
                        {/* Poin displayed prominently with gold */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '2rem',
                          height: '1.625rem',
                          padding: '0 0.4rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          background: 'rgba(217,166,46,0.08)',
                          color: '#D9A62E',
                          border: '1px solid rgba(217,166,46,0.15)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {k.poin}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${k.status ? 'badge-normal' : 'badge-teguran'}`}>
                          {k.status ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            className="action-btn"
                            title="Edit kategori"
                            onClick={() => { setEditData(k); setShowForm(true) }}
                          >
                            <Pencil size={14} />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="action-btn danger" title="Hapus kategori">
                                <Trash2 size={14} />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Yakin ingin menghapus kategori <strong>{k.nama}</strong>?
                                  Kategori yang sudah digunakan dalam catatan pelanggaran tidak dapat dihapus.
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {totalPages > 1 && (
          <div className="table-info-bar">
            <span className="table-info-text">
              Menampilkan {startItem}–{endItem} dari {total} kategori
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

      {/* ── Form Dialog ── */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditData(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editData ? 'Edit Kategori Pelanggaran' : 'Tambah Kategori Pelanggaran'}
            </DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah data kategori pelanggaran' : 'Tambahkan jenis pelanggaran dan bobot poinnya'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama Pelanggaran *</Label>
              <Input id="nama" name="nama" defaultValue={editData?.nama} required placeholder="Misal: Terlambat masuk sekolah" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea id="deskripsi" name="deskripsi" defaultValue={editData?.deskripsi} rows={2} placeholder="Keterangan singkat pelanggaran..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tingkat">Tingkat *</Label>
                <Select name="tingkat" defaultValue={editData?.tingkat || 'RINGAN'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RINGAN">Ringan</SelectItem>
                    <SelectItem value="SEDANG">Sedang</SelectItem>
                    <SelectItem value="BERAT">Berat</SelectItem>
                    <SelectItem value="SANGAT_BERAT">Sangat Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="poin">Bobot Poin *</Label>
                <Input id="poin" name="poin" type="number" min={1} defaultValue={editData?.poin || 5} required />
              </div>
            </div>
            <div className="space-y-1.5">
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
                {loading && <Loader2 size={14} className="animate-spin" />}
                {editData ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
