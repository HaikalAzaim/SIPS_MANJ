"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Lock, User, Mail, Shield, Calendar } from 'lucide-react'
import { updateProfile, changePassword } from '@/actions/profile'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface ProfileFormProps {
  profile: {
    id: string
    name: string
    email: string
    role: string
    status: boolean
    avatar: string | null
    lastLogin: Date | null
    createdAt: Date
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const roleLabel = profile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await updateProfile({ name, email })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Profil berhasil diperbarui')
    router.refresh()
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    const result = await changePassword({ currentPassword, newPassword, confirmPassword })
    setPwLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Password berhasil diubah')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="grid gap-6 max-w-2xl">
      {/* Profile Info Card */}
      <div className="card-container">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--gold-dim)',
                border: '2px solid var(--gold-border)',
              }}
            >
              <span className="text-base font-bold" style={{ color: 'var(--gold)' }}>
                {name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="info">{roleLabel}</Badge>
                <Badge variant={profile.status ? 'success' : 'danger'}>
                  {profile.status ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body space-y-1">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={12} />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={12} />
            <span>Terdaftar: {formatDate(profile.createdAt)}</span>
          </div>
          {profile.lastLogin && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Shield size={12} />
              <span>Login terakhir: {formatDate(profile.lastLogin)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card-container">
        <div className="card-header">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <User size={14} />
            Edit Profil
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 size={14} className="animate-spin" />}
              <Save size={14} />
              Simpan Perubahan
            </Button>
          </form>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="card-container">
        <div className="card-header">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Lock size={14} />
            Ubah Password
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Password Lama</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={pwLoading} variant="outline" className="w-full sm:w-auto">
              {pwLoading && <Loader2 size={14} className="animate-spin" />}
              <Lock size={14} />
              Ubah Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
