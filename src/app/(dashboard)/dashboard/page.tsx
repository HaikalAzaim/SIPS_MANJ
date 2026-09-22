import { getCurrentUser } from '@/lib/auth'
import {
  getDashboardStats,
  getPelanggaranPerBulan,
  getPelanggaranPerKategori,
  getPelanggaranPerKelas,
  getTopSiswa,
  getTopPelanggaran,
  getRecentNotifications,
  getThresholds,
} from '@/actions/dashboard'
import { getPelanggaranList } from '@/actions/pelanggaran'
import { getStatusFromPoin, formatDate } from '@/lib/utils'
import { DashboardCharts } from '@/components/dashboard/charts'
import { StatCard, type StatCardColorVariant } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle, Users, School, List, TrendingUp,
  Bell, ClipboardList, ArrowRight, Star, GraduationCap,
  Plus, CalendarDays, ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

// ── Helpers ──────────────────────────────────────────────
function getAcademicYear() {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

// ── Page ─────────────────────────────────────────────────
export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const [
    stats, perBulan, perKategori, perKelas,
    topSiswa, topPelanggaran, notifications, thresholds, pelanggaranResult,
  ] = await Promise.all([
    getDashboardStats(),
    getPelanggaranPerBulan(),
    getPelanggaranPerKategori(),
    getPelanggaranPerKelas(),
    getTopSiswa(),
    getTopPelanggaran(),
    getRecentNotifications(user.id),
    getThresholds(),
    getPelanggaranList({ limit: 5 }),
  ])

  const recentPelanggaran = pelanggaranResult?.data || []
  const firstName = user.name.split(' ')[0]
  const tahunAjaran = getAcademicYear()

  // Month trends
  const currentMonth = new Date().getMonth()
  const cur = perBulan[currentMonth]
  const prev = currentMonth > 0 ? perBulan[currentMonth - 1] : null

  function calcTrend(curVal: number, prevVal: number): { label: string; dir: 'up' | 'down' | 'flat' } {
    if (!prev || prevVal === 0) return { label: '—', dir: 'flat' }
    const diff = curVal - prevVal
    const pct = Math.round((diff / prevVal) * 100)
    return { label: `${Math.abs(pct)}%`, dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
  }

  const pelanggTrend = calcTrend(cur?.total ?? 0, prev?.total ?? 0)
  const poinTrend    = calcTrend(cur?.totalPoin ?? 0, prev?.totalPoin ?? 0)

  const statCards: {
    key: string
    label: string
    value: number
    icon: typeof AlertTriangle
    sub: string
    trend: { label: string; dir: 'up' | 'down' | 'flat' }
    colorVariant: StatCardColorVariant
  }[] = [
    { key: 'pelanggaran', label: 'Total Pelanggaran', value: stats.totalPelanggaran, icon: AlertTriangle, sub: 'Semua catatan', trend: pelanggTrend, colorVariant: 'amber' },
    { key: 'poin',        label: 'Total Poin',        value: stats.totalPoin,        icon: Star,          sub: 'Akumulasi poin', trend: poinTrend,    colorVariant: 'blue' },
    { key: 'siswa',       label: 'Total Siswa',       value: stats.totalSiswa,       icon: GraduationCap, sub: 'Siswa terdaftar', trend: { label: '—', dir: 'flat' as const }, colorVariant: 'green' },
    { key: 'guru',        label: 'Total Guru',        value: stats.totalGuru,        icon: Users,         sub: 'Guru aktif',     trend: { label: '—', dir: 'flat' as const }, colorVariant: 'purple' },
    { key: 'kategori',   label: 'Kategori',          value: stats.totalKategori,    icon: List,          sub: 'Jenis pelanggaran', trend: { label: '—', dir: 'flat' as const }, colorVariant: 'rose' },
  ]

  const panelStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: 'var(--card-shadow)',
  }
  const panelHeaderStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1.125rem',
    borderBottom: '1px solid var(--border-muted)',
  }

  return (
    <div className="animate-fade-in w-full max-w-full" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── 1. Page Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Title row */}
        <div>
          <h1 className="page-title" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>
            Selamat Datang, {firstName} 👋
          </h1>
          <p className="page-subtitle">Berikut ringkasan data pelanggaran siswa pada sistem SIPS.</p>
        </div>

        {/* Actions row — wraps naturally on mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {/* Tahun Ajaran pill */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            <CalendarDays size={13} style={{ color: '#D9A62E' }} />
            <span style={{ color: 'var(--text-muted)' }}>Tahun Ajaran</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tahunAjaran}</span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* + Catat Pelanggaran */}
          <Link
            href="/pelanggaran"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.4rem 0.875rem',
              borderRadius: '8px',
              background: '#D9A62E',
              color: '#07111F',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease',
            }}
            className="hover:bg-[#C4912A]"
          >
            <Plus size={14} />
            Catat Pelanggaran
          </Link>

          {/* Quick links */}
          <Link href="/siswa" style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '7px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'border-color 0.15s, color 0.15s',
          }} className="hover:border-[var(--gold-border)] hover:text-[var(--text-primary)]">
            <Users size={12} />
            Lihat Data Siswa
          </Link>
          <Link href="/pelanggaran" style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '7px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'border-color 0.15s, color 0.15s',
          }} className="hover:border-[var(--gold-border)] hover:text-[var(--text-primary)]">
            <ClipboardList size={12} />
            Lihat Semua Pelanggaran
          </Link>
        </div>
      </div>

      {/* ── 2. Stat Cards ── */}
      <div className="stat-cards-grid">
        {statCards.map((card, idx) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={card.icon}
            colorVariant={card.colorVariant}
            sub={card.sub}
            trend={card.trend}
            /* On mobile (2-col grid), last odd card spans 2 columns */
            className={idx === statCards.length - 1 && statCards.length % 2 !== 0 ? 'stat-card-last-odd' : ''}
          />
        ))}
      </div>

      {/* ── 3. Charts ── */}
      <DashboardCharts perBulan={perBulan} perKategori={perKategori} perKelas={perKelas} />

      {/* ── 4. Bottom: 4-panel grid (2fr 1fr 1fr 1fr) ── */}
      <div className="bottom-panels-grid">

        {/* Panel A: Pelanggaran Terbaru (wide) */}
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column' }}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={14} style={{ color: '#D9A62E' }} />
              <div>
                <p className="section-title" style={{ fontSize: '0.875rem' }}>Pelanggaran Terbaru</p>
                <p className="section-subtitle">5 catatan terkini</p>
              </div>
            </div>
            <Link href="/pelanggaran" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: '#D9A62E', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Lihat Semua <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="data-table" style={{ minWidth: '480px' }}>
              <thead>
                <tr>
                  <th style={{ width: '2rem' }}>No</th>
                  <th>Siswa</th>
                  <th>Kelas</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th className="td-center">Poin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPelanggaran.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                        <div className="empty-state-icon"><ClipboardList size={18} /></div>
                        <p className="empty-state-title">Belum ada catatan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentPelanggaran.map((p, i) => (
                    <tr key={p.id}>
                      <td className="td-mono">{i + 1}</td>
                      <td>
                        <Link href={`/siswa/${p.siswa.id}`} className="td-primary hover:text-[#D9A62E] transition-colors" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {p.siswa.nama}
                        </Link>
                      </td>
                      <td className="td-muted" style={{ whiteSpace: 'nowrap' }}>{p.siswa.kelas?.namaKelas || '—'}</td>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: '0.625rem', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {p.kategoriPelanggaran?.nama || '—'}
                        </span>
                      </td>
                      <td className="td-muted" style={{ whiteSpace: 'nowrap', fontSize: '0.6875rem' }}>{formatDate(p.tanggal)}</td>
                      <td className="td-center"><span className="poin-badge">{p.poin}</span></td>
                      <td><span className="badge badge-tercatat"><span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} /> Tercatat</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel B: Top Siswa */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={13} style={{ color: '#D9A62E' }} />
              <p className="section-title" style={{ fontSize: '0.8125rem' }}>Top Siswa</p>
            </div>
            <Link href="/siswa" style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Lihat Semua →</Link>
          </div>
          <div style={{ padding: '0.375rem 0.625rem' }}>
            {topSiswa.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Belum ada data</p>
            ) : (
              topSiswa.map((siswa, i) => {
                const statusInfo = getStatusFromPoin(siswa.totalPoin, thresholds as any)
                return (
                  <Link key={siswa.id} href={`/siswa/${siswa.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.375rem', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.12s' }} className="hover:bg-[var(--bg-hover)]">
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.5625rem', fontWeight: 800, flexShrink: 0,
                      background: i === 0 ? '#D9A62E' : 'var(--bg-elevated)',
                      color: i === 0 ? '#07111F' : 'var(--text-secondary)',
                      border: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{siswa.nama}</p>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{siswa.namaKelas}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#D9A62E', lineHeight: 1 }}>{siswa.totalPoin}</p>
                      <Badge variant={
                        statusInfo.status === 'Normal' ? 'normal' :
                        statusInfo.status === 'Perhatian' ? 'perhatian' :
                        statusInfo.status === 'Peringatan' ? 'peringatan' : 'teguran'
                      } style={{ fontSize: '0.5rem', marginTop: '2px' }}>
                        {statusInfo.status}
                      </Badge>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Panel C: Top Pelanggaran */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={13} style={{ color: '#f87171' }} />
              <p className="section-title" style={{ fontSize: '0.8125rem' }}>Pelanggaran Terbanyak</p>
            </div>
            <Link href="/pelanggaran/kategori" style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Kategori →</Link>
          </div>
          <div style={{ padding: '0.375rem 0.625rem' }}>
            {topPelanggaran.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Belum ada data</p>
            ) : (
              topPelanggaran.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.375rem', borderRadius: '8px', transition: 'background 0.12s' }} className="hover:bg-[var(--bg-hover)]">
                  <div style={{ flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nama}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{p.jumlahKasus} kasus</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D9A62E', flexShrink: 0 }}>{p.totalPoin} poin</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel D: Notifikasi */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={13} style={{ color: '#D9A62E' }} />
              <p className="section-title" style={{ fontSize: '0.8125rem' }}>Notifikasi Terbaru</p>
            </div>
          </div>
          <div style={{ padding: '0.375rem 0.625rem' }}>
            {notifications.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.75rem 1rem', textAlign: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tidak ada notifikasi baru</p>
                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Semua notifikasi akan muncul di sini</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} style={{ padding: '0.5rem 0.375rem', borderRadius: '8px', opacity: n.dibaca ? 0.6 : 1, transition: 'background 0.12s' }} className={!n.dibaca ? 'hover:bg-[var(--bg-hover)]' : ''}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                    <span style={{ marginTop: '5px', width: '4px', height: '4px', borderRadius: '50%', flexShrink: 0, background: !n.dibaca ? '#D9A62E' : 'var(--border-muted)' }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.judul}</p>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>{n.pesan}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
