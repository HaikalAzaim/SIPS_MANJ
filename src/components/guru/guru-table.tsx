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
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, UserCheck, Users, X, RotateCcw, FileSpreadsheet } from 'lucide-react'
import { ImportDialog } from '@/components/import/import-dialog'
import { createGuru, updateGuru, deleteGuru } from '@/actions/guru'
import { toast } from 'sonner'

interface GuruTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export function GuruTable({ data, total, page, totalPages, limit }: GuruTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const isFiltered = Boolean(search)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/guru?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/guru?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/guru')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/guru?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const formData = {
      niup: form.get('niup') as string,
      nama: form.get('nama') as string,
      jenisKelamin: form.get('jenisKelamin') as string,
      email: form.get('email') as string,
      nomorHp: (form.get('nomorHp') as string) || undefined,
      status: form.get('status') === 'true',
    }

    const result = editData
      ? await updateGuru(editData.id, formData)
      : await createGuru(formData)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editData ? 'Data guru berhasil diubah' : 'Guru berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteGuru(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Guru berhasil dihapus')
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
              placeholder="Cari NIUP atau nama guru..."
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => setShowImport(true)} className="gap-1.5">
            <FileSpreadsheet size={15} />
            Import Excel
          </Button>
          <Button onClick={() => { setEditData(null); setShowForm(true) }}>
            <Plus size={15} />
            Tambah Guru
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '2.5rem' }}>No</th>
                <th>NIUP</th>
                <th>Nama</th>
                <th>L/P</th>
                <th>Email</th>
                <th>No HP</th>
                <th>Wali Kelas</th>
                <th>Status</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState
                      icon={<Users size={22} />}
                      title={isFiltered ? "Tidak ada data guru yang sesuai" : "Belum ada data guru"}
                      description={isFiltered ? "Coba gunakan kata kunci lain untuk mencari data guru." : "Tambahkan guru baru ke dalam sistem."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => { setEditData(null); setShowForm(true) }}>
                            <Plus size={14} />
                            Tambah Guru
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((g, i) => (
                  <tr key={g.id}>
                    <td className="td-mono">{startItem + i}</td>
                    <td className="td-mono">{g.niup}</td>
                    <td className="td-primary">{g.nama}</td>
                    <td className="td-muted">{g.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}</td>
                    <td className="td-muted text-[12px]">{g.email || '—'}</td>
                    <td className="td-muted text-[12px]">{g.nomorHp || '—'}</td>
                    <td className="text-[#91A4BD] text-[12px]">
                      {g.kelas?.length > 0
                        ? g.kelas.map((k: any) => k.namaKelas).join(', ')
                        : <span className="text-[#64748B] italic">Belum ditentukan</span>}
                    </td>
                    <td>
                      <Badge variant={g.status ? 'normal' : 'danger'}>
                        {g.status ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="td-actions">
                      <div className="flex items-center gap-1 justify-end">
                        <button className="action-btn" title="Edit guru" onClick={() => { setEditData(g); setShowForm(true) }}>
                          <Pencil size={14} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="action-btn danger" title="Hapus guru">
                              <Trash2 size={14} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Guru</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin menghapus data guru <strong>{g.nama}</strong>? Penugasan sebagai wali kelas akan dilepas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(g.id)}>Hapus</AlertDialogAction>
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
              Menampilkan {startItem}–{endItem} dari {total} guru
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
            <DialogTitle>
              {editData ? 'Edit Guru' : 'Tambah Guru'}
            </DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah data guru yang sudah ada' : 'Tambahkan guru baru ke dalam sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="niup">NIUP *</Label>
              <Input id="niup" name="niup" defaultValue={editData?.niup} required placeholder="Nomor Induk Ustadz/Pendidik" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input id="nama" name="nama" defaultValue={editData?.nama} required />
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin *</Label>
              <Select name="jenisKelamin" defaultValue={editData?.jenisKelamin || 'LAKI_LAKI'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                  <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editData?.email || ''} placeholder="guru@sekolah.id" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomorHp">Nomor HP</Label>
                <Input id="nomorHp" name="nomorHp" defaultValue={editData?.nomorHp || ''} placeholder="08xx..." />
              </div>
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
                {loading && <Loader2 size={14} className="animate-spin" />}
                {editData ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        type="guru"
        onImportSuccess={() => router.refresh()}
      />
    </>
  )
}
