"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight, X, RotateCcw, Shield } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatDate } from '@/lib/utils'

interface AuditLogTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  modules: string[]
  users: { id: string; name: string }[]
}

const actionBadgeClass: Record<string, string> = {
  CREATE: 'badge-ringan',
  UPDATE: 'badge-sedang',
  DELETE: 'badge-sangat-berat',
  LOGIN:  'badge-berat',
}

export function AuditLogTable({ data, total, page, totalPages, modules, users }: AuditLogTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const currentAction = searchParams.get('action') || 'all'
  const currentModule = searchParams.get('module') || 'all'
  const currentUserId = searchParams.get('userId') || 'all'
  const isFiltered = Boolean(
    search ||
    (currentAction && currentAction !== 'all') ||
    (currentModule && currentModule !== 'all') ||
    (currentUserId && currentUserId !== 'all')
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/audit-log?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/audit-log?${params.toString()}`)
  }

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    router.push(`/audit-log?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/audit-log')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/audit-log?${params.toString()}`)
  }

  const startItem = (page - 1) * 20 + 1
  const endItem = Math.min(page * 20, total)

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="table-toolbar-group">
          <form onSubmit={handleSearch} className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi atau record ID..."
              className="search-input-field"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="search-clear-btn"
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </form>

          <Select onValueChange={(v) => handleFilter('action', v)} value={currentAction}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Semua Aksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Aksi</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="LOGIN">LOGIN</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => handleFilter('module', v)} value={currentModule}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semua Modul" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Modul</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => handleFilter('userId', v)} value={currentUserId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Pengguna" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pengguna</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetAll}
              className="toolbar-reset-btn"
              title="Reset semua filter"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th style={{ width: '11rem' }}>Waktu</th>
                <th style={{ width: '13rem' }}>Pengguna</th>
                <th style={{ width: '7rem' }} className="td-center">Aksi</th>
                <th style={{ width: '7rem' }}>Modul</th>
                <th>Deskripsi</th>
                <th style={{ width: '9rem' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={<Shield size={22} />}
                      title={isFiltered ? "Tidak ada log yang sesuai filter" : "Belum ada log aktivitas"}
                      description={isFiltered ? "Coba ubah kata kunci atau pilihan filter Anda." : "Aktivitas pengguna akan tercatat di sini secara otomatis."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((log, i) => (
                  <tr key={log.id}>
                    <td className="td-mono">{startItem + i}</td>
                    <td className="whitespace-nowrap text-[#8FA4BD] text-[12px]">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="td-primary whitespace-nowrap font-medium">{log.user?.name || 'System'}</td>
                    <td className="td-center">
                      <span className={cn(
                        "badge",
                        actionBadgeClass[log.action] || 'badge-ringan'
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="td-mono text-[11px] text-[#8FA4BD] uppercase">{log.module}</td>
                    <td className="text-[13px] text-[#C5D3E3] max-w-[340px] truncate" title={log.description}>{log.description || '-'}</td>
                    <td className="td-mono text-[11px] text-[#64748B]">{log.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {totalPages > 1 && (
          <div className="table-info-bar">
            <span className="table-info-text">
              Menampilkan {startItem}–{endItem} dari {total} log
            </span>
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => handlePage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    className={cn("pagination-btn", p === page && "active")}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </button>
                )
              })}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
