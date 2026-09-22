import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

/**
 * Consistent page header used across ALL CRUD pages.
 * Provides uniform title size, description, and optional action slot.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-5 border-b border-[var(--border-subtle)]">
      <div>
        <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  )
}
