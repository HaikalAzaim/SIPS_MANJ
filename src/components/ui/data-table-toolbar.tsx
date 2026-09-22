import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTableToolbarProps {
  /** Left side: search input */
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (e: React.FormEvent) => void

  /** Left side: filter slots */
  filters?: React.ReactNode

  /** Right side: action button (e.g. Tambah Siswa) */
  action?: React.ReactNode

  className?: string
}

/**
 * Reusable toolbar for all CRUD data tables.
 * Layout: [ 🔍 Search ] [ Filter... ] ─────── [ + Action ]
 */
export function DataTableToolbar({
  searchValue,
  searchPlaceholder = 'Cari...',
  onSearchChange,
  onSearchSubmit,
  filters,
  action,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2.5 mb-4', className)}>
      {/* Left: Search + Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {/* Search */}
        {onSearchChange !== undefined && (
          <form
            onSubmit={onSearchSubmit ?? ((e) => e.preventDefault())}
            className="relative min-w-[180px] max-w-[280px] flex-1"
          >
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-8 pr-3 rounded-[8px] text-[13px] outline-none focus:ring-2 transition-all duration-150"
              style={{
                background: 'var(--input)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </form>
        )}

        {/* Filter slots */}
        {filters}
      </div>

      {/* Right: Action */}
      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  )
}
