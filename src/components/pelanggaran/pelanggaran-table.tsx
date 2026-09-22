"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Search, Trash2, ChevronLeft, ChevronRight, Loader2, ClipboardList, X, RotateCcw } from 'lucide-react'
import { createPelanggaran, deletePelanggaran } from '@/actions/pelanggaran'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface PelanggaranTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  siswaList: any[]
  kelasList: any[]
  kategoriList: any[]
}

const tingkatMap: Record<string, { variant: any; label: string }> = {
  RINGAN:      { variant: 'ringan',       label: 'Ringan' },
  SEDANG:      { variant: 'sedang',       label: 'Sedang' },
  BERAT:       { variant: 'berat',        label: 'Berat' },
  SANGAT_BERAT:{ variant: 'sangat_berat', label: 'Sangat Berat' },
}

export function PelanggaranTable({ data, total, page, totalPages, limit, siswaList, kelasList, kategoriList }: PelanggaranTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedKelasId, setSelectedKelasId] = useState('')

  const currentKelasId = searchParams.get('kelasId') || 'all'
  const currentKategoriId = searchParams.get('kategoriId') || 'all'
  const isFiltered = Boolean(search || (currentKelasId && currentKelasId !== 'all') || (currentKategoriId && currentKategoriId !== 'all'))

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/pelanggaran?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/pelanggaran?${params.toString()}`)
  }

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    router.push(`/pelanggaran?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/pelanggaran')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/pelanggaran?${params.toString()}`)
  }

  const filteredSiswa = selectedKelasId
    ? siswaList.filter((s: any) => s.kelasId === selectedKelasId)
    : siswaList

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createPelanggaran({
      siswaId: form.get('siswaId') as string,
      kategoriPelanggaranId: form.get('kategoriPelanggaranId') as string,
      tanggal: new Date(form.get('tanggal') as string),
      waktu: form.get('waktu') as string,
      lokasi: form.get('lokasi') as string,
      keterangan: form.get('keterangan') as string,
      tindakLanjut: form.get('tindakLanjut') as string,
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Pelanggaran berhasil dicatat')
    setShowForm(false)
    setSelectedKelasId('')
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deletePelanggaran(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Pelanggaran berhasil dihapus')
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
              placeholder="Cari nama atau NIUP siswa..."
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasList.map((k: any) => (
                <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter Kategori */}
          <Select
            value={currentKategoriId}
            onValueChange={(v) => handleFilter('kategoriId', v)}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {kategoriList.map((k: any) => (
                <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
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

        {/* Action */}
        <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
          <Plus size={15} />
          Catat Pelanggaran
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '2.5rem' }}>No</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>Pelanggaran</th>
                <th>Tingkat</th>
                <th className="td-center">Poin</th>
                <th>Lokasi</th>
                <th>Dicatat Oleh</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-0">
                    <EmptyState
                      icon={<ClipboardList size={22} />}
                      title={isFiltered ? "Tidak ada data yang sesuai" : "Belum ada data pelanggaran"}
                      description={isFiltered ? "Coba gunakan kata kunci lain atau ubah filter kelas/kategori." : "Belum ada catatan pelanggaran yang tersedia. Klik tombol untuk mencatat pelanggaran baru."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus size={14} />
                            Catat Pelanggaran
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((p, i) => {
                  const tingkat = tingkatMap[p.kategoriPelanggaran.tingkat] ?? { variant: 'info', label: p.kategoriPelanggaran.tingkat }
                  return (
                    <tr key={p.id}>
                      <td className="td-mono">{startItem + i}</td>
                      <td className="whitespace-nowrap text-[var(--text-secondary)]">{formatDate(p.tanggal)}</td>
                      <td className="td-muted">{p.waktu}</td>
                      <td className="td-primary whitespace-nowrap">{p.siswa.nama}</td>
                      <td className="td-muted">{p.siswa.kelas?.namaKelas}</td>
                      <td>
                        <span className="text-[13px] text-[var(--text-primary)] max-w-[160px] block truncate" title={p.kategoriPelanggaran.nama}>
                          {p.kategoriPelanggaran.nama}
                        </span>
                      </td>
                      <td>
                        <Badge variant={tingkat.variant}>{tingkat.label}</Badge>
                      </td>
                      <td className="td-center">
                        <span className="poin-badge">{p.poin}</span>
                      </td>
                      <td className="td-muted text-[12px]">{p.lokasi || '—'}</td>
                      <td className="td-muted text-[12px] whitespace-nowrap">{p.dicatatOleh.name}</td>
                      <td className="td-actions">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="action-btn danger" title="Hapus pelanggaran">
                              <Trash2 size={14} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pelanggaran</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin ingin menghapus catatan pelanggaran <strong>{p.kategoriPelanggaran.nama}</strong> untuk <strong>{p.siswa.nama}</strong>? Poin siswa akan berkurang.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: info + pagination */}
        {totalPages > 1 && (
          <div className="table-info-bar">
            <span className="table-info-text">
              Menampilkan {startItem}–{endItem} dari {total} pelanggaran
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Catat Pelanggaran</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk mencatat pelanggaran siswa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Filter Kelas (opsional)</Label>
              <Select onValueChange={(v) => setSelectedKelasId(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Tampilkan semua siswa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map((k: any) => (
                    <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siswaId">Siswa *</Label>
              <Select name="siswaId" required>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  {filteredSiswa.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama} — {s.kelas?.namaKelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kategoriPelanggaranId">Kategori Pelanggaran *</Label>
              <Select name="kategoriPelanggaranId" required>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {kategoriList.map((k: any) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama} ({k.poin} poin)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tanggal">Tanggal *</Label>
                <Input id="tanggal" name="tanggal" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="waktu">Waktu *</Label>
                <Input id="waktu" name="waktu" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lokasi">Lokasi Kejadian</Label>
              <Input id="lokasi" name="lokasi" placeholder="Misal: Kelas, Kantin, Lapangan..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea id="keterangan" name="keterangan" placeholder="Keterangan tambahan..." rows={3} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 size={14} className="animate-spin" />}
                Simpan Pelanggaran
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
