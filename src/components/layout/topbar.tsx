"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Menu, ChevronDown, User, Settings, LogOut, Search, Calendar } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/theme-toggle'

interface TopbarProps {
  userName: string
  userRole: string
  onMenuClick: () => void
  notificationCount?: number
  isSidebarCollapsed?: boolean
  onToggleSidebarCollapse?: () => void
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function Topbar({
  userName,
  userRole,
  onMenuClick,
  notificationCount = 0,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}: TopbarProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')

  function handleGlobalSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && globalSearch.trim()) {
      router.push(`/siswa?search=${encodeURIComponent(globalSearch.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dayName = currentTime ? currentTime.toLocaleDateString('id-ID', { weekday: 'short' }) : ''
  const dateStr = currentTime ? currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const timeStr = currentTime ? currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : ''

  const initials = getInitials(userName)
  const roleShort = userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'
  const roleFull  = userRole === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'

  return (
    <header
      className="topbar no-print flex items-center justify-between px-4 lg:px-5 w-full"
      style={{
        background: 'var(--topbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--topbar-border)',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ── LEFT: Hamburger + Search ── */}
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--hover-btn)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
          }}
          aria-label="Buka Menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop expand button when sidebar collapsed */}
        {isSidebarCollapsed && onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--hover-btn)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--gold)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
            }}
            title="Perluas sidebar"
            aria-label="Perluas sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 h-9 w-full max-w-[380px] lg:max-w-[460px] rounded-[8px] transition-all duration-150"
          style={{
            background: 'var(--search-bg)',
            border: '1px solid var(--border-subtle)',
          }}
          onFocusCapture={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
            ;(e.currentTarget as HTMLElement).style.background = 'var(--search-focus-bg)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--gold-dim)'
          }}
          onBlurCapture={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'
            ;(e.currentTarget as HTMLElement).style.background = 'var(--search-bg)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          }}
        >
          <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onKeyDown={handleGlobalSearch}
            placeholder="Cari nama, NIUP, kelas, atau informasi..."
            className="bg-transparent outline-none text-[0.8125rem] w-full placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="sm:hidden p-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <Search size={18} />
        </button>
      </div>

      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div
          className="sm:hidden absolute top-[60px] left-0 right-0 p-3 border-b shadow-xl z-40"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-[8px] w-full"
            style={{
              background: 'var(--search-bg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input type="text" autoFocus
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              onKeyDown={handleGlobalSearch}
              placeholder="Cari nama, NIUP, kelas..."
              className="bg-transparent outline-none text-[0.8125rem] w-full placeholder:text-[var(--text-muted)]"
              style={{ color: 'var(--text-primary)' }} />
          </div>
        </div>
      )}

      {/* ── RIGHT: Bell | Date | ThemeToggle | Profile ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="relative p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--hover-btn)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
            }}
          >
            <Bell size={17} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[13px] h-[13px] rounded-full bg-[#ef4444] text-white text-[8px] font-bold flex items-center justify-center px-0.5 leading-none">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
                style={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 className="font-semibold text-[0.8125rem]" style={{ color: 'var(--text-primary)' }}>Notifikasi</h3>
                  {notificationCount > 0 && <span className="text-[0.6875rem] font-semibold" style={{ color: 'var(--gold)' }}>{notificationCount} baru</span>}
                </div>
                <div className="p-4 text-center">
                  <p className="text-[0.75rem]" style={{ color: 'var(--text-muted)' }}>Lihat notifikasi di dashboard</p>
                  <a href="/dashboard" className="text-[0.75rem] font-medium mt-1 inline-block hover:underline" style={{ color: 'var(--gold)' }}>Ke Dashboard →</a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />

        {/* Date + Time — desktop */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg min-w-[120px] justify-end">
          <Calendar size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div className="text-right">
            {mounted && currentTime ? (
              <>
                <p className="text-[0.625rem] leading-none font-semibold" style={{ color: 'var(--text-secondary)' }} suppressHydrationWarning>
                  {dayName}, {dateStr}
                </p>
                <p className="text-[0.625rem] font-mono leading-none mt-0.5 font-semibold" style={{ color: 'var(--text-primary)' }} suppressHydrationWarning>
                  {timeStr} WIB
                </p>
              </>
            ) : (
              <div className="h-5 w-20" />
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px h-5 mx-0.5" style={{ background: 'var(--border-subtle)' }} />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Separator */}
        <div className="hidden lg:block w-px h-5 mx-0.5" style={{ background: 'var(--border-subtle)' }} />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg transition-colors cursor-pointer"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-btn)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--gold-dim)',
                border: '1px solid var(--gold-border)',
              }}
            >
              <span className="text-[0.5625rem] font-bold" style={{ color: 'var(--gold)' }}>{initials}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[0.75rem] font-bold leading-none truncate max-w-[110px]" style={{ color: 'var(--text-primary)' }}>{userName}</p>
              <p className="text-[0.5625rem] leading-none mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>{roleShort}</p>
            </div>
            <ChevronDown size={11} className="hidden sm:block" style={{ color: 'var(--text-secondary)' }} />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
                style={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="p-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <p className="text-[0.8125rem] font-semibold" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                  <p className="text-[0.6875rem] mt-0.5" style={{ color: 'var(--gold)' }}>{roleFull}</p>
                </div>
                <div className="py-1.5">
                  <a
                    href="/profile"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[0.75rem] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <User size={14} /><span>Profil Saya</span>
                  </a>
                  {userRole === 'SUPER_ADMIN' && (
                    <a
                      href="/pengaturan/sistem"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[0.75rem] transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      <Settings size={14} /><span>Pengaturan</span>
                    </a>
                  )}
                </div>
                <div className="py-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[0.75rem] transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = '#e57373'
                        ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                      }}
                    >
                      <LogOut size={14} /><span>Keluar</span>
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
