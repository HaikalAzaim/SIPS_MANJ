"use client"

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExportButtons } from '@/components/laporan/laporan-export'
import { formatDate } from '@/lib/utils'
import { Filter, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface LaporanPelanggaranClientProps {
  initialData: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  kelasList: any[]
  kategoriList: any[]
  filterParams: {
    startDate?: string
    endDate?: string
    kelasId?: string
    tingkat?: string
  }
  signatoryInfo: {
    kepalaSekolahNama: string
    kepalaSekolahNip: string
    stafKesiswaanNama: string
    stafKesiswaanNip: string
    showTtdLaporan: boolean
  }
}

const tingkatLabel: Record<string, string> = {
  RINGAN: 'Ringan', SEDANG: 'Sedang', BERAT: 'Berat', SANGAT_BERAT: 'Sangat Berat',
}
const tingkatVariant: Record<string, any> = {
  RINGAN: 'info', SEDANG: 'warning', BERAT: 'danger', SANGAT_BERAT: 'danger',
}

// Format tanggal dd/mm/yyyy untuk PDF
function formatDatePdf(date: Date | string): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Format periode untuk judul file
function formatPeriodeLabel(startDate?: string, endDate?: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
  if (startDate && endDate) {
    const s = new Date(startDate)
    const e = new Date(endDate)
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return s.toLocaleDateString('id-ID', opts)
    }
    return `${s.toLocaleDateString('id-ID', opts)} - ${e.toLocaleDateString('id-ID', opts)}`
  }
  if (startDate) return `Ab ${new Date(startDate).toLocaleDateString('id-ID', opts)}`
  if (endDate) return `s.d. ${new Date(endDate).toLocaleDateString('id-ID', opts)}`
  return 'Semua Periode'
}

// Ambil logo sebagai base64 untuk jsPDF
async function getLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch('/logo-manj.png')
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export function LaporanPelanggaranClient({
  initialData,
  total,
  page,
  totalPages,
  limit,
  kelasList,
  kategoriList,
  filterParams,
  signatoryInfo,
}: LaporanPelanggaranClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const data = initialData

  // Form state — initialized from current URL params
  const [startDate, setStartDate] = useState(filterParams.startDate || '')
  const [endDate, setEndDate] = useState(filterParams.endDate || '')
  const [kelasId, setKelasId] = useState(filterParams.kelasId || '')
  const [tingkat, setTingkat] = useState(filterParams.tingkat || '')

  function applyFilter() {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (kelasId && kelasId !== 'semua') params.set('kelasId', kelasId)
    if (tingkat && tingkat !== 'semua') params.set('tingkat', tingkat)
    params.set('page', '1')
    startTransition(() => {
      router.push(`/laporan/pelanggaran?${params.toString()}`)
    })
  }

  function resetFilter() {
    setStartDate('')
    setEndDate('')
    setKelasId('')
    setTingkat('')
    startTransition(() => {
      router.push('/laporan/pelanggaran')
    })
  }

  function exportExcel() {
    import('xlsx').then((XLSX) => {
      const kelasDipilih = kelasList.find((k: any) => k.id === filterParams.kelasId)
      const namaKelas = kelasDipilih ? kelasDipilih.namaKelas.replace(/\s+/g, '_') : ''
      const periode = formatPeriodeLabel(filterParams.startDate, filterParams.endDate).replace(/\s+/g, '_')
      const namaFile = namaKelas
        ? `Data_Pelanggaran_${namaKelas}_${periode}.xlsx`
        : `Data_Pelanggaran_${periode}.xlsx`

      // Helper style
      const boldCenter = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } }
      const boldLeft   = { font: { bold: true }, alignment: { horizontal: 'left', vertical: 'center' } }
      const normalLeft = { alignment: { horizontal: 'left', vertical: 'center', wrapText: true } }
      const normalCenter = { alignment: { horizontal: 'center', vertical: 'center' } }
      const border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      }
      const headerFill = { fgColor: { rgb: 'D9D9D9' }, patternType: 'solid' }

      const ws: any = {}
      const cols = ['A','B','C','D','E','F','G','H','I','J','K','L']

      // ── Baris 1-3: Header Sekolah ──────────────────────────────
      ws['A1'] = { v: 'LAPORAN PELANGGARAN SISWA', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } } }
      ws['A2'] = { v: 'MA NURUL JADID', s: { font: { bold: true, sz: 13 }, alignment: { horizontal: 'center' } } }
      ws['A3'] = { v: 'PAITON - PROBOLINGGO', s: { font: { sz: 10 }, alignment: { horizontal: 'center' } } }
      // Merge A1:L1, A2:L2, A3:L3
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
      ]

      // ── Baris 5-8: Info ────────────────────────────────────────
      const tingkatDipilih = filterParams.tingkat
        ? (tingkatLabel[filterParams.tingkat] || filterParams.tingkat)
        : 'Semua Tingkat'
      const periodeStart = filterParams.startDate
        ? new Date(filterParams.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
        : '-'
      const periodeEnd = filterParams.endDate
        ? new Date(filterParams.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
        : '-'
      const periodeLabel2 = filterParams.startDate || filterParams.endDate
        ? `${periodeStart} - ${periodeEnd}` : 'Semua Periode'

      const infoRows = [
        ['Periode', periodeLabel2],
        ['Kelas', kelasDipilih ? kelasDipilih.namaKelas : 'Semua Kelas'],
        ['Tingkat', tingkatDipilih],
        ['Dicetak pada', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
      ]
      infoRows.forEach(([label, value], idx) => {
        const r = 4 + idx
        ws[`A${r}`] = { v: label, s: boldLeft }
        ws[`B${r}`] = { v: `: ${value}`, s: normalLeft }
        ws['!merges']!.push({ s: { r: r - 1, c: 1 }, e: { r: r - 1, c: 11 } })
      })

      // ── Baris 10: Header kolom ─────────────────────────────────
      const headers = ['No','Tanggal','Waktu','Nama Siswa','NIUP','Kelas','Pelanggaran','Tingkat','Poin','Lokasi','Keterangan','Dicatat Oleh']
      const headerRow = 9
      headers.forEach((h, ci) => {
        ws[`${cols[ci]}${headerRow}`] = {
          v: h, s: { ...boldCenter, fill: headerFill, border },
        }
      })

      // ── Baris data ─────────────────────────────────────────────
      data.forEach((p, i) => {
        const r = headerRow + 1 + i
        const row = [
          i + 1,
          formatDatePdf(p.tanggal),
          p.waktu || '-',
          p.siswa.nama,
          p.siswa.niup,
          p.siswa.kelas?.namaKelas || '-',
          p.kategoriPelanggaran.nama,
          tingkatLabel[p.kategoriPelanggaran.tingkat] || p.kategoriPelanggaran.tingkat,
          p.poin,
          p.lokasi || '-',
          p.keterangan || '-',
          p.dicatatOleh.name,
        ]
        row.forEach((val, ci) => {
          ws[`${cols[ci]}${r}`] = {
            v: val,
            s: { ...(ci === 0 || ci === 2 || ci === 8 ? normalCenter : normalLeft), border },
          }
        })
      })

      // Range sheet
      const lastRow = headerRow + data.length
      ws['!ref'] = `A1:${cols[11]}${lastRow}`
      ws['!cols'] = [
        { wch: 4 }, { wch: 13 }, { wch: 8 }, { wch: 25 }, { wch: 14 }, { wch: 20 },
        { wch: 30 }, { wch: 12 }, { wch: 6 }, { wch: 20 }, { wch: 30 }, { wch: 25 },
      ]
      ws['!rows'] = [{ hpx: 20 }, { hpx: 18 }, { hpx: 15 }]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pelanggaran')
      XLSX.writeFile(wb, namaFile)
    })
  }

  // ──────────────────────────────────────────────────────────────
  // EXPORT PDF — Dokumen Administrasi Sekolah A4
  // ──────────────────────────────────────────────────────────────
  async function exportPdf() {
    const { jsPDF } = await import('jspdf')
    const { autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = 210
    const marginL = 15
    const marginR = 15

    // Warna
    const COLOR_DARK  = [30, 30, 30] as [number, number, number]
    const COLOR_GRAY  = [120, 120, 120] as [number, number, number]
    const COLOR_LGRAY = [200, 200, 200] as [number, number, number]
    const COLOR_HGRAY = [240, 240, 240] as [number, number, number]

    // Logo
    const logoBase64 = await getLogoBase64()

    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', marginL, 5.5, 22.2, 24.5)
      } catch {
        // gagal load logo — lanjut tanpa logo
      }
    }

    // ── Judul & Identitas Sekolah ─────────────────────────────
    const centerX = pageW / 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...COLOR_DARK)
    doc.text('LAPORAN PELANGGARAN SISWA', centerX, 14, { align: 'center' })

    doc.setFontSize(13)
    doc.text('MA NURUL JADID', centerX, 21, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_GRAY)
    doc.text('PAITON - PROBOLINGGO', centerX, 27, { align: 'center' })

    // ── Garis Pembatas Header ─────────────────────────────────
    const lineY = 32
    doc.setDrawColor(...COLOR_DARK)
    doc.setLineWidth(0.5)
    doc.line(marginL, lineY, pageW - marginR, lineY)
    // Garis kedua tipis
    doc.setDrawColor(...COLOR_LGRAY)
    doc.setLineWidth(0.2)
    doc.line(marginL, lineY + 0.8, pageW - marginR, lineY + 0.8)

    // ── Info Laporan ──────────────────────────────────────────
    let infoY = lineY + 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...COLOR_DARK)

    const kelasDipilih = kelasList.find((k: any) => k.id === filterParams.kelasId)
    const tingkatDipilih = filterParams.tingkat
      ? (tingkatLabel[filterParams.tingkat] || filterParams.tingkat)
      : 'Semua Tingkat'
    const namaKelasLabel = kelasDipilih ? kelasDipilih.namaKelas : 'Semua Kelas'

    const periodeStart = filterParams.startDate
      ? new Date(filterParams.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : '-'
    const periodeEnd = filterParams.endDate
      ? new Date(filterParams.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : '-'
    const periodeLabel = filterParams.startDate || filterParams.endDate
      ? `${periodeStart} - ${periodeEnd}`
      : 'Semua Periode'

    const infoItems = [
      { label: 'Periode', value: periodeLabel },
      { label: 'Kelas', value: namaKelasLabel },
      { label: 'Tingkat', value: tingkatDipilih },
      { label: 'Dicetak pada', value: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) },
    ]
    const labelW = 28
    for (const item of infoItems) {
      doc.setFont('helvetica', 'bold')
      doc.text(item.label, marginL, infoY)
      doc.setFont('helvetica', 'normal')
      doc.text(`: ${item.value}`, marginL + labelW, infoY)
      infoY += 5.5
    }

    // ── Tabel Pelanggaran ─────────────────────────────────────
    const tableStartY = infoY + 3

    const tableHead = [['No', 'Tanggal', 'Waktu', 'Nama Siswa', 'Kelas', 'Pelanggaran', 'Tingkat', 'Poin', 'Dicatat Oleh']]
    const tableBody = data.map((p, i) => [
      i + 1,
      formatDatePdf(p.tanggal),
      p.waktu || '-',
      p.siswa.nama,
      p.siswa.kelas?.namaKelas || '-',
      p.kategoriPelanggaran.nama,
      tingkatLabel[p.kategoriPelanggaran.tingkat] || p.kategoriPelanggaran.tingkat,
      p.poin,
      p.dicatatOleh.name,
    ])

    if (tableBody.length === 0) {
      // Tampilkan pesan kosong
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_GRAY)
      doc.text('Tidak ada data pelanggaran pada periode yang dipilih.', centerX, tableStartY + 10, { align: 'center' })
    } else {
      // jspdf-autotable v5: gunakan autoTable(doc, options) bukan doc.autoTable()
      autoTable(doc as any, {
        startY: tableStartY,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
          textColor: COLOR_DARK,
          lineColor: [180, 180, 180],
          lineWidth: 0.2,
          overflow: 'linebreak',
          valign: 'top',
        },
        headStyles: {
          fillColor: COLOR_HGRAY,
          textColor: COLOR_DARK,
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },       // No
          1: { halign: 'center', cellWidth: 22 },      // Tanggal
          2: { halign: 'center', cellWidth: 13 },      // Waktu
          3: { halign: 'left',   cellWidth: 32 },      // Nama Siswa
          4: { halign: 'center', cellWidth: 22 },      // Kelas
          5: { halign: 'left',   cellWidth: 'auto' },  // Pelanggaran
          6: { halign: 'center', cellWidth: 18 },      // Tingkat
          7: { halign: 'center', cellWidth: 10 },      // Poin
          8: { halign: 'left',   cellWidth: 28 },      // Dicatat Oleh
        },
        margin: { left: marginL, right: marginR },
        // Header tabel muncul ulang di setiap halaman baru
        didDrawPage: (hookData: any) => {
          // Pada halaman ke-2 dst, gambar ulang header identitas sekolah
          if (hookData.pageNumber > 1) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...COLOR_DARK)
            doc.text('LAPORAN PELANGGARAN SISWA — MA NURUL JADID (lanjutan)', centerX, 10, { align: 'center' })
            doc.setDrawColor(...COLOR_DARK)
            doc.setLineWidth(0.3)
            doc.line(marginL, 13, pageW - marginR, 13)
          }
        },
      })
    }

    // ── TTD (jika diaktifkan) ─────────────────────────────────
    if (signatoryInfo.showTtdLaporan && (signatoryInfo.kepalaSekolahNama || signatoryInfo.stafKesiswaanNama)) {
      const finalY: number = (doc as any).lastAutoTable?.finalY ?? tableStartY + 20
      const ttdY = finalY + 12
      const tanggalTtd = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

      // Kolom kiri: Staf Kesiswaan
      const colLeft = marginL + 10
      // Kolom kanan: Kepala Sekolah
      const colRight = pageW - marginR - 55

      doc.setFontSize(9.5)
      doc.setTextColor(...COLOR_DARK)

      // Staf Kesiswaan
      if (signatoryInfo.stafKesiswaanNama) {
        doc.setFont('helvetica', 'normal')
        doc.text('Mengetahui,', colLeft, ttdY)
        doc.text('Staf Kesiswaan', colLeft, ttdY + 5)
        doc.setFont('helvetica', 'bold')
        doc.text(signatoryInfo.stafKesiswaanNama, colLeft, ttdY + 30)
        if (signatoryInfo.stafKesiswaanNip) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.5)
          doc.text('NIP. ' + signatoryInfo.stafKesiswaanNip, colLeft, ttdY + 35)
        }
        // Garis TTD staf
        doc.setDrawColor(...COLOR_DARK)
        doc.setLineWidth(0.3)
        doc.line(colLeft, ttdY + 28, colLeft + 55, ttdY + 28)
      }

      // Kepala Sekolah
      if (signatoryInfo.kepalaSekolahNama) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.text('Paiton, ' + tanggalTtd, colRight, ttdY)
        doc.text('Kepala Madrasah,', colRight, ttdY + 5)
        doc.setFont('helvetica', 'bold')
        doc.text(signatoryInfo.kepalaSekolahNama, colRight, ttdY + 30)
        if (signatoryInfo.kepalaSekolahNip) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.5)
          doc.text('NIP. ' + signatoryInfo.kepalaSekolahNip, colRight, ttdY + 35)
        }
        // Garis TTD kepala
        doc.setDrawColor(...COLOR_DARK)
        doc.setLineWidth(0.3)
        doc.line(colRight, ttdY + 28, colRight + 60, ttdY + 28)
      }
    }

    // ── Simpan PDF ────────────────────────────────────────────
    const kelasDipilihNama = kelasDipilih ? kelasDipilih.namaKelas.replace(/\s+/g, '_') : ''
    const periodeFile = formatPeriodeLabel(filterParams.startDate, filterParams.endDate).replace(/\s+/g, '_')
    const namaFile = kelasDipilihNama
      ? `Laporan_Pelanggaran_${kelasDipilihNama}_${periodeFile}.pdf`
      : `Laporan_Pelanggaran_${periodeFile}.pdf`

    doc.save(namaFile)
  }

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="bg-[#101E31] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#8FA4BD]">
          <Filter size={15} className="text-gold-400" />
          Filter Laporan
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#64748B] uppercase tracking-wide">Tanggal Mulai</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#64748B] uppercase tracking-wide">Tanggal Akhir</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm h-9"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#64748B] uppercase tracking-wide">Kelas</label>
            <Select value={kelasId || 'semua'} onValueChange={(v) => setKelasId(v === 'semua' ? '' : v)}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kelas</SelectItem>
                {kelasList.map((k: any) => (
                  <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#64748B] uppercase tracking-wide">Tingkat</label>
            <Select value={tingkat || 'semua'} onValueChange={(v) => setTingkat(v === 'semua' ? '' : v)}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue placeholder="Semua Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tingkat</SelectItem>
                <SelectItem value="RINGAN">Ringan</SelectItem>
                <SelectItem value="SEDANG">Sedang</SelectItem>
                <SelectItem value="BERAT">Berat</SelectItem>
                <SelectItem value="SANGAT_BERAT">Sangat Berat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={applyFilter}
            disabled={isPending}
            className="bg-gold-500 hover:bg-gold-600 text-white text-xs h-8 px-4"
          >
            <Search size={13} className="mr-1" />
            {isPending ? 'Memuat...' : 'Terapkan Filter'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilter}
            disabled={isPending}
            className="border-[rgba(255,255,255,0.1)] text-[#8FA4BD] hover:bg-[rgba(255,255,255,0.04)] text-xs h-8"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <AlertTriangle size={16} className="text-gold-400" />
          <span>Total <strong className="text-[var(--text-primary)]">{total}</strong> pelanggaran ditemukan</span>
        </div>
        <ExportButtons onExportExcel={exportExcel} onExportPdf={exportPdf} disabled={data.length === 0} />
      </div>

      {/* Tabel */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th style={{ width: '8.5rem' }}>Tanggal</th>
                <th style={{ width: '5.5rem' }}>Waktu</th>
                <th>Nama Siswa</th>
                <th style={{ width: '8rem' }}>Kelas</th>
                <th>Pelanggaran</th>
                <th style={{ width: '8rem' }}>Tingkat</th>
                <th style={{ width: '5rem' }} className="td-center">Poin</th>
                <th style={{ width: '10rem' }}>Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#64748B]">
                    Tidak ada data pelanggaran pada periode yang dipilih
                  </td>
                </tr>
              ) : (
                data.map((p, i) => (
                  <tr key={p.id}>
                    <td className="td-mono">{(page - 1) * limit + i + 1}</td>
                    <td className="whitespace-nowrap text-[#8FA4BD] text-[12px]">{formatDate(p.tanggal)}</td>
                    <td className="td-mono text-[12px] text-[#8FA4BD]">{p.waktu}</td>
                    <td className="td-primary font-medium">{p.siswa.nama}</td>
                    <td className="td-muted">{p.siswa.kelas?.namaKelas || '-'}</td>
                    <td className="text-[13px] text-[#C5D3E3]">{p.kategoriPelanggaran.nama}</td>
                    <td>
                      <Badge variant={tingkatVariant[p.kategoriPelanggaran.tingkat]}>
                        {tingkatLabel[p.kategoriPelanggaran.tingkat]}
                      </Badge>
                    </td>
                    <td className="td-center font-bold text-[#D9A62E]">{p.poin}</td>
                    <td className="td-muted text-[12px]">{p.dicatatOleh.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-info-bar">
          <span className="table-info-text">
            Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total} pelanggaran
          </span>
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(page - 1))
                router.push(`/laporan/pelanggaran?${p.toString()}`)
              }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2
              if (pg < 1 || pg > totalPages) return null
              return (
                <button
                  key={pg}
                  className={`pagination-btn ${pg === page ? 'active' : ''}`}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams)
                    p.set('page', String(pg))
                    router.push(`/laporan/pelanggaran?${p.toString()}`)
                  }}
                >
                  {pg}
                </button>
              )
            })}
            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(page + 1))
                router.push(`/laporan/pelanggaran?${p.toString()}`)
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
