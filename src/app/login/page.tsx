"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/auth'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, LogIn, User, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    const result = await loginAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    toast.success('Login berhasil!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#040810] relative overflow-hidden px-4 py-6 sm:py-8 select-none">
      {/* ── BACKGROUND AMBIENT & SUBTLE DECORATIVE ARCS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Navy radial depth gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 18%, #0C213B 0%, #061120 48%, #03070E 100%)',
          }}
        />

        {/* Soft top ambient gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(245,184,46,0.09)_0%,transparent_70%)] blur-3xl" />

        {/* Top-left subtle golden arc rings */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full border border-[#D9A441]/12 opacity-60" />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full border border-[#D9A441]/08 opacity-40" />

        {/* Bottom-right subtle golden arc rings */}
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full border border-[#D9A441]/12 opacity-60" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border border-[#D9A441]/08 opacity-40" />

        {/* Center cyan-navy depth glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.18)_0%,transparent_70%)] blur-2xl" />
      </div>

      {/* ── MAIN VERTICAL COMPOSITION ── */}
      <div className="relative w-full max-w-[460px] mx-auto z-10 flex flex-col items-center">
        
        {/* ── 1. BRANDING SIPS (COMPACT & UNIFIED) ── */}
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Logo Shield */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#D9A441]/16 via-[#D9A441]/08 to-transparent border border-[#D9A441]/30 shadow-[0_0_24px_rgba(245,184,46,0.18)] flex items-center justify-center mb-2.5 transition-transform hover:scale-105 duration-200">
            <Shield size={28} className="text-[#F5B82E] drop-shadow-[0_2px_6px_rgba(245,184,46,0.3)]" />
          </div>

          {/* SIPS Name */}
          <h1 className="text-2xl sm:text-[1.75rem] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F5B82E] to-[#D99A1A] leading-none mb-1">
            SIPS
          </h1>

          {/* Subtitle */}
          <p className="text-[12px] text-[#8FA0B8] tracking-wide mb-2 font-medium">
            Sistem Informasi Pelanggaran Siswa
          </p>

          {/* 2026 Identity Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[rgba(245,184,46,0.07)] border border-[rgba(245,184,46,0.22)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B82E]" />
            <span className="text-[10px] font-bold text-[#F5B82E] tracking-widest">
              2026
            </span>
          </div>
        </div>

        {/* ── 2. CARD LOGIN (PROPORTIONAL 460px & SOLID PREMIUM) ── */}
        <div className="w-full relative bg-[#0C192C]/95 backdrop-blur-xl border border-[#1E324E]/85 rounded-[22px] p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          {/* Top border gold ambient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5B82E]/45 to-transparent" />

          {/* Card Header: Compact & Aligned */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,184,46,0.09)] border border-[rgba(245,184,46,0.24)] flex items-center justify-center flex-shrink-0 text-[#F5B82E] shadow-sm">
              <User size={19} />
            </div>
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-white tracking-tight leading-tight">
                Selamat Datang
              </h2>
              <p className="text-xs text-[#8FA0B8] mt-0.5 font-normal">
                Silakan login untuk melanjutkan
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle size={15} className="flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E1]">
                <Mail size={13} className="text-[#D9A441]" />
                <span>Email</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@sips.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full h-12 px-3.5 rounded-[12px] bg-[#07111E] border border-[#1A2D46] text-sm text-white placeholder:text-[#50657D] focus:outline-none focus:border-[#D9A441] focus:ring-1 focus:ring-[#D9A441] transition-all duration-150"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E1]">
                <Lock size={13} className="text-[#D9A441]" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-3.5 pr-11 rounded-[12px] bg-[#07111E] border border-[#1A2D46] text-sm text-white placeholder:text-[#50657D] focus:outline-none focus:border-[#D9A441] focus:ring-1 focus:ring-[#D9A441] transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8FA0B8] hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-[12px] bg-gradient-to-r from-[#F5B82E] to-[#E5A420] hover:from-[#E5A420] hover:to-[#D49315] active:scale-[0.99] text-[#07111F] text-sm font-bold shadow-[0_4px_16px_rgba(245,184,46,0.22)] flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#07111F]" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── 3. FOOTER (CLOSE & ELEGANT) ── */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#D9A441]/35" />
            <p className="text-[11px] italic text-[#8FA0B8] tracking-wide font-normal">
              &ldquo;Disiplin Hari Ini, Masa Depan Lebih Baik&rdquo;
            </p>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#D9A441]/35" />
          </div>
          <p className="text-[11px] text-[#52667E] tracking-widest font-medium">
            SIPS &copy; 2026
          </p>
        </div>

      </div>
    </div>
  )
}
