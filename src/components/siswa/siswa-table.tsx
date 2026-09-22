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
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, GraduationCap, X, RotateCcw, FileSpreadsheet } from 'lucide-react'
import { ImportDialog } from '@/components/import/import-dialog'
import { createSiswa, updateSiswa, deleteSiswa } from '@/actions/siswa'
import { toast } from 'sonner'
import Link from 'next/link'

interface SiswaTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  kelasList: any[]
  thresholds: any[]
}

export function SiswaTable({ data, total, page, totalPages, limit, kelasList, thresholds }: SiswaTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const currentKelasId = searchParams.get('kelasId') || 'all'
  const isFiltered = Boolean(search || (currentKelasId && currentKelasId !== 'all'))

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/siswa?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/siswa?${params.toString()}`)
  }

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    router.push(`/siswa?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/siswa')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/siswa?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const formData = {
      nisn: form.get('nisn') as string,
      niup: form.get('niup') as string,
      nama: form.get('nama') as string,
      jenisKelamin: form.get('jenisKelamin') as string,
      kelasId: form.get('kelasId') as string,
      tempatLahir: form.get('tempatLahir') as string,
      tanggalLahir: form.get('tanggalLahir') as string,
      alamat: form.get('alamat') as string,
      tahunMasuk: form.get('tahunMasuk') ? Number(form.get('tahunMasuk')) : undefined,
    }
    const result = editData
      ? await updateSiswa(editData.id, formData)
      : await createSiswa(formData)
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success(editData ? 'Data siswa berhasil diubah' : 'Siswa berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteSiswa(id)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('Siswa berhasil dihapus')
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
              placeholder="Cari NISN, NIUP, atau nama..."
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

          {/* Filter Kelas */}
          <Select
            value={currentKelasId}
            onValueChange={(v) => handleFilter('kelasId', v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasList.map((k: any) => (
                <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
              ))}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => setShowImport(true)} className="gap-1.5">
            <FileSpreadsheet size={15} />
            Import Excel
          </Button>
          <Button onClick={() => { setEditData(null); setShowForm(true) }}>
            <Plus size={15} />
            Tambah Siswa
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
                <th>NISN</th>
                <th>NIUP</th>
                <th>Nama</th>
                <th>L/P</th>
                <th>Kelas</th>
                <th className="td-center">Pelanggaran</th>
                <th className="td-center">Poin</th>
                <th>Status</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-0">
                    <EmptyState
                      icon={<GraduationCap size={22} />}
                      title={isFiltered ? "Tidak ada data yang sesuai" : "Belum ada data siswa"}
                      description={isFiltered ? "Coba gunakan kata kunci lain atau ubah filter kelas." : "Belum ada siswa yang terdaftar. Tambahkan siswa baru untuk memulai."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => { setEditData(null); setShowForm(true) }}>
                            <Plus size={14} />
                            Tambah Siswa
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((siswa, i) => (
                  <tr key={siswa.id}>
                    <td className="td-mono">{startItem + i}</td>
                    <td className="td-mono">{siswa.nisn}</td>
                    <td className="td-mono">{siswa.niup}</td>
                    <td>
                      <Link href={`/siswa/${siswa.id}`} className="td-primary hover:text-[#D9A441] transition-colors font-semibold">
                        {siswa.nama}
                      </Link>
                    </td>
                    <td className="td-muted">{siswa.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}</td>
                    <td className="text-[#91A4BD] text-[13px]">{siswa.kelas?.namaKelas}</td>
                    <td className="td-center text-[#91A4BD]">{siswa.totalPelanggaran}</td>
                    <td className="td-center">
                      <span className={`poin-badge ${siswa.totalPoin === 0 ? 'opacity-40' : ''}`}>
                        {siswa.totalPoin}
                      </span>
                    </td>
                    <td>
                      <Badge variant={
                        siswa.statusLabel === 'Normal'    ? 'normal' :
                        siswa.statusLabel === 'Perhatian' ? 'perhatian' :
                        siswa.statusLabel === 'Peringatan'? 'peringatan' : 'teguran'
                      }>
                        {siswa.statusLabel}
                      </Badge>
                    </td>
                    <td className="td-actions">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/siswa/${siswa.id}`}>
                          <button className="action-btn" title="Lihat detail">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <button
                          className="action-btn"
                          title="Edit siswa"
                          onClick={() => { setEditData(siswa); setShowForm(true) }}
                        >
                          <Pencil size={14} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="action-btn danger" title="Hapus siswa">
                              <Trash2 size={14} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Siswa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus data siswa <strong>{siswa.nama}</strong>? Data pelanggaran siswa tetap tersimpan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(siswa.id)}>Hapus</AlertDialogAction>
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

        {/* Footer */}
        {totalPages > 1 && (
          <div className="table-info-bar">
            <span className="table-info-text">
              Menampilkan {startItem}–{endItem} dari {total} siswa
            </span>
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => handlePage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    className={`pagination-btn ${p === page ? 'active' : ''}`}
                    onClick={() => handlePage(p)}
                  >
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah data siswa yang sudah ada' : 'Tambahkan siswa baru ke dalam sistem'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nisn">NISN *</Label>
                <Input id="nisn" name="nisn" defaultValue={editData?.nisn} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="niup">NIUP *</Label>
                <Input id="niup" name="niup" defaultValue={editData?.niup} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input id="nama" name="nama" defaultValue={editData?.nama} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jenis Kelamin *</Label>
                <Select name="jenisKelamin" defaultValue={editData?.jenisKelamin || 'LAKI_LAKI'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Kelas *</Label>
                <Select name="kelasId" defaultValue={editData?.kelasId}>
                  <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                  <SelectContent>
                    {kelasList.map((k: any) => (
                      <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tempatLahir">Tempat Lahir</Label>
                <Input id="tempatLahir" name="tempatLahir" defaultValue={editData?.tempatLahir} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                <Input
                  id="tanggalLahir" name="tanggalLahir" type="date"
                  defaultValue={editData?.tanggalLahir ? new Date(editData.tanggalLahir).toISOString().split('T')[0] : ''}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea id="alamat" name="alamat" defaultValue={editData?.alamat} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tahunMasuk">Tahun Masuk</Label>
              <Input id="tahunMasuk" name="tahunMasuk" type="number" defaultValue={editData?.tahunMasuk} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {editData ? 'Simpan Perubahan' : 'Tambah Siswa'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Import Dialog ── */}
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        type="siswa"
        onImportSuccess={() => router.refresh()}
      />
    </>
  )
}
