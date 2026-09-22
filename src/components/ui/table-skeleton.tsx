import React from 'react'

interface TableSkeletonProps {
  columns: number
  rows?: number
}

/**
 * Skeleton loading state for data tables. Uses existing SIPS CSS variables.
 */
export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="table-wrapper">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <div
                    className="animate-pulse rounded"
                    style={{
                      height: '0.75rem',
                      width: `${40 + Math.random() * 40}%`,
                      background: 'var(--border)',
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx}>
                    <div
                      className="animate-pulse rounded"
                      style={{
                        height: '0.875rem',
                        width: `${30 + Math.random() * 50}%`,
                        background: 'var(--border)',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
