"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Eye, Play, Trash2, ChevronLeft, ChevronRight, ArrowUpCircle, X, RotateCcw } from 'lucide-react'
import { cancelPromotion } from '@/actions/kenaikan-kelas'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

interface PromotionProcessTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
  tahunAjaranList: any[]
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  SEDANG_DIPROSES: { label: 'Sedang Diproses', variant: 'warning' },
  SELESAI: { label: 'Selesai', variant: 'success' },
  GAGAL: { label: 'Gagal', variant: 'danger' },
}

export function PromotionProcessTable({ data, total, page, totalPages, limit, tahunAjaranList }: PromotionProcessTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const currentStatus = searchParams.get('status') || 'all'
  const currentTA = searchParams.get('tahunAjaranId') || 'all'
  const isFiltered = Boolean(search || currentStatus !== 'all' || currentTA !== 'all')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/kenaikan-kelas?${params.toString()}`)
  }

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    params.set('page', '1')
    router.push(`/kenaikan-kelas?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/kenaikan-kelas')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/kenaikan-kelas?${params.toString()}`)
  }

  async function handleCancel(id: string) {
    const result = await cancelPromotion(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Proses kenaikan kelas berhasil dibatalkan')
    router.refresh()
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <Input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            {search && (
              <button type="button" onClick={() => { setSearch(''); const p = new URLSearchParams(searchParams); p.delete('search'); p.set('page','1'); router.push(`/kenaikan-kelas?${p.toString()}`) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[var(--text-primary)] cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
        </form>
        <div className="flex gap-2 flex-wrap">
          <Select value={currentTA} onValueChange={v => handleFilter('tahunAjaranId', v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tahun Ajaran" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {tahunAjaranList.map(ta => (
                <SelectItem key={ta.id} value={ta.id}>{ta.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currentStatus} onValueChange={v => handleFilter('status', v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SEDANG_DIPROSES">Sedang Diproses</SelectItem>
              <SelectItem value="SELESAI">Selesai</SelectItem>
              <SelectItem value="GAGAL">Gagal</SelectItem>
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button type="button" variant="ghost" size="sm" onClick={handleResetAll}>
              <RotateCcw size={14} /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3rem' }}>No</th>
                <th>Tahun Asal</th>
                <th>Tahun Tujuan</th>
                <th className="td-center">Total</th>
                <th className="td-center">Naik</th>
                <th className="td-center">Tinggal</th>
                <th className="td-center">Lulus</th>
                <th className="td-center">Status</th>
                <th>Waktu Proses</th>
                <th>Diproses Oleh</th>
                <th style={{ width: '7rem' }} className="td-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <EmptyState
                      icon={<ArrowUpCircle size={24} />}
                      title="Belum ada proses kenaikan kelas"
                      description="Klik tombol Proses Kenaikan Kelas untuk memulai"
                    />
                  </td>
                </tr>
              ) : (
                data.map((item, i) => {
                  const cfg = statusConfig[item.status] || statusConfig.DRAFT
                  return (
                    <tr key={item.id}>
                      <td className="td-mono">{(page - 1) * 10 + i + 1}</td>
                      <td className="td-primary font-medium">{item.dariTahunAjaran?.nama}</td>
                      <td className="td-primary font-medium">{item.keTahunAjaran?.nama}</td>
                      <td className="td-center font-semibold text-[var(--text-primary)]">{item.totalSiswa}</td>
                      <td className="td-center text-[#4ade80]">{item.jumlahNaik}</td>
                      <td className="td-center text-[#fb923c]">{item.jumlahTinggal}</td>
                      <td className="td-center text-[#7aa5cc]">{item.jumlahLulus}</td>
                      <td className="td-center"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="text-[var(--text-muted)] text-[12px]">{item.diprosesAt ? formatDateTime(item.diprosesAt) : '-'}</td>
                      <td className="td-muted text-[12px]">{item.diprosesOleh?.name || '-'}</td>
                      <td className="td-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={item.status === 'DRAFT' ? `/kenaikan-kelas/proses?id=${item.id}` : `/kenaikan-kelas/${item.id}`}>
                            <Button variant="ghost" size="icon-sm" title={item.status === 'DRAFT' ? 'Lanjutkan' : 'Detail'}>
                              {item.status === 'DRAFT' ? <Play size={14} className="text-[#D9A441]" /> : <Eye size={14} />}
                            </Button>
                          </Link>
                          {(item.status === 'DRAFT' || item.status === 'GAGAL') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon-sm" title="Batalkan">
                                  <Trash2 size={14} className="text-red-400" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Batalkan Proses</AlertDialogTitle>
                                  <AlertDialogDescription>Yakin ingin membatalkan proses kenaikan kelas ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancel(item.id)} className="bg-red-600 hover:bg-red-700">Batalkan</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-[12px] text-[#64748B]">
          <span>Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, total)} dari {total}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => handlePage(page - 1)}><ChevronLeft size={14} /></Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i + 1} variant={page === i + 1 ? 'default' : 'outline'} size="icon-sm" onClick={() => handlePage(i + 1)}>
                {i + 1}
              </Button>
            )).slice(Math.max(0, page - 3), page + 2)}
            <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}><ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </>
  )
}
