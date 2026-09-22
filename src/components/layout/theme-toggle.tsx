"use client"

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      className="theme-toggle-btn"
    >
      <span className={`theme-toggle-icon ${!isDark ? 'active' : ''}`}>
        <Sun size={13} />
      </span>
      <span className={`theme-toggle-icon ${isDark ? 'active' : ''}`}>
        <Moon size={13} />
      </span>
    </button>
  )
}
