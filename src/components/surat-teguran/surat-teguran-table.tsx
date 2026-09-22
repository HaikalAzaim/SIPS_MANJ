"use client"

import React, { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Trash2, ChevronLeft, ChevronRight, Loader2, BookOpen, CheckCircle2, Send, FileText, Printer, X, RotateCcw, Pencil } from 'lucide-react'
import { createSuratTeguran, updateStatusSuratTeguran, deleteSuratTeguran, updateNomorSurat } from '@/actions/surat-teguran'
import { toast } from 'sonner'
import { formatDate, cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import { ExportButtons } from '@/components/laporan/laporan-export'

interface SuratTeguranTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  siswaList: any[]
  signatoryInfo: {
    penandatanganNama: string
    penandatanganJabatan: string
    penandatanganNip: string
    tempatTanggal: string
    namaSekolah: string
    showTtd: boolean
  }
}

const statusColors: Record<string, any> = {
  DRAFT: 'warning',
  DITERBITKAN: 'normal',
  DIKIRIM: 'info',
}
const statusLabel: Record<string, string> = {
  DRAFT: 'Draft',
  DITERBITKAN: 'Diterbitkan',
  DIKIRIM: 'Dikirim',
}

export function SuratTeguranTable({ data, total, page, totalPages, limit, siswaList, signatoryInfo }: SuratTeguranTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formSiswaId, setFormSiswaId] = useState('')
  const [formJenisTeguran, setFormJenisTeguran] = useState('')
  // Edit nomor surat
  const [editTarget, setEditTarget] = useState<{ id: string; nomorSurat: string } | null>(null)
  const [editNomor, setEditNomor] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  // Cache logo agar tidak di-fetch ulang setiap kali print
  const logoCacheRef = useRef<string | null | 'FAILED'>('FAILED')

  const currentStatus = searchParams.get('status') || 'all'
  const isFiltered = Boolean(search || (currentStatus && currentStatus !== 'all'))

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/laporan/surat-teguran?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/laporan/surat-teguran?${params.toString()}`)
  }

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    router.push(`/laporan/surat-teguran?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/laporan/surat-teguran')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/laporan/surat-teguran?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formSiswaId) { toast.error('Siswa wajib dipilih'); return }
    if (!formJenisTeguran) { toast.error('Jenis teguran wajib dipilih'); return }
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await createSuratTeguran({
      siswaId: formSiswaId,
      jenisTeguran: formJenisTeguran,
      keterangan: form.get('keterangan') as string,
      tanggal: form.get('tanggal') as string,
      nomorSurat: (form.get('nomorSurat') as string) || undefined,
    })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Surat teguran berhasil dibuat')
    setShowForm(false)
    setFormSiswaId('')
    setFormJenisTeguran('')
    router.refresh()
  }

  async function handleUpdateStatus(id: string, status: string) {
    const result = await updateStatusSuratTeguran(id, status)
    if (result.success) {
      toast.success(`Status surat diperbarui menjadi ${statusLabel[status]}`)
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteSuratTeguran(id)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('Surat teguran berhasil dihapus')
    router.refresh()
  }

  function openEditNomor(surat: any) {
    setEditTarget({ id: surat.id, nomorSurat: surat.nomorSurat })
    setEditNomor(surat.nomorSurat)
  }

  async function handleSaveNomor() {
    if (!editTarget) return
    if (!editNomor.trim()) { toast.error('Nomor surat tidak boleh kosong'); return }
    setEditLoading(true)
    const result = await updateNomorSurat(editTarget.id, editNomor)
    setEditLoading(false)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('Nomor surat berhasil diperbarui')
    setEditTarget(null)
    router.refresh()
  }

  async function printSurat(surat: any) {
    // Ambil logo dari cache atau fetch sekali saja
    if (logoCacheRef.current === 'FAILED') {
      try {
        const res = await fetch('/logo-manj.png')
        if (res.ok) {
          const blob = await res.blob()
          const b64: string = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
          logoCacheRef.current = b64
        } else {
          logoCacheRef.current = null
        }
      } catch {
        logoCacheRef.current = null
      }
    }

    const logoBase64 = logoCacheRef.current === 'FAILED' ? null : logoCacheRef.current

    const tanggalFormatted = new Date(surat.tanggal).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    const tempatKota = signatoryInfo.tempatTanggal || 'Paiton'
    const tanggalCetak = tempatKota + ', ' + tanggalFormatted

    const penandatanganNama    = signatoryInfo.penandatanganNama    || 'Kepala Sekolah'
    const penandatanganJabatan = signatoryInfo.penandatanganJabatan || 'Kepala Sekolah'
    const penandatanganNip     = signatoryInfo.penandatanganNip     || ''

    const logoTag = logoBase64
      ? '<img src="' + logoBase64 + '" style="height:70px;width:auto;object-fit:contain;" alt="Logo" />'
      : ''

    // ── TTD block dikonstruksi dulu sebelum template utama ─────────
    const ttdBlock = signatoryInfo.showTtd
      ? '<div class="ttd-wrap"><div class="ttd-box">' +
        '<div class="ttd-tempat">' + tanggalCetak + '</div>' +
        '<div class="ttd-jabatan">' + penandatanganJabatan + ',</div>' +
        '<div class="ttd-garis"></div>' +
        '<div class="ttd-nama">' + penandatanganNama + '</div>' +
        (penandatanganNip ? '<div class="ttd-nip">NIP. ' + penandatanganNip + '</div>' : '') +
        '</div></div>'
      : ''

    const w = window.open('', '_blank')
    if (!w) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Teguran ${surat.nomorSurat}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12pt; color: #111; }
          .page { padding: 2cm 2.5cm; }
          .kop { display: flex; align-items: center; gap: 18px; padding-bottom: 10px; border-bottom: 3px solid #111; margin-bottom: 6px; }
          .kop-logo { flex-shrink: 0; }
          .kop-text { flex: 1; text-align: center; }
          .kop-text .sekolah-utama { font-size: 18pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
          .kop-text .sekolah-sub   { font-size: 11pt; font-weight: bold; margin-top: 2px; }
          .kop-text .sekolah-alamat{ font-size: 9pt; color: #444; margin-top: 3px; }
          .kop-thin { border-top: 1px solid #888; margin-bottom: 20px; }
          .judul-surat { text-align: center; margin: 22px 0 6px; }
          .judul-surat h2 { font-size: 15pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
          .judul-surat .nomor { font-size: 11pt; margin-top: 4px; color: #333; }
          .judul-surat hr { border: none; border-top: 1.5px solid #111; margin-top: 8px; }
          .pembuka { margin: 18px 0 10px; font-size: 11.5pt; }
          .field-tabel { width: 100%; border-collapse: collapse; margin: 6px 0 14px; }
          .field-tabel td { padding: 3px 0; font-size: 11.5pt; vertical-align: top; }
          .field-tabel td.label { width: 180px; }
          .field-tabel td.titik { width: 20px; text-align: center; }
          .field-tabel td.nilai { font-weight: bold; }
          .keterangan-box { margin: 4px 0 14px; font-size: 11.5pt; }
          .isi-paragraf { font-size: 11.5pt; line-height: 1.7; margin: 10px 0; text-align: justify; }
          .ttd-wrap { margin-top: 40px; display: flex; justify-content: flex-end; }
          .ttd-box { text-align: center; min-width: 200px; }
          .ttd-box .ttd-tempat { font-size: 11pt; margin-bottom: 6px; }
          .ttd-box .ttd-garis { margin-top: 60px; border-top: 1px solid #111; width: 160px; margin-left: auto; margin-right: auto; }
          .ttd-box .ttd-nama { font-size: 11.5pt; font-weight: bold; margin-top: 4px; }
          .ttd-box .ttd-jabatan { font-size: 10.5pt; color: #444; }
          .ttd-box .ttd-nip { font-size: 10pt; color: #555; }
          @media print {
            @page { size: A4; margin: 0; }
            .page { padding: 2cm 2.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="kop">
            <div class="kop-logo">${logoTag}</div>
            <div class="kop-text">
              <div class="sekolah-utama">MA Nurul Jadid</div>
              <div class="sekolah-sub">Madrasah Aliyah Nurul Jadid</div>
              <div class="sekolah-alamat">Karanganyar, Paiton, Probolinggo, Jawa Timur 67291 &bull; Telp. (0335) 771732</div>
            </div>
          </div>
          <div class="kop-thin"></div>
          <div class="judul-surat">
            <h2>Surat Teguran</h2>
            <p class="nomor">Nomor: <strong>${surat.nomorSurat}</strong></p>
            <hr />
          </div>
          <p class="pembuka">Yang bertanda tangan di bawah ini menyatakan bahwa:</p>
          <table class="field-tabel">
            <tr><td class="label">Nama Siswa</td><td class="titik">:</td><td class="nilai">${surat.siswa.nama}</td></tr>
            <tr><td class="label">NIUP</td><td class="titik">:</td><td>${surat.siswa.niup}</td></tr>
            <tr><td class="label">Kelas</td><td class="titik">:</td><td class="nilai">${surat.siswa.kelas?.namaKelas || '-'}</td></tr>
            <tr><td class="label">Total Pelanggaran</td><td class="titik">:</td><td>${surat.totalPelanggaran} kasus</td></tr>
            <tr><td class="label">Total Poin</td><td class="titik">:</td><td>${surat.totalPoin} poin</td></tr>
            <tr><td class="label">Jenis Teguran</td><td class="titik">:</td><td class="nilai">${surat.jenisTeguran}</td></tr>
            <tr><td class="label">Tanggal</td><td class="titik">:</td><td>${tanggalFormatted}</td></tr>
          </table>
          ${surat.keterangan ? '<div class="keterangan-box">Keterangan: ' + surat.keterangan + '</div>' : ''}
          <p class="isi-paragraf">
            Dengan ini siswa tersebut diberikan teguran resmi atas pelanggaran tata tertib yang telah dilakukan.
            Siswa diharapkan dapat memperbaiki perilakunya dan mematuhi seluruh peraturan yang berlaku.
            Orang tua / wali siswa diharapkan untuk memberikan bimbingan dan pengawasan yang lebih intensif.
          </p>
          ${ttdBlock}
        </div>
        <script>
          // Auto-print setelah load, auto-close setelah print
          window.addEventListener('afterprint', function() { window.close() })
          window.onload = function() { setTimeout(function() { window.print() }, 250) }
        </script>
      </body>
      </html>
    `

    w.document.open()
    w.document.write(html)
    w.document.close()
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
              placeholder="Cari nomor surat atau nama siswa..."
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

          <Select onValueChange={(v) => handleFilter('status', v)} value={currentStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="DITERBITKAN">Diterbitkan</SelectItem>
              <SelectItem value="DIKIRIM">Dikirim</SelectItem>
            </SelectContent>
          </Select>

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

        <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
          <Plus size={15} />
          Buat Surat Teguran
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th style={{ width: '10rem' }}>Nomor Surat</th>
                <th style={{ width: '9rem' }}>Tanggal</th>
                <th>Nama Siswa</th>
                <th style={{ width: '11rem' }}>Kelas</th>
                <th style={{ width: '9rem' }}>Jenis Teguran</th>
                <th style={{ width: '6.5rem' }} className="td-center">Total Poin</th>
                <th style={{ width: '8.5rem' }}>Status</th>
                <th style={{ width: '9.5rem' }}>Dibuat Oleh</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-0">
                    <EmptyState
                      icon={<BookOpen size={22} />}
                      title={isFiltered ? "Tidak ada surat teguran yang sesuai" : "Belum ada surat teguran"}
                      description={isFiltered ? "Coba gunakan kata kunci lain atau ubah status surat." : "Surat teguran yang dibuat akan tercatat di sini."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus size={14} />
                            Buat Surat Teguran
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((s, i) => (
                  <tr key={s.id}>
                    <td className="td-mono">{startItem + i}</td>
                    <td className="td-mono font-medium text-[#D9A62E]">{s.nomorSurat}</td>
                    <td className="whitespace-nowrap text-[#8FA4BD] text-[12px]">{formatDate(s.tanggal)}</td>
                    <td className="td-primary whitespace-nowrap font-medium">{s.siswa.nama}</td>
                    <td className="td-muted text-[13px]">{s.siswa.kelas?.namaKelas || '-'}</td>
                    <td className="text-[13px] text-[#C5D3E3]">{s.jenisTeguran}</td>
                    <td className="td-center font-bold text-[#D9A62E]">{s.totalPoin}</td>
                    <td>
                      <Badge variant={statusColors[s.status]}>{statusLabel[s.status]}</Badge>
                    </td>
                    <td className="td-muted text-[12px]">{s.dibuatOleh?.name || '-'}</td>
                    <td className="td-actions">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="action-btn text-[#8FA4BD] hover:text-white"
                          onClick={() => openEditNomor(s)}
                          title="Edit Nomor Surat"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => printSurat(s)}
                          title="Cetak Surat"
                        >
                          <Printer size={13} />
                        </button>
                        {s.status === 'DRAFT' && (
                          <button
                            className="action-btn text-[#22c55e] hover:text-white"
                            onClick={() => handleUpdateStatus(s.id, 'DITERBITKAN')}
                            title="Terbitkan"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        {s.status === 'DITERBITKAN' && (
                          <button
                            className="action-btn text-[#5B7A9D] hover:text-white"
                            onClick={() => handleUpdateStatus(s.id, 'DIKIRIM')}
                            title="Tandai Terkirim"
                          >
                            <Send size={13} />
                          </button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="action-btn danger" title="Hapus surat">
                              <Trash2 size={13} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Surat Teguran</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus surat teguran nomor <strong>{s.nomorSurat}</strong>? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(s.id)}>Hapus</AlertDialogAction>
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
              Menampilkan {startItem}–{endItem} dari {total} surat
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
                    className={cn("pagination-btn", p === page && "active")}
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

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setFormSiswaId(''); setFormJenisTeguran('') } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen size={18} className="text-gold-400" />
              Buat Surat Teguran
            </DialogTitle>
            <DialogDescription>
              Surat teguran akan dibuat berdasarkan total poin pelanggaran siswa saat ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nomor Surat — opsional, kosong = auto-generate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nomorSurat">Nomor Surat</Label>
                <span className="text-[10px] text-[var(--text-secondary)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-full">
                  Opsional — kosong = otomatis
                </span>
              </div>
              <Input
                id="nomorSurat"
                name="nomorSurat"
                placeholder="Contoh: ST/2026/09/001 (kosongkan untuk auto)"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siswaId">Siswa *</Label>
              <Select value={formSiswaId} onValueChange={setFormSiswaId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {siswaList.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama} — {s.kelas?.namaKelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisTeguran">Jenis Teguran *</Label>
              <Select value={formJenisTeguran} onValueChange={setFormJenisTeguran} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis teguran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teguran Lisan">Teguran Lisan</SelectItem>
                  <SelectItem value="Teguran Tertulis I">Teguran Tertulis I</SelectItem>
                  <SelectItem value="Teguran Tertulis II">Teguran Tertulis II</SelectItem>
                  <SelectItem value="Surat Panggilan Orang Tua">Surat Panggilan Orang Tua</SelectItem>
                  <SelectItem value="Skorsing">Skorsing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea id="keterangan" name="keterangan" rows={3} placeholder="Keterangan tambahan..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                Buat Surat
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Edit Nomor Surat ── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil size={16} className="text-gold-400" />
              Edit Nomor Surat
            </DialogTitle>
            <DialogDescription>
              Ubah nomor surat teguran. Pastikan nomor bersifat unik.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="editNomorSurat">Nomor Surat</Label>
              <Input
                id="editNomorSurat"
                value={editNomor}
                onChange={(e) => setEditNomor(e.target.value)}
                placeholder="Contoh: ST/2026/09/001"
                className="font-mono"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNomor() }}
                autoFocus
              />
              <p className="text-[11px] text-[var(--text-secondary)]">
                Format otomatis: ST/TAHUN/BULAN/URUTAN
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveNomor}
                disabled={editLoading}
                className="flex-1"
              >
                {editLoading && <Loader2 size={14} className="animate-spin mr-1.5" />}
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
