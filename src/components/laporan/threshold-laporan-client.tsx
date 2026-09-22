"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportButtons } from '@/components/laporan/laporan-export'
import { getStatusFromPoin } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Users, FileWarning, ChevronLeft, ChevronRight } from 'lucide-react'

interface ThresholdLaporanClientProps {
  siswa: any[]
  thresholds: any[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export function ThresholdLaporanClient({ siswa, thresholds, total, page, totalPages, limit }: ThresholdLaporanClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterStatus, setFilterStatus] = useState('all')

  const grouped = siswa.reduce((acc: Record<string, any[]>, s) => {
    const statusInfo = getStatusFromPoin(s.totalPoin, thresholds)
    if (!acc[statusInfo.status]) acc[statusInfo.status] = []
    acc[statusInfo.status].push({ ...s, statusLabel: statusInfo.status, statusWarna: statusInfo.warna })
    return acc
  }, {})

  const nonNormalStatuses = Object.keys(grouped).filter((s) => s !== 'Normal')

  const filteredSiswa = filterStatus === 'all'
    ? siswa.filter((s) => {
        const si = getStatusFromPoin(s.totalPoin, thresholds)
        return si.status !== 'Normal'
      }).map((s) => {
        const si = getStatusFromPoin(s.totalPoin, thresholds)
        return { ...s, statusLabel: si.status, statusWarna: si.warna }
      })
    : (grouped[filterStatus] || [])

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
      const cols = ['A','B','C','D','E','F','G']

      // Header sekolah (baris 1-3)
      ws['A1'] = { v: 'LAPORAN SISWA MELEWATI THRESHOLD', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } } }
      ws['A2'] = { v: 'MA NURUL JADID', s: { font: { bold: true, sz: 13 }, alignment: { horizontal: 'center' } } }
      ws['A3'] = { v: 'PAITON - PROBOLINGGO', s: { font: { sz: 10 }, alignment: { horizontal: 'center' } } }
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      ]

      // Info (baris 5-7)
      const statusLabel = filterStatus === 'all' ? 'Semua Status (Non-Normal)' : filterStatus
      const infoRows = [
        ['Filter Status', statusLabel],
        ['Jumlah Siswa', `${filteredSiswa.length} siswa`],
        ['Dicetak pada', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
      ]
      infoRows.forEach(([label, value], idx) => {
        const r = 5 + idx
        ws[`A${r}`] = { v: label,        s: boldLeft }
        ws[`B${r}`] = { v: `: ${value}`, s: normalLeft }
        ws['!merges']!.push({ s: { r: r - 1, c: 1 }, e: { r: r - 1, c: 6 } })
      })

      // Header kolom (baris 9)
      const headers = ['No','NISN','Nama Siswa','Kelas','Total Pelanggaran','Total Poin','Status']
      const headerRow = 9
      headers.forEach((h, ci) => {
        ws[`${cols[ci]}${headerRow}`] = { v: h, s: { ...boldCenter, fill: headerFill, border } }
      })

      // Data
      filteredSiswa.forEach((s, i) => {
        const r = headerRow + 1 + i
        const row = [i + 1, s.nisn, s.nama, s.namaKelas, s.totalPelanggaran, s.totalPoin, s.statusLabel]
        row.forEach((val, ci) => {
          const isCenter = ci === 0 || ci === 4 || ci === 5
          ws[`${cols[ci]}${r}`] = { v: val, s: { ...(isCenter ? normalCenter : normalLeft), border } }
        })
      })

      const lastRow = headerRow + filteredSiswa.length
      ws['!ref']  = `A1:G${lastRow}`
      ws['!cols'] = [
        { wch: 4 }, { wch: 16 }, { wch: 28 }, { wch: 25 },
        { wch: 20 }, { wch: 12 }, { wch: 16 },
      ]
      ws['!rows'] = [{ hpx: 20 }, { hpx: 18 }, { hpx: 15 }]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Threshold Siswa')
      XLSX.writeFile(wb, `Laporan_Threshold_${new Date().toISOString().slice(0, 10)}.xlsx`)
    })
  }

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
    doc.text('LAPORAN SISWA MELEWATI THRESHOLD', centerX, 14, { align: 'center' })
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
    const statusLabel = filterStatus === 'all' ? 'Semua Status (Non-Normal)' : filterStatus
    const infoItems = [
      { label: 'Filter Status', value: statusLabel },
      { label: 'Jumlah Siswa', value: `${filteredSiswa.length} siswa` },
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
    if (filteredSiswa.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_GRAY)
      doc.text('Tidak ada siswa melewati threshold.', centerX, tableStartY + 10, { align: 'center' })
    } else {
      autoTable(doc as any, {
        startY: tableStartY,
        head: [['No', 'NISN', 'Nama Siswa', 'Kelas', 'Total Pelanggaran', 'Total Poin', 'Status']],
        body: filteredSiswa.map((s, i) => [
          i + 1, s.nisn, s.nama, s.namaKelas, s.totalPelanggaran, s.totalPoin, s.statusLabel,
        ]),
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
          0: { halign: 'center', cellWidth: 8 },
          1: { halign: 'center', cellWidth: 30 },
          2: { halign: 'left',   cellWidth: 'auto' },
          3: { halign: 'left',   cellWidth: 35 },
          4: { halign: 'center', cellWidth: 28 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'left',   cellWidth: 25 },
        },
        margin: { left: marginL, right: marginR },
        didDrawPage: (hookData: any) => {
          if (hookData.pageNumber > 1) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...COLOR_DARK)
            doc.text('LAPORAN SISWA MELEWATI THRESHOLD — MA NURUL JADID (lanjutan)', centerX, 10, { align: 'center' })
            doc.setDrawColor(...COLOR_DARK)
            doc.setLineWidth(0.3)
            doc.line(marginL, 13, pageW - marginR, 13)
          }
        },
      })
    }

    doc.save(`Laporan_Threshold_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {nonNormalStatuses.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {thresholds.filter((t) => t.namaStatus !== 'Normal').map((t) => {
            const count = (grouped[t.namaStatus] || []).length
            return (
              <div key={t.id} className="stat-card card-gradient" style={{ borderTop: `3px solid ${t.warna}` }}>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{count}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{t.namaStatus}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="border-green-600/20 bg-green-950/10">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-green-400 font-semibold">Semua siswa dalam kondisi aman</p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Tidak ada siswa yang melewati batas threshold</p>
          </CardContent>
        </Card>
      )}

      {/* Filter & Table */}
      {filteredSiswa.length > 0 || filterStatus !== 'all' ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Select onValueChange={setFilterStatus} defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status (Non-Normal)</SelectItem>
                  {thresholds.filter((t) => t.namaStatus !== 'Normal').map((t) => (
                    <SelectItem key={t.id} value={t.namaStatus}>{t.namaStatus}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-[var(--text-secondary)]">
                <Users size={14} className="inline mr-1" />
                {filteredSiswa.length} siswa
              </span>
            </div>
            <ExportButtons onExportExcel={exportExcel} onExportPdf={exportPdf} disabled={filteredSiswa.length === 0} />
          </div>

          <div className="table-wrapper">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '3.5rem' }}>No</th>
                    <th style={{ width: '8.5rem' }}>NISN</th>
                    <th>Nama Siswa</th>
                    <th style={{ width: '8rem' }}>Kelas</th>
                    <th style={{ width: '8.5rem' }} className="td-center">Pelanggaran</th>
                    <th style={{ width: '6.5rem' }} className="td-center">Total Poin</th>
                    <th style={{ width: '9rem' }}>Status</th>
                    <th className="td-actions">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswa.map((s, i) => (
                    <tr key={s.id}>
                      <td className="td-mono">{(page - 1) * limit + i + 1}</td>
                      <td className="td-mono text-[12px]">{s.nisn}</td>
                      <td className="td-primary font-medium">{s.nama}</td>
                      <td className="td-muted">{s.namaKelas}</td>
                      <td className="td-center font-medium text-[var(--text-primary)]">{s.totalPelanggaran}</td>
                      <td className="td-center font-bold text-[#D9A62E]">{s.totalPoin}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: `${s.statusWarna}22`, color: s.statusWarna, border: `1px solid ${s.statusWarna}44` }}
                        >
                          {s.statusLabel}
                        </span>
                      </td>
                      <td className="td-actions">
                        <Link href={`/siswa/${s.id}`} className="text-xs text-[#D9A62E] hover:underline">
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-info-bar">
          <span className="table-info-text">
            Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total} siswa
          </span>
          <div className="pagination">
            <button className="pagination-btn" disabled={page <= 1} onClick={() => {
              const p = new URLSearchParams(searchParams); p.set('page', String(page - 1))
              router.push(`/laporan/threshold?${p.toString()}`)
            }}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2
              if (pg < 1 || pg > totalPages) return null
              return (
                <button key={pg} className={`pagination-btn ${pg === page ? 'active' : ''}`} onClick={() => {
                  const p = new URLSearchParams(searchParams); p.set('page', String(pg))
                  router.push(`/laporan/threshold?${p.toString()}`)
                }}>{pg}</button>
              )
            })}
            <button className="pagination-btn" disabled={page >= totalPages} onClick={() => {
              const p = new URLSearchParams(searchParams); p.set('page', String(page + 1))
              router.push(`/laporan/threshold?${p.toString()}`)
            }}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
