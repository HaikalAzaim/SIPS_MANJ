"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  FileText,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  onMenuClick: () => void
}

const bottomNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Siswa',     icon: GraduationCap,   href: '/siswa' },
  { label: 'Pelanggaran', icon: ClipboardList, href: '/pelanggaran' },
  { label: 'Laporan',   icon: FileText,        href: '/laporan/pelanggaran' },
  { label: 'Menu',      icon: Menu,            href: null as unknown as string },
]

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string | null) => {
    if (!href) return false
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="bottom-nav no-print lg:hidden"
      role="navigation"
      aria-label="Navigasi bawah"
    >
      {bottomNavItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)

        if (!item.href) {
          return (
            <button
              key="menu"
              onClick={onMenuClick}
              className="bottom-nav-item"
              aria-label="Buka semua menu"
            >
              <div className="bottom-nav-icon-wrap">
                <Icon size={20} />
              </div>
              <span className="bottom-nav-label">Menu</span>
            </button>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('bottom-nav-item', active && 'bottom-nav-item-active')}
            aria-current={active ? 'page' : undefined}
          >
            <div className={cn('bottom-nav-icon-wrap', active && 'bottom-nav-icon-active')}>
              <Icon size={20} />
              {active && <span className="bottom-nav-indicator" />}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
