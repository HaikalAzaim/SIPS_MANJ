"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626']
const TINGKAT_COLORS: Record<string, string> = {
  Ringan: '#3b82f6',
  Sedang: '#f59e0b',
  Berat: '#ef4444',
  'Sangat Berat': '#dc2626',
}

interface StatistikClientProps {
  data: {
    perBulan: { bulan: string; total: number; totalPoin: number }[]
    perTingkat: { tingkat: string; total: number }[]
    perKelas: { namaKelas: string; total: number; totalPoin: number }[]
  }
  selectedYear: number
}

export function StatistikClient({ data, selectedYear }: StatistikClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  function handleYearChange(year: string) {
    const params = new URLSearchParams(searchParams)
    params.set('tahun', year)
    router.push(`/laporan/statistik?${params.toString()}`)
  }

  const totalPelanggaran = data.perBulan.reduce((s, m) => s + m.total, 0)
  const totalPoin = data.perBulan.reduce((s, m) => s + m.totalPoin, 0)

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Total Pelanggaran {selectedYear}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalPelanggaran}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Total Poin {selectedYear}</p>
            <p className="text-2xl font-bold text-gold-400">{totalPoin}</p>
          </div>
        </div>
        <Select onValueChange={handleYearChange} defaultValue={String(selectedYear)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-400" />
            Tren Pelanggaran Per Bulan — {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.perBulan}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="bulan" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)' }}
                itemStyle={{ color: '#ffc21a' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="total" name="Jumlah Pelanggaran" stroke="#ffc21a" strokeWidth={2} dot={{ fill: '#ffc21a', r: 4 }} />
              <Line type="monotone" dataKey="totalPoin" name="Total Poin" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Tingkat */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieIcon size={16} className="text-gold-400" />
              Distribusi Tingkat Pelanggaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.perTingkat.filter((d) => d.total > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="total"
                  nameKey="tingkat"
                  label={({ tingkat, percent }) => `${tingkat} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data.perTingkat.map((entry) => (
                    <Cell key={entry.tingkat} fill={TINGKAT_COLORS[entry.tingkat] || '#7a96e0'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {data.perTingkat.map((t) => (
                <div key={t.tingkat} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ background: TINGKAT_COLORS[t.tingkat] }} />
                  <span className="text-[var(--text-secondary)]">{t.tingkat}: <strong className="text-[var(--text-primary)]">{t.total}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Per Kelas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 size={16} className="text-gold-400" />
              Pelanggaran Per Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.perKelas.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis type="category" dataKey="namaKelas" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} width={60} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  itemStyle={{ color: '#ffc21a' }}
                />
                <Bar dataKey="total" name="Pelanggaran" fill="#ffc21a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
