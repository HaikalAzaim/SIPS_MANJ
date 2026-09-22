"use client"

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    name: string
    role: 'SUPER_ADMIN' | 'ADMIN'
  }
  notificationCount: number
}

export function DashboardShell({ children, user, notificationCount }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user.name}
        userRole={user.role}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="main-area">
        <Topbar
          userName={user.name}
          userRole={user.role}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          notificationCount={notificationCount}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
