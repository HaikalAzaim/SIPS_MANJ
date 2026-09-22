"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ExportButtons } from '@/components/laporan/laporan-export'
import Link from 'next/link'
import { getStatusFromPoin, formatDate } from '@/lib/utils'
import { Users, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'



interface LaporanSiswaClientProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  kelasList: any[]
  thresholds: any[]
  filterParams: { kelasId?: string; search?: string }
}

export function LaporanSiswaClient({ data, total, page, totalPages, limit, kelasList, thresholds, filterParams }: LaporanSiswaClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(filterParams.search || '')

  const filtered = data

  function exportExcel() {
    import('xlsx').then((XLSX) => {
      const boldCenter   = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } }
      const boldLeft     = { font: { bold: true }, alignment: { horizontal: 'left',   vertical: 'center' } }
      const normalLeft   = { alignment: { horizontal: 'left',   vertical: 'center', wrapText: true } }
      const normalCenter = { alignment: { horizontal: 'center', vertical: 'center' } }
      const border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      }
      const headerFill = { fgColor: { rgb: 'D9D9D9' }, patternType: 'solid' }

      const ws: any = {}
      const cols = ['A','B','C','D','E','F','G','H','I','J','K','L','M']

      // Header sekolah (baris 1-3)
      ws['A1'] = { v: 'LAPORAN REKAP PELANGGARAN SISWA', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } } }
      ws['A2'] = { v: 'MA NURUL JADID', s: { font: { bold: true, sz: 13 }, alignment: { horizontal: 'center' } } }
      ws['A3'] = { v: 'PAITON - PROBOLINGGO', s: { font: { sz: 10 }, alignment: { horizontal: 'center' } } }
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } },
      ]

      // Info (baris 5-6)
      const infoRows = [
        ['Jumlah Siswa', `${filtered.length} siswa`],
        ['Dicetak pada', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
      ]
      infoRows.forEach(([label, value], idx) => {
        const r = 5 + idx
        ws[`A${r}`] = { v: label,        s: boldLeft }
        ws[`B${r}`] = { v: `: ${value}`, s: normalLeft }
        ws['!merges']!.push({ s: { r: r - 1, c: 1 }, e: { r: r - 1, c: 12 } })
      })

      // Header kolom (baris 8)
      const headers = ['No','NISN','NIUP','Nama Siswa','Jenis Kelamin','Kelas','Ringan','Sedang','Berat','Sangat Berat','Total Pelanggaran','Total Poin','Status']
      const headerRow = 8
      headers.forEach((h, ci) => {
        ws[`${cols[ci]}${headerRow}`] = { v: h, s: { ...boldCenter, fill: headerFill, border } }
      })

      // Data
      filtered.forEach((s, i) => {
        const statusInfo = getStatusFromPoin(s.totalPoin, thresholds)
        const r = headerRow + 1 + i
        const row = [
          i + 1, s.nisn, s.niup, s.nama,
          s.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
          s.namaKelas,
          s.ringan || 0, s.sedang || 0, s.berat || 0, s.sangatBerat || 0,
          s.totalPelanggaran, s.totalPoin, statusInfo.status,
        ]
        row.forEach((val, ci) => {
          const isCenter = ci === 0 || (ci >= 6 && ci <= 11)
          ws[`${cols[ci]}${r}`] = { v: val, s: { ...(isCenter ? normalCenter : normalLeft), border } }
        })
      })

      const lastRow = headerRow + filtered.length
      ws['!ref']  = `A1:M${lastRow}`
      ws['!cols'] = [
        { wch: 4 }, { wch: 16 }, { wch: 12 }, { wch: 25 }, { wch: 14 }, { wch: 22 },
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 14 },
      ]
      ws['!rows'] = [{ hpx: 20 }, { hpx: 18 }, { hpx: 15 }]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Siswa')
      XLSX.writeFile(wb, `Laporan_Siswa_${new Date().toISOString().slice(0, 10)}.xlsx`)
    })
  }

  async function exportPdf() {
    const { jsPDF } = await import('jspdf')
    const { autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = 297
    const marginL = 15
    const marginR = 15

    // Warna
    const COLOR_DARK  = [30, 30, 30] as [number, number, number]
    const COLOR_GRAY  = [120, 120, 120] as [number, number, number]
    const COLOR_LGRAY = [200, 200, 200] as [number, number, number]
    const COLOR_HGRAY = [240, 240, 240] as [number, number, number]

    // Logo
    const logoBase64 = await (async () => {
      try {
        const res = await fetch('/logo-manj.png')
        if (!res.ok) return null
        const blob = await res.blob()
        return new Promise<string | null>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(blob)
        })
      } catch { return null }
    })()

    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', marginL, 5.5, 22.2, 24.5)
      } catch {
        /* lanjut tanpa logo */
      }
    }

    // Header Sekolah
    const centerX = pageW / 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...COLOR_DARK)
    doc.text('LAPORAN REKAP PELANGGARAN SISWA', centerX, 14, { align: 'center' })
    doc.setFontSize(13)
    doc.text('MA NURUL JADID', centerX, 21, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_GRAY)
    doc.text('PAITON - PROBOLINGGO', centerX, 27, { align: 'center' })

    // Garis pembatas
    const lineY = 32
    doc.setDrawColor(...COLOR_DARK)
    doc.setLineWidth(0.5)
    doc.line(marginL, lineY, pageW - marginR, lineY)
    doc.setDrawColor(...COLOR_LGRAY)
    doc.setLineWidth(0.2)
    doc.line(marginL, lineY + 0.8, pageW - marginR, lineY + 0.8)

    // Info
    let infoY = lineY + 7
    const labelW = 28
    const infoItems = [
      { label: 'Jumlah Siswa', value: `${filtered.length} siswa` },
      { label: 'Dicetak pada', value: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) },
    ]
    for (const item of infoItems) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(...COLOR_DARK)
      doc.text(item.label, marginL, infoY)
      doc.setFont('helvetica', 'normal')
      doc.text(`: ${item.value}`, marginL + labelW, infoY)
      infoY += 5.5
    }

    // Tabel
    const tableStartY = infoY + 3
    if (filtered.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_GRAY)
      doc.text('Tidak ada data siswa.', centerX, tableStartY + 10, { align: 'center' })
    } else {
      autoTable(doc as any, {
        startY: tableStartY,
        head: [['No', 'NISN', 'Nama Siswa', 'L/P', 'Kelas', 'Ringan', 'Sedang', 'Berat', 'Sgt Berat', 'Total', 'Poin', 'Status']],
        body: filtered.map((s, i) => {
          const statusInfo = getStatusFromPoin(s.totalPoin, thresholds)
          return [
            i + 1, s.nisn, s.nama,
            s.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P',
            s.namaKelas,
            s.ringan || 0, s.sedang || 0, s.berat || 0, s.sangatBerat || 0,
            s.totalPelanggaran, s.totalPoin, statusInfo.status,
          ]
        }),
        theme: 'grid',
        styles: {
          font: 'helvetica', fontSize: 8,
          cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
          textColor: COLOR_DARK, lineColor: [180, 180, 180], lineWidth: 0.2,
          overflow: 'linebreak', valign: 'top',
        },
        headStyles: {
          fillColor: COLOR_HGRAY, textColor: COLOR_DARK,
          fontStyle: 'bold', fontSize: 8.5, halign: 'center',
        },
        columnStyles: {
          0:  { halign: 'center', cellWidth: 8 },
          1:  { halign: 'center', cellWidth: 28 },
          2:  { halign: 'left',   cellWidth: 'auto' },
          3:  { halign: 'center', cellWidth: 10 },
          4:  { halign: 'left',   cellWidth: 28 },
          5:  { halign: 'center', cellWidth: 14 },
          6:  { halign: 'center', cellWidth: 14 },
          7:  { halign: 'center', cellWidth: 14 },
          8:  { halign: 'center', cellWidth: 18 },
          9:  { halign: 'center', cellWidth: 14 },
          10: { halign: 'center', cellWidth: 14 },
          11: { halign: 'left',   cellWidth: 24 },
        },
        margin: { left: marginL, right: marginR },
        didDrawPage: (hookData: any) => {
          if (hookData.pageNumber > 1) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...COLOR_DARK)
            doc.text('LAPORAN REKAP PELANGGARAN SISWA — MA NURUL JADID (lanjutan)', centerX, 10, { align: 'center' })
            doc.setDrawColor(...COLOR_DARK)
            doc.setLineWidth(0.3)
            doc.line(marginL, 13, pageW - marginR, 13)
          }
        },
      })
    }

    doc.save(`Laporan_Siswa_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <form onSubmit={(e) => {
            e.preventDefault()
            const p = new URLSearchParams(searchParams)
            if (search) p.set('search', search)
            else p.delete('search')
            p.set('page', '1')
            router.push(`/laporan/siswa?${p.toString()}`)
          }} className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              type="text"
              placeholder="Cari nama / NISN / NIUP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-field"
            />
            {search && (
              <button type="button" onClick={() => {
                setSearch('')
                const p = new URLSearchParams(searchParams)
                p.delete('search')
                p.set('page', '1')
                router.push(`/laporan/siswa?${p.toString()}`)
              }} className="search-clear-btn"><X size={13} /></button>
            )}
          </form>
          <span className="text-sm text-[var(--text-secondary)]">
            <Users size={14} className="inline mr-1" />
            {total} siswa
          </span>
        </div>
        <ExportButtons onExportExcel={exportExcel} onExportPdf={exportPdf} disabled={filtered.length === 0} />
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th style={{ width: '8.5rem' }}>NISN</th>
                <th>Nama Siswa</th>
                <th style={{ width: '4.5rem' }} className="td-center">L/P</th>
                <th style={{ width: '7.5rem' }}>Kelas</th>
                <th style={{ width: '5rem' }} className="td-center">Ringan</th>
                <th style={{ width: '5rem' }} className="td-center">Sedang</th>
                <th style={{ width: '5rem' }} className="td-center">Berat</th>
                <th style={{ width: '6.5rem' }} className="td-center">Sgt Berat</th>
                <th style={{ width: '5.5rem' }} className="td-center">Total</th>
                <th style={{ width: '5.5rem' }} className="td-center">Poin</th>
                <th style={{ width: '8.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-[#64748B]">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const statusInfo = getStatusFromPoin(s.totalPoin, thresholds)
                  const variant =
                    statusInfo.status === 'Normal' ? 'normal' :
                    statusInfo.status === 'Perhatian' ? 'perhatian' :
                    statusInfo.status === 'Peringatan' ? 'peringatan' : 'teguran'
                  return (
                    <tr key={s.id}>
                      <td className="td-mono">{(page - 1) * limit + i + 1}</td>
                      <td className="td-mono text-[12px]">{s.nisn}</td>
                      <td>
                        <Link href={`/siswa/${s.id}`} className="td-primary font-medium hover:text-[#D9A62E] transition-colors">
                          {s.nama}
                        </Link>
                      </td>
                      <td className="td-center text-[var(--text-secondary)]">{s.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}</td>
                      <td className="td-muted">{s.namaKelas}</td>
                      <td className="td-center text-[#38bdf8] font-medium">{s.ringan || 0}</td>
                      <td className="td-center text-[#fbbf24] font-medium">{s.sedang || 0}</td>
                      <td className="td-center text-[#f87171] font-medium">{s.berat || 0}</td>
                      <td className="td-center text-[#ef4444] font-semibold">{s.sangatBerat || 0}</td>
                      <td className="td-center font-semibold text-[var(--text-primary)]">{s.totalPelanggaran}</td>
                      <td className="td-center font-bold text-[#D9A62E]">{s.totalPoin}</td>
                      <td>
                        <Badge variant={variant as any}>{statusInfo.status}</Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-info-bar">
          <span className="table-info-text">
            Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total} siswa
          </span>
          <div className="pagination">
            <button className="pagination-btn" disabled={page <= 1} onClick={() => {
              const p = new URLSearchParams(searchParams); p.set('page', String(page - 1))
              router.push(`/laporan/siswa?${p.toString()}`)
            }}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2
              if (pg < 1 || pg > totalPages) return null
              return (
                <button key={pg} className={`pagination-btn ${pg === page ? 'active' : ''}`} onClick={() => {
                  const p = new URLSearchParams(searchParams); p.set('page', String(pg))
                  router.push(`/laporan/siswa?${p.toString()}`)
                }}>{pg}</button>
              )
            })}
            <button className="pagination-btn" disabled={page >= totalPages} onClick={() => {
              const p = new URLSearchParams(searchParams); p.set('page', String(page + 1))
              router.push(`/laporan/siswa?${p.toString()}`)
            }}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
