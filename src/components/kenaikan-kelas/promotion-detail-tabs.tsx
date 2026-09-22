"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, ArrowUpCircle, ArrowDownCircle, GraduationCap, LogOut, XCircle } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/utils'

interface PromotionDetailTabsProps {
  process: any
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  NAIK_KELAS:       { label: 'Naik Kelas',       variant: 'success'  },
  TINGGAL_KELAS:    { label: 'Tinggal Kelas',    variant: 'warning'  },
  LULUS:            { label: 'Lulus',             variant: 'info'     },
  PINDAH_SEKOLAH:   { label: 'Pindah Sekolah',   variant: 'outline'  },
  TIDAK_AKTIF:      { label: 'Tidak Aktif',       variant: 'danger'   },
  BELUM_DITENTUKAN: { label: 'Belum Ditentukan',  variant: 'outline'  },
}

const processStatusConfig: Record<string, { label: string; variant: any }> = {
  DRAFT:            { label: 'Draft',             variant: 'outline'  },
  SEDANG_DIPROSES:  { label: 'Sedang Diproses',  variant: 'warning'  },
  SELESAI:          { label: 'Selesai',           variant: 'success'  },
  GAGAL:            { label: 'Gagal',             variant: 'danger'   },
}

export function PromotionDetailTabs({ process }: PromotionDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'siswa' | 'riwayat'>('ringkasan')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const details = process.detailKenaikan || []
  const pStatus = processStatusConfig[process.status] || processStatusConfig.DRAFT

  const filteredDetails = details.filter((d: any) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      if (!d.siswa.nama.toLowerCase().includes(q) && !d.siswa.niup.toLowerCase().includes(q)) return false
    }
    return true
  })

  const tabs = [
    { key: 'ringkasan', label: 'Ringkasan' },
    { key: 'siswa', label: `Daftar Siswa (${details.length})` },
    { key: 'riwayat', label: 'Riwayat Perubahan' },
  ] as const

  return (
    <div className="space-y-5">
      {/* Tab Buttons */}
      <div className="flex border-b border-[rgba(255,255,255,0.07)]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 cursor-pointer ${
              activeTab === tab.key
                ? 'text-[#D9A441] border-[#D9A441]'
                : 'text-[#64748B] border-transparent hover:text-[#8FA4BD]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Ringkasan */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Detail Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tahun Asal', value: process.dariTahunAjaran?.nama },
              { label: 'Tahun Tujuan', value: process.keTahunAjaran?.nama, isGold: true },
              { label: 'Status', value: pStatus.label, badge: pStatus.variant },
              { label: 'Diproses Oleh', value: process.diprosesOleh?.name || '-' },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
                <p className="text-[11px] text-[#64748B] mb-1">{item.label}</p>
                {item.badge ? (
                  <Badge variant={item.badge}>{item.value}</Badge>
                ) : (
                  <p className={`text-[14px] font-semibold ${item.isGold ? 'text-[#D9A441]' : 'text-[var(--foreground)]'}`}>{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Time info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] text-[#64748B] mb-1">Dibuat</p>
              <p className="text-[13px] text-[#8FA4BD]">{formatDateTime(process.createdAt)}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
              <p className="text-[11px] text-[#64748B] mb-1">Waktu Proses</p>
              <p className="text-[13px] text-[#8FA4BD]">{process.diprosesAt ? formatDateTime(process.diprosesAt) : '-'}</p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <p className="text-[12px] font-semibold text-[#8FA4BD] mb-3">STATISTIK KENAIKAN</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { icon: ArrowUpCircle, label: 'Naik Kelas', count: process.jumlahNaik, color: 'text-[#4ade80]' },
                { icon: ArrowDownCircle, label: 'Tinggal Kelas', count: process.jumlahTinggal, color: 'text-[#fb923c]' },
                { icon: GraduationCap, label: 'Lulus', count: process.jumlahLulus, color: 'text-[#7aa5cc]' },
                { icon: LogOut, label: 'Pindah', count: process.jumlahPindah, color: 'text-[#8FA4BD]' },
                { icon: XCircle, label: 'Tidak Aktif', count: process.jumlahTidakAktif, color: 'text-[#f87171]' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 text-center">
                    <Icon size={18} className={`${item.color} mx-auto mb-1`} />
                    <p className="text-xl font-bold text-[var(--foreground)]">{item.count}</p>
                    <p className="text-[10px] text-[#64748B]">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Daftar Siswa */}
      {activeTab === 'siswa' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <Input placeholder="Cari nama / NIUP..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-[12px]" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] h-8 text-[12px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="table-wrapper">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '3rem' }}>No</th>
                    <th>NIUP</th>
                    <th>Nama Siswa</th>
                    <th>Kelas Asal</th>
                    <th>Status</th>
                    <th>Kelas Tujuan</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetails.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#64748B]">Tidak ada data</td></tr>
                  ) : (
                    filteredDetails.map((d: any, i: number) => {
                      const cfg = statusConfig[d.status] || statusConfig.BELUM_DITENTUKAN
                      return (
                        <tr key={d.id}>
                          <td className="td-mono">{i + 1}</td>
                          <td className="td-mono text-[12px]">{d.siswa.niup}</td>
                          <td className="td-primary font-medium">{d.siswa.nama}</td>
                          <td className="text-[12px] text-[#8FA4BD]">{d.dariKelas?.namaKelas}</td>
                          <td><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                          <td className="text-[12px] text-[#8FA4BD]">{d.keKelas?.namaKelas || '—'}</td>
                          <td className="text-[11px] text-[#64748B] max-w-[120px] truncate">{d.catatan || '—'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Riwayat Perubahan */}
      {activeTab === 'riwayat' && (
        <div className="space-y-3">
          <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <div>
                <p className="text-[13px] text-[var(--foreground)] font-medium">
                  Proses {process.status === 'SELESAI' ? 'selesai' : process.status === 'DRAFT' ? 'dibuat' : process.status === 'GAGAL' ? 'gagal' : 'berlangsung'}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  {process.diprosesOleh?.name || 'Sistem'} — {formatDateTime(process.diprosesAt || process.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#D9A441]" />
              <div>
                <p className="text-[13px] text-[var(--foreground)] font-medium">Draft dibuat</p>
                <p className="text-[11px] text-[#64748B]">
                  {process.diprosesOleh?.name || 'Admin'} — {formatDateTime(process.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
