"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, ChevronDown } from 'lucide-react'

const DONUT_COLORS = ['#D9A441', '#5B7A9D', '#3d5a80', '#64748B', '#1C2B42', '#8FA0B8']

interface ChartsProps {
  perBulan: { bulan: string; total: number; totalPoin: number }[]
  perKategori: { nama: string; total: number; totalPoin: number }[]
  perKelas: { namaKelas: string; total: number; totalPoin: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div style={{ background: 'var(--popover)', border: '1px solid var(--border-subtle)' }} className="rounded-lg p-3 shadow-2xl z-50">
      <p className="text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px] flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null
  return (
    <div style={{ background: 'var(--popover)', border: '1px solid var(--border-subtle)' }} className="rounded-lg p-2.5 shadow-2xl z-50">
      <p className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</p>
      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
        Jumlah: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{payload[0].value}</span>
      </p>
    </div>
  )
}

export function DashboardCharts({ perBulan, perKategori }: ChartsProps) {
  const [activeFilter, setActiveFilter] = useState('12')
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const totalPelanggaran = perKategori.reduce((sum, k) => sum + k.total, 0)

  // Filter data based on selection
  const getFilteredData = () => {
    const months = parseInt(activeFilter)
    if (months >= 12) return perBulan
    const currentMonth = new Date().getMonth()
    const startIndex = Math.max(0, currentMonth - months + 1)
    return perBulan.slice(startIndex, currentMonth + 1)
  }

  const filteredData = getFilteredData()
  const filterLabel = activeFilter === '12' ? '12 Bulan' : activeFilter === '6' ? '6 Bulan' : '30 Hari'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
      {/* 1. Tren Pelanggaran Siswa (65-70% on desktop) */}
      <Card className="lg:col-span-2 min-w-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgba(217,164,65,0.1)] border border-[rgba(217,164,65,0.2)] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={16} className="text-[#D9A441]" />
              </div>
              <div>
                <CardTitle className="text-[14px] font-semibold text-[var(--text-primary)]">Tren Pelanggaran Siswa</CardTitle>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Grafik jumlah pelanggaran dan total poin per bulan</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#D9A441]" />
                  Pelanggaran
                </span>
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#5B7A9D]" />
                  Total Poin
                </span>
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="chart-filter-btn flex items-center gap-1.5 px-2.5 py-1 text-[11px]"
                >
                  <span>{filterLabel}</span>
                  <ChevronDown size={12} />
                </button>

                {filterDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setFilterDropdownOpen(false)} />
                    <div
                      className="absolute right-0 mt-1 w-28 rounded-lg shadow-xl z-50 py-1"
                      style={{ background: 'var(--popover)', border: '1px solid var(--border-subtle)' }}
                    >
                      {[
                        { label: '12 Bulan', value: '12' },
                        { label: '6 Bulan', value: '6' },
                        { label: '30 Hari', value: '1' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            setActiveFilter(item.value)
                            setFilterDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${activeFilter === item.value
                              ? 'font-medium'
                              : ''
                            }`}
                          style={{
                            color: activeFilter === item.value ? 'var(--gold)' : 'var(--text-muted)',
                            background: activeFilter === item.value ? 'var(--gold-dim)' : 'transparent',
                          }}
                          onMouseEnter={e => {
                            if (activeFilter !== item.value) {
                              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                              ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                            }
                          }}
                          onMouseLeave={e => {
                            if (activeFilter !== item.value) {
                              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                            }
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-2">
          <div className="h-[270px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="bulan"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#D9A441"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#D9A441', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#D9A441', stroke: 'var(--card)', strokeWidth: 2 }}
                  name="Pelanggaran"
                />
                <Line
                  type="monotone"
                  dataKey="totalPoin"
                  stroke="#5B7A9D"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#5B7A9D', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#5B7A9D', stroke: 'var(--card)', strokeWidth: 2 }}
                  name="Total Poin"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Berdasarkan Kategori (30-35% on desktop) */}
      <Card className="min-w-0 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(217,164,65,0.1)] border border-[rgba(217,164,65,0.2)] flex items-center justify-center flex-shrink-0">
              <PieChartIcon size={16} className="text-[#D9A441]" />
            </div>
            <div>
              <CardTitle className="text-[14px] font-semibold text-[var(--text-primary)]">Berdasarkan Kategori</CardTitle>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Persentase pelanggaran per kategori</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between pt-1">
          <div className="h-[180px] relative w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={perKategori}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={74}
                  dataKey="total"
                  nameKey="nama"
                  stroke="none"
                  paddingAngle={3}
                >
                  {perKategori.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{totalPelanggaran}</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5">Total</p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 mt-2 pt-2 border-t border-[var(--border-subtle)]">
            {perKategori.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)] text-center py-2">Belum ada data kategori</p>
            ) : (
              perKategori.slice(0, 4).map((k, i) => {
                const percentage = totalPelanggaran > 0 ? Math.round((k.total / totalPelanggaran) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="text-[var(--text-secondary)] flex-1 truncate font-medium">{k.nama}</span>
                    <span className="text-[var(--text-primary)] font-semibold">{k.total}</span>
                    <span className="text-[var(--text-muted)] w-8 text-right font-mono font-medium">{percentage}%</span>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
