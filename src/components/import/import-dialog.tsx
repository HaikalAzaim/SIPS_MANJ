"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet, Download, Upload, X, CheckCircle2, XCircle, AlertTriangle, Loader2, FileUp, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  validateSiswaImport,
  validateGuruImport,
  importSiswaBatch,
  importGuruBatch,
  type ImportRowResult,
  type ImportValidationResult,
} from '@/actions/import'

// ── Types ─────────────────────────────────────────────────────────
type ImportType = 'siswa' | 'guru'
type FilterTab = 'all' | 'valid' | 'error'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: ImportType
  onImportSuccess: () => void
}

const SISWA_HEADERS = ['NISN', 'NIUP', 'Nama Lengkap', 'Jenis Kelamin', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Tahun Masuk']
const GURU_HEADERS  = ['NIUP', 'Nama Lengkap', 'Jenis Kelamin', 'Email', 'Nomor HP', 'Status']

// ── Component ─────────────────────────────────────────────────────
export function ImportDialog({ open, onOpenChange, type, onImportSuccess }: ImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const headers = type === 'siswa' ? SISWA_HEADERS : GURU_HEADERS
  const templateUrl = type === 'siswa' ? '/api/import/template/siswa' : '/api/import/template/guru'
  const label = type === 'siswa' ? 'Siswa' : 'Guru'

  // ── Reset state ──
  const resetState = useCallback(() => {
    setStep('upload')
    setDragOver(false)
    setUploading(false)
    setImporting(false)
    setValidationResult(null)
    setFilterTab('all')
    setFileName('')
  }, [])

  function handleOpenChange(open: boolean) {
    if (!open) resetState()
    onOpenChange(open)
  }

  // ── Download Template ──
  async function handleDownloadTemplate() {
    try {
      const response = await fetch(templateUrl)
      if (!response.ok) throw new Error('Gagal mengunduh template')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_import_${type}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Template berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh template')
    }
  }

  // ── Parse Excel File ──
  async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
    const XLSX = await import('xlsx')
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: false, raw: false })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!firstSheet) return []

    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

    // Filter out example rows (containing "Contoh" in the name column)
    const nameKey = 'Nama Lengkap'
    const filtered = jsonData.filter(row => {
      const nameVal = String(row[nameKey] ?? '')
      return !nameVal.toLowerCase().includes('(contoh)')
    })

    // Serialize to plain objects (strip xlsx prototypes) for server action compatibility
    return JSON.parse(JSON.stringify(filtered)) as Record<string, any>[]
  }

  // ── Handle File Upload ──
  async function handleFile(file: File) {
    if (!file) return

    const validExtensions = ['.xlsx', '.xls']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!validExtensions.includes(ext)) {
      toast.error('Format file tidak didukung. Gunakan .xlsx atau .xls')
      return
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const rows = await parseExcelFile(file)

      if (rows.length === 0) {
        toast.error('File tidak memiliki data. Pastikan data diisi pada sheet pertama.')
        setUploading(false)
        return
      }

      // Verify headers
      const fileHeaders = Object.keys(rows[0])
      const missingHeaders = headers.filter(h => !fileHeaders.includes(h))
      if (missingHeaders.length > 0) {
        toast.error(`Kolom tidak ditemukan: ${missingHeaders.join(', ')}. Gunakan template resmi SIPS.`)
        setUploading(false)
        return
      }

      // Validate
      let result: ImportValidationResult
      if (type === 'siswa') {
        result = await validateSiswaImport(rows)
      } else {
        result = await validateGuruImport(rows)
      }

      setValidationResult(result)
      setStep('preview')
    } catch (err: any) {
      console.error('Parse error:', err)
      toast.error('Gagal membaca file Excel. Pastikan file tidak rusak.')
    }

    setUploading(false)
  }

  // ── Drag & Drop ──
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragOver(true) }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setDragOver(false) }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  // ── Execute Import ──
  async function handleImport() {
    if (!validationResult) return
    setImporting(true)

    try {
      const validRows = validationResult.rows.filter(r => r.valid)
      let result: { success: boolean; imported: number; error?: string }

      if (type === 'siswa') {
        result = await importSiswaBatch(validRows)
      } else {
        result = await importGuruBatch(validRows)
      }

      if (result.success) {
        toast.success(`${result.imported} data ${label.toLowerCase()} berhasil diimport`)
        handleOpenChange(false)
        onImportSuccess()
      } else {
        toast.error(result.error || 'Gagal mengimport data')
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengimport data')
    }

    setImporting(false)
  }

  // ── Filtered Rows ──
  const filteredRows = validationResult?.rows.filter(r => {
    if (filterTab === 'valid') return r.valid
    if (filterTab === 'error') return !r.valid
    return true
  }) ?? []

  // ── Render ──
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${step === 'preview' ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-[#D9A62E]" />
            Import Data {label}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload'
              ? `Upload file Excel untuk menambahkan data ${label.toLowerCase()} secara massal.`
              : `Preview dan validasi data sebelum diimport ke database.`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 pt-1">
            {/* Download Template Button */}
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="import-template-btn"
            >
              <div className="import-template-btn-icon">
                <Download size={16} />
              </div>
              <div className="import-template-btn-text">
                <span className="import-template-btn-title">Download Template Excel</span>
                <span className="import-template-btn-desc">template_import_{type}.xlsx — Format siap isi</span>
              </div>
            </button>

            {/* Dropzone */}
            <div
              className={`import-dropzone ${dragOver ? 'import-dropzone-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
              {uploading ? (
                <div className="import-dropzone-content">
                  <Loader2 size={28} className="animate-spin text-[#D9A62E]" />
                  <p className="import-dropzone-title">Membaca file...</p>
                  <p className="import-dropzone-hint">{fileName}</p>
                </div>
              ) : (
                <div className="import-dropzone-content">
                  <div className="import-dropzone-icon">
                    <FileUp size={24} />
                  </div>
                  <p className="import-dropzone-title">Tarik file ke sini atau klik untuk upload</p>
                  <p className="import-dropzone-hint">Format: .xlsx / .xls</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'preview' && validationResult && (
          <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-hidden pt-1">
            {/* Summary Bar */}
            <div className="import-summary-bar">
              <div className="import-summary-item">
                <FileSpreadsheet size={14} />
                <span>{validationResult.totalRows} baris data</span>
              </div>
              <div className="import-summary-item import-summary-valid">
                <CheckCircle2 size={14} />
                <span>{validationResult.validCount} valid</span>
              </div>
              {validationResult.errorCount > 0 && (
                <div className="import-summary-item import-summary-error">
                  <XCircle size={14} />
                  <span>{validationResult.errorCount} error</span>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="import-filter-tabs">
              <button
                className={`import-filter-tab ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                Semua ({validationResult.totalRows})
              </button>
              <button
                className={`import-filter-tab ${filterTab === 'valid' ? 'active' : ''}`}
                onClick={() => setFilterTab('valid')}
              >
                Valid ({validationResult.validCount})
              </button>
              {validationResult.errorCount > 0 && (
                <button
                  className={`import-filter-tab ${filterTab === 'error' ? 'active' : ''}`}
                  onClick={() => setFilterTab('error')}
                >
                  Error ({validationResult.errorCount})
                </button>
              )}
            </div>

            {/* Preview Table */}
            <div className="import-preview-table-wrap">
              <table className="import-preview-table">
                <thead>
                  <tr>
                    <th className="import-th-status">Status</th>
                    <th className="import-th-row">#</th>
                    {headers.map(h => (
                      <th key={h}>{h}</th>
                    ))}
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 3} className="import-preview-empty">
                        Tidak ada data untuk ditampilkan
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(row => (
                      <tr key={row.rowIndex} className={row.valid ? '' : 'import-row-error'}>
                        <td className="import-td-status">
                          {row.valid ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : (
                            <XCircle size={14} className="text-red-400" />
                          )}
                        </td>
                        <td className="import-td-row">{row.rowIndex}</td>
                        {headers.map(h => {
                          // Map display data back to readable format for preview
                          let displayVal = row.data[h] ?? ''
                          // Special handling for columns that were transformed
                          if (h === 'Jenis Kelamin') {
                            displayVal = row.data.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' :
                                         row.data.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' :
                                         row.data[h] ?? ''
                          } else if (h === 'Kelas' && type === 'siswa') {
                            displayVal = row.data.kelasNama ?? row.data[h] ?? ''
                          } else if (h === 'Status' && type === 'guru') {
                            displayVal = row.data.status === true ? 'Aktif' :
                                         row.data.status === false ? 'Nonaktif' : ''
                          } else if (h === 'NISN') displayVal = row.data.nisn ?? ''
                          else if (h === 'NIUP') displayVal = row.data.niup ?? ''
                          else if (h === 'Nama Lengkap') displayVal = row.data.nama ?? ''
                          else if (h === 'Tempat Lahir') displayVal = row.data.tempatLahir ?? ''
                          else if (h === 'Tanggal Lahir') displayVal = row.data.tanggalLahir ?? ''
                          else if (h === 'Alamat') displayVal = row.data.alamat ?? ''
                          else if (h === 'Tahun Masuk') displayVal = row.data.tahunMasuk ?? ''
                          else if (h === 'Email') displayVal = row.data.email ?? ''
                          else if (h === 'Nomor HP') displayVal = row.data.nomorHp ?? ''

                          return <td key={h} className="import-td-data">{String(displayVal)}</td>
                        })}
                        <td className="import-td-errors">
                          {row.errors.length > 0 ? (
                            <div className="import-error-list">
                              {row.errors.map((err, i) => (
                                <span key={i} className="import-error-chip">
                                  <AlertTriangle size={10} />
                                  {err}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-400/60 text-[11px]">Siap import</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="import-preview-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => { resetState() }}
                className="gap-1.5"
              >
                <ArrowLeft size={14} />
                Upload Ulang
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={importing || validationResult.validCount === 0}
                className="gap-1.5"
              >
                {importing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Import {validationResult.validCount} Data Valid
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
