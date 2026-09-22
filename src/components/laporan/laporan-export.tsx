"use client"

import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportPdf: () => void
  disabled?: boolean
}

export function ExportButtons({ onExportExcel, onExportPdf, disabled }: ExportButtonsProps) {
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  async function handleExcel() {
    setLoadingExcel(true)
    try {
      onExportExcel()
    } catch {
      toast.error('Gagal mengekspor Excel')
    } finally {
      setLoadingExcel(false)
    }
  }

  async function handlePdf() {
    setLoadingPdf(true)
    try {
      onExportPdf()
    } catch {
      toast.error('Gagal mengekspor PDF')
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExcel}
        disabled={disabled || loadingExcel}
        className="border-green-600/40 text-green-400 hover:bg-green-600/10"
      >
        {loadingExcel ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={16} />
        )}
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePdf}
        disabled={disabled || loadingPdf}
        className="border-red-600/40 text-red-400 hover:bg-red-600/10"
      >
        {loadingPdf ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        PDF
      </Button>
    </div>
  )
}
