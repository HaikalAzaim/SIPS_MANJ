"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GraduationCap, School, BookOpen,
  FileText, Settings, Shield,              ClipboardList,
  BarChart3, UserCheck, FileWarning, List, X, Menu,
  ChevronRight, ChevronDown, FileBarChart, Calendar, ArrowUpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: 'SUPER_ADMIN' | 'ADMIN'
  isOpen: boolean
  onClose: () => void
  userName?: string
  userRole?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  label: string
  icon: React.ElementType
  href?: string
  children?: { label: string; href: string; icon: React.ElementType }[]
  roles?: ('SUPER_ADMIN' | 'ADMIN')[]
}

interface NavSection {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: 'UTAMA',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
    section: 'DATA MASTER',
    items: [
      { label: 'Siswa',                icon: GraduationCap, href: '/siswa' },
      { label: 'Guru',                 icon: UserCheck,     href: '/guru' },
      { label: 'Kelas',                icon: School,        href: '/kelas' },
      { label: 'Kategori Pelanggaran', icon: List,          href: '/pelanggaran/kategori' },
      { label: 'Pelanggaran',          icon: ClipboardList, href: '/pelanggaran' },
      { label: 'Tahun Ajaran',         icon: Calendar,      href: '/tahun-ajaran' },
      { label: 'Kenaikan Kelas',       icon: ArrowUpCircle, href: '/kenaikan-kelas' },
    ],
  },
  {
    section: 'LAPORAN',
    items: [
      { label: 'Laporan', icon: FileText, roles: ['SUPER_ADMIN'], children: [
        { label: 'Laporan Pelanggaran', href: '/laporan/pelanggaran', icon: FileText },
        { label: 'Laporan Siswa',       href: '/laporan/siswa',       icon: GraduationCap },
        { label: 'Laporan Kelas',       href: '/laporan/kelas',       icon: School },
        { label: 'Statistik',           href: '/laporan/statistik',   icon: BarChart3 },
        { label: 'Siswa Threshold',     href: '/laporan/threshold',   icon: FileWarning },
        { label: 'Surat Teguran',       href: '/laporan/surat-teguran', icon: BookOpen },
      ]},
    ],
  },
  {
    section: 'SISTEM',
    items: [
      { label: 'Pengaturan', icon: Settings, roles: ['SUPER_ADMIN'], children: [
        { label: 'Pengguna', href: '/pengaturan/pengguna', icon: Users },
        { label: 'Sistem',   href: '/pengaturan/sistem',   icon: Settings },
      ]},
      { label: 'Audit Log', icon: Shield, href: '/audit-log', roles: ['SUPER_ADMIN'] },
    ],
  },
]

const allNavHrefs: string[] = navSections.flatMap(sec =>
  sec.items.flatMap(item => (item.href ? [item.href] : (item.children?.map(c => c.href) || [])))
)

function isNavActive(itemHref: string, currentPath: string, allHrefs: string[]): boolean {
  if (currentPath === itemHref) return true
  // Only match sub-routes (e.g. /siswa/123) if no other registered nav item is a more specific match
  if (currentPath.startsWith(itemHref + '/')) {
    const hasMoreSpecific = allHrefs.some(
      other => other !== itemHref &&
               other.startsWith(itemHref + '/') &&
               (currentPath === other || currentPath.startsWith(other + '/'))
    )
    return !hasMoreSpecific
  }
  return false
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function getRoleLabel(role: string) {
  return role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'
}

export function Sidebar({
  role, isOpen, onClose,
  userName = 'User', userRole,
  isCollapsed = false, onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const expanded: string[] = []
    navSections.forEach(sec => sec.items.forEach(item => {
      if (item.children?.some(c => isNavActive(c.href, pathname, allNavHrefs))) expanded.push(item.label)
    }))
    return expanded
  })

  const toggleExpand = (label: string) =>
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    )

  const isVisible = (item: NavItem) => !item.roles || item.roles.includes(role)

  const initials = getInitials(userName)
  const roleLabel = getRoleLabel(userRole || role)

  return (
    <aside
      className={cn(
        "sidebar no-print flex flex-col transition-all duration-250",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "is-collapsed lg:w-[64px] lg:min-w-[64px]" : "w-[256px] min-w-[256px]"
      )}
      style={{ transition: 'width 0.25s ease, min-width 0.25s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* ── Logo + Collapse toggle ── */}
      <div
        className={cn(
          "flex items-center border-b flex-shrink-0 transition-all",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
        style={{ height: 'var(--topbar-height)', borderColor: 'var(--border-subtle)' }}
      >
        {!isCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="w-7 h-7 rounded-lg bg-[#D9A62E] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Shield size={13} className="text-[#07111F]" />
              </div>
              <div>
                <p className="text-[0.9375rem] font-bold text-[#D9A62E] tracking-wider leading-none">SIPS</p>
                <p className="text-[0.5rem] text-[var(--text-muted)] tracking-wide mt-0.5">Informasi Pelanggaran Siswa</p>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop collapse toggle */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-md transition-colors cursor-pointer"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                  title="Ciutkan sidebar"
                  aria-label="Ciutkan sidebar"
                >
                  <Menu size={15} />
                </button>
              )}
              {/* Mobile close */}
              <button onClick={onClose} className="lg:hidden p-1.5 rounded-md cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }} aria-label="Tutup sidebar">
                <X size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="w-7 h-7 rounded-lg bg-[#D9A62E] flex items-center justify-center shadow-sm">
              <Shield size={13} className="text-[#07111F]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation (scrollable) ── */}
      <nav className="flex-1 overflow-y-auto min-h-0 py-3">
        {navSections.map((sec) => {
          const visible = sec.items.filter(isVisible)
          if (!visible.length) return null
          return (
            <div key={sec.section}>
              {/* Section label — hidden when collapsed */}
              {!isCollapsed && (
                <div className="sidebar-section-label">{sec.section}</div>
              )}
              {isCollapsed && (
                <div className="my-2 mx-3 h-px" style={{ background: 'var(--border-subtle)' }} />
              )}

              <div className={isCollapsed ? 'px-2 space-y-0.5' : 'px-2.5 space-y-0.5'}>
                {visible.map((item) => {
                  const isExpanded = expandedItems.includes(item.label)
                  const isParentActive = Boolean(item.children?.some(c => isNavActive(c.href, pathname, allNavHrefs)))
                  const isActive = item.href ? isNavActive(item.href, pathname, allNavHrefs) : isParentActive
                  const Icon = item.icon

                  if (item.children) {
                    // Collapsed: show only icon (no dropdown)
                    if (isCollapsed) {
                      return (
                        <div key={item.label} className="relative group">
                          <button
                    className={cn(
                              "w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-150 cursor-pointer",
                              isParentActive
                                ? "bg-[rgba(217,166,46,0.08)] text-[#D9A62E]"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                            )}
                            title={item.label}
                            onClick={() => toggleExpand(item.label)}
                          >
                            <Icon size={17} />
                          </button>
                        </div>
                      )
                    }

                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={cn(
                            "w-full flex items-center justify-between pl-3 pr-2 py-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer",
                            isParentActive
                              ? "text-[var(--text-primary)] bg-[var(--bg-hover)] font-semibold"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={17} className={isParentActive ? "text-[#D9A62E]" : ""} />
                            <span>{item.label}</span>
                          </div>
                          {isExpanded
                            ? <ChevronDown size={13} className="opacity-60" />
                            : <ChevronRight size={13} className="opacity-40" />}
                        </button>
                        <div className={cn(
                          "overflow-hidden transition-all duration-200",
                          isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                        )}>
                          <div className="ml-[2.125rem] mt-0.5 space-y-0.5 pl-3" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
                            {item.children.map((child) => {
                              const CIcon = child.icon
                              const isChildActive = isNavActive(child.href, pathname, allNavHrefs)
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[0.75rem] transition-all duration-150",
                                    isChildActive
                                      ? "text-[#D9A62E] bg-[rgba(217,166,46,0.08)] font-semibold"
                                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                  )}
                                >
                                  <CIcon size={13} />
                                  <span>{child.label}</span>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Simple link — collapsed: icon only
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 py-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-150",
                        isCollapsed ? "justify-center px-2.5" : "pl-3 pr-2",
                        isActive
                          ? isCollapsed
                            ? "bg-[rgba(217,166,46,0.08)] text-[#D9A62E]"
                            : "sidebar-item-active rounded-l-none"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      <Icon size={17} className={isActive ? "text-[#D9A62E]" : ""} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── User Card (tetap di bawah, tidak ikut scroll) ── */}
      <div className="flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {!isCollapsed ? (
          <div className="sidebar-user-card">
            <div className="w-8 h-8 rounded-full bg-[rgba(217,166,46,0.12)] border border-[rgba(217,166,46,0.2)] flex items-center justify-center flex-shrink-0">
              <span className="text-[0.625rem] font-bold text-[#D9A62E]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.75rem] font-semibold text-[var(--text-primary)] truncate">{userName}</p>
              <p className="text-[0.625rem] text-[var(--text-secondary)] truncate">{roleLabel}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(217,166,46,0.12)] border border-[rgba(217,166,46,0.2)] flex items-center justify-center" title={userName}>
              <span className="text-[0.625rem] font-bold text-[#D9A62E]">{initials}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
