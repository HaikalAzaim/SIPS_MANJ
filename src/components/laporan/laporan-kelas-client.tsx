"use client"

import { ExportButtons } from '@/components/laporan/laporan-export'
import { School } from 'lucide-react'

interface LaporanKelasClientProps {
  data: any[]
}

export function LaporanKelasClient({ data }: LaporanKelasClientProps) {
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
      const cols = ['A','B','C','D','E','F','G','H','I']

      // Header sekolah (baris 1-3)
      ws['A1'] = { v: 'LAPORAN REKAP PELANGGARAN PER KELAS', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } } }
      ws['A2'] = { v: 'MA NURUL JADID', s: { font: { bold: true, sz: 13 }, alignment: { horizontal: 'center' } } }
      ws['A3'] = { v: 'PAITON - PROBOLINGGO', s: { font: { sz: 10 }, alignment: { horizontal: 'center' } } }
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      ]

      // Info (baris 5-6)
      const infoRows = [
        ['Jumlah Kelas', `${data.length} kelas`],
        ['Dicetak pada', new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })],
      ]
      infoRows.forEach(([label, value], idx) => {
        const r = 5 + idx
        ws[`A${r}`] = { v: label,         s: boldLeft }
        ws[`B${r}`] = { v: `: ${value}`,  s: normalLeft }
        ws['!merges']!.push({ s: { r: r - 1, c: 1 }, e: { r: r - 1, c: 8 } })
      })

      // Header kolom (baris 8)
      const headers = ['No','Nama Kelas','Tingkat','Jurusan','Wali Kelas','Jml Siswa','Total Pelanggaran','Total Poin','Rata-rata Poin']
      const headerRow = 8
      headers.forEach((h, ci) => {
        ws[`${cols[ci]}${headerRow}`] = { v: h, s: { ...boldCenter, fill: headerFill, border } }
      })

      // Data
      data.forEach((k, i) => {
        const r = headerRow + 1 + i
        const row = [i + 1, k.namaKelas, k.tingkat, k.jurusan || '-', k.waliKelas,
                     k.jumlahSiswa, k.totalPelanggaran, k.totalPoin, k.rataRataPoin]
        row.forEach((val, ci) => {
          ws[`${cols[ci]}${r}`] = {
            v: val,
            s: { ...(ci === 0 || ci >= 5 ? normalCenter : normalLeft), border },
          }
        })
      })

      const lastRow = headerRow + data.length
      ws['!ref']  = `A1:I${lastRow}`
      ws['!cols'] = [
        { wch: 4 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 25 },
        { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
      ]
      ws['!rows'] = [{ hpx: 20 }, { hpx: 18 }, { hpx: 15 }]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kelas')
      XLSX.writeFile(wb, `Laporan_Kelas_${new Date().toISOString().slice(0, 10)}.xlsx`)
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
    doc.text('LAPORAN REKAP PELANGGARAN PER KELAS', centerX, 14, { align: 'center' })
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
      { label: 'Jumlah Kelas', value: `${data.length} kelas` },
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
    if (data.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(...COLOR_GRAY)
      doc.text('Tidak ada data kelas.', centerX, tableStartY + 10, { align: 'center' })
    } else {
      autoTable(doc as any, {
        startY: tableStartY,
        head: [['No', 'Nama Kelas', 'Tingkat', 'Jurusan', 'Wali Kelas', 'Jml Siswa', 'Total Pelanggaran', 'Total Poin', 'Rata-rata Poin']],
        body: data.map((k, i) => [
          i + 1, k.namaKelas, k.tingkat, k.jurusan || '-', k.waliKelas,
          k.jumlahSiswa, k.totalPelanggaran, k.totalPoin, k.rataRataPoin,
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
          1: { halign: 'left',   cellWidth: 'auto' },
          2: { halign: 'center', cellWidth: 18 },
          3: { halign: 'left',   cellWidth: 32 },
          4: { halign: 'left',   cellWidth: 40 },
          5: { halign: 'center', cellWidth: 18 },
          6: { halign: 'center', cellWidth: 28 },
          7: { halign: 'center', cellWidth: 22 },
          8: { halign: 'center', cellWidth: 26 },
        },
        margin: { left: marginL, right: marginR },
        didDrawPage: (hookData: any) => {
          if (hookData.pageNumber > 1) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...COLOR_DARK)
            doc.text('LAPORAN REKAP PELANGGARAN PER KELAS — MA NURUL JADID (lanjutan)', centerX, 10, { align: 'center' })
            doc.setDrawColor(...COLOR_DARK)
            doc.setLineWidth(0.3)
            doc.line(marginL, 13, pageW - marginR, 13)
          }
        },
      })
    }

    doc.save(`Laporan_Kelas_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <School size={16} className="text-gold-400" />
          <span><strong className="text-[var(--text-primary)]">{data.length}</strong> kelas</span>
        </div>
        <ExportButtons onExportExcel={exportExcel} onExportPdf={exportPdf} disabled={data.length === 0} />
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th>Nama Kelas</th>
                <th style={{ width: '7rem' }}>Tingkat</th>
                <th style={{ width: '10rem' }}>Jurusan</th>
                <th style={{ width: '12rem' }}>Wali Kelas</th>
                <th style={{ width: '6.5rem' }} className="td-center">Jml Siswa</th>
                <th style={{ width: '8.5rem' }} className="td-center">Pelanggaran</th>
                <th style={{ width: '6.5rem' }} className="td-center">Total Poin</th>
                <th style={{ width: '7.5rem' }} className="td-center">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#64748B]">Belum ada data kelas</td>
                </tr>
              ) : (
                data.map((k, i) => (
                  <tr key={k.id}>
                    <td className="td-mono">{i + 1}</td>
                    <td className="td-primary font-medium">{k.namaKelas}</td>
                    <td className="td-muted">{k.tingkat}</td>
                    <td className="td-muted">{k.jurusan || '-'}</td>
                    <td className="text-[var(--text-muted)] text-[13px]">{k.waliKelas}</td>
                    <td className="td-center font-medium text-[var(--text-primary)]">{k.jumlahSiswa}</td>
                    <td className="td-center text-[#f87171] font-semibold">{k.totalPelanggaran}</td>
                    <td className="td-center text-[#D9A62E] font-bold">{k.totalPoin}</td>
                    <td className="td-center td-mono text-[var(--text-muted)]">{k.rataRataPoin}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
