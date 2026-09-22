import React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Proper empty state for all data tables.
 * Replaces plain "Tidak ada data" colspan text.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-14 px-6 text-center gap-3',
      className
    )}>
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] mb-1">
        {icon}
      </div>
      <div>
        <p className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-1 max-w-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
