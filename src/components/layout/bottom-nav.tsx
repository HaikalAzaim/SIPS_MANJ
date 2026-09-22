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
  role?: 'SUPER_ADMIN' | 'ADMIN'
}

const allBottomNavItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard',            roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Siswa',       icon: GraduationCap,   href: '/siswa',                roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Pelanggaran', icon: ClipboardList,   href: '/pelanggaran',          roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Laporan',     icon: FileText,        href: '/laporan/pelanggaran',  roles: ['SUPER_ADMIN'] },
  { label: 'Menu',        icon: Menu,            href: null as unknown as string, roles: ['SUPER_ADMIN', 'ADMIN'] },
]

export function BottomNav({ onMenuClick, role = 'ADMIN' }: BottomNavProps) {
  const pathname = usePathname()

  // Filter items by role
  const navItems = allBottomNavItems.filter(item => item.roles.includes(role))

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
      {navItems.map((item) => {
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

