import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatCardColorVariant = 'amber' | 'blue' | 'green' | 'purple' | 'rose'

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  colorVariant?: StatCardColorVariant
  sub?: string
  trend?: {
    label: string
    dir: 'up' | 'down' | 'flat'
  }
  className?: string
}

function TrendBadge({ value, dir }: { value: string; dir: 'up' | 'down' | 'flat' }) {
  if (value === '—') return null
  const color = dir === 'up' ? '#f87171' : dir === 'down' ? '#4ade80' : 'var(--text-muted)'
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'
  return (
    <span style={{ fontSize: '0.625rem', fontWeight: 600, color, letterSpacing: '0.02em' }}>
      {arrow} {value}
    </span>
  )
}

/**
 * Reusable StatCard / SummaryCard with distinct icon color styling per data type.
 * Supports both Dark Mode (soft transparent tint) and Light Mode (soft pastel with solid border).
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  colorVariant = 'amber',
  sub,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      {/* Top row: icon + label */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div className={cn("stat-icon-box", `stat-icon-${colorVariant}`)}>
          <Icon size={16} />
        </div>
        <p style={{
          fontSize: '0.625rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-secondary)', lineHeight: 1.2,
          maxWidth: '80px', textAlign: 'right',
        }}>
          {label}
        </p>
      </div>

      {/* Value */}
      <p style={{
        fontSize: '2rem', fontWeight: 800,
        letterSpacing: '-0.03em', lineHeight: 1,
        color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
        flex: 1,
      }}>
        {value}
      </p>

      {/* Bottom: sub + trend */}
      {sub && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.5rem', marginTop: '0.625rem',
        }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {sub}
          </span>
          {trend && <TrendBadge value={trend.label} dir={trend.dir} />}
        </div>
      )}
    </div>
  )
}
