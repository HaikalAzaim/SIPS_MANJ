"use client"

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  /** Label for the data type, e.g. "siswa", "pelanggaran" */
  noun?: string
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  /** Available page size options */
  limitOptions?: number[]
}

/**
 * Universal server-side pagination footer for all SIPS data tables.
 * Uses existing CSS classes: .table-info-bar, .table-info-text, .pagination, .pagination-btn
 */
export function DataTablePagination({
  page,
  totalPages,
  total,
  limit,
  noun = 'data',
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
}: DataTablePaginationProps) {
  // Don't render if only 1 page and total fits in limit
  if (totalPages <= 1 && total <= limit) return null

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  // Generate page numbers with ellipsis
  function getPageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Always show first page
      pages.push(1)

      if (page > 3) pages.push('...')

      // Pages around current
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)

      if (page < totalPages - 2) pages.push('...')

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="table-info-bar">
      <div className="flex items-center gap-3">
        <span className="table-info-text">
          Menampilkan {startItem}–{endItem} dari {total} {noun}
        </span>
        {onLimitChange && (
          <Select
            value={String(limit)}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-[70px] text-[11px] bg-transparent border-[var(--border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="pagination-btn"
              style={{ cursor: 'default', color: 'var(--text-muted)' }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              className={`pagination-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
