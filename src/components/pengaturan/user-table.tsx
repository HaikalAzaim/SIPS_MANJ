"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, Users, ToggleLeft, ToggleRight, X, RotateCcw } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { createUser, updateUser, deleteUser, toggleUserStatus } from '@/actions/pengaturan'
import { toast } from 'sonner'
import { cn, formatDate } from '@/lib/utils'

interface UserTableProps {
  data: any[]
  total: number
  page: number
  totalPages: number
  limit: number
}

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
}

export function UserTable({ data, total, page, totalPages, limit }: UserTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const isFiltered = Boolean(search)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) params.set('search', search)
    else params.delete('search')
    params.set('page', '1')
    router.push(`/pengaturan/pengguna?${params.toString()}`)
  }

  function handleClearSearch() {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.set('page', '1')
    router.push(`/pengaturan/pengguna?${params.toString()}`)
  }

  function handleResetAll() {
    setSearch('')
    router.push('/pengaturan/pengguna')
  }

  function handlePage(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    router.push(`/pengaturan/pengguna?${params.toString()}`)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const password = form.get('password') as string
    const formData = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      role: form.get('role') as any,
      ...(password ? { password } : {}),
    }

    const result = editData
      ? await updateUser(editData.id, formData)
      : await createUser(formData as any)

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(editData ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan')
    setShowForm(false)
    setEditData(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const result = await deleteUser(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Pengguna berhasil dihapus')
    router.refresh()
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    const result = await toggleUserStatus(id, !currentStatus)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Pengguna ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
    router.refresh()
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="table-toolbar">
        <div className="table-toolbar-group">
          <form onSubmit={handleSearch} className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="search-input-field"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="search-clear-btn"
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetAll}
              className="toolbar-reset-btn"
              title="Reset semua filter"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <Button onClick={() => { setEditData(null); setShowForm(true) }} className="flex-shrink-0">
          <Plus size={15} />
          Tambah Pengguna
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }}>No</th>
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th style={{ width: '9.5rem' }}>Role</th>
                <th style={{ width: '7.5rem' }}>Status</th>
                <th style={{ width: '11rem' }}>Login Terakhir</th>
                <th style={{ width: '11rem' }}>Dibuat</th>
                <th className="td-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      icon={<Users size={22} />}
                      title={isFiltered ? "Tidak ada pengguna yang sesuai" : "Belum ada data pengguna"}
                      description={isFiltered ? "Coba gunakan kata kunci lain untuk mencari akun." : "Tambahkan pengguna baru ke dalam sistem."}
                      action={
                        isFiltered ? (
                          <Button size="sm" variant="outline" onClick={handleResetAll}>
                            <RotateCcw size={13} />
                            Reset Filter
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => { setEditData(null); setShowForm(true) }}>
                            <Plus size={14} />
                            Tambah Pengguna
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((u, i) => (
                  <tr key={u.id}>
                    <td className="td-mono">{startItem + i}</td>
                    <td className="td-primary whitespace-nowrap font-medium">{u.name}</td>
                    <td className="td-muted text-[13px]">{u.email}</td>
                    <td>
                      <span className={cn(
                        "badge",
                        u.role === 'SUPER_ADMIN' ? "badge-berat" : "badge-ringan"
                      )}>
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <span className={cn(
                        "badge",
                        u.status ? "badge-ringan" : "badge-sangat-berat"
                      )}>
                        {u.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-[#8FA4BD] text-[12px]">{u.lastLogin ? formatDate(u.lastLogin) : '-'}</td>
                    <td className="whitespace-nowrap text-[#64748B] text-[12px]">{formatDate(u.createdAt)}</td>
                    <td className="td-actions">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditData(u); setShowForm(true) }}
                          className="action-btn"
                          title="Edit pengguna"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={cn("action-btn", u.status ? "text-[#D9A62E] hover:text-white" : "text-[#22c55e] hover:text-white")}
                          title={u.status ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {u.status ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="action-btn danger" title="Hapus pengguna">
                              <Trash2 size={13} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin menghapus pengguna <strong>{u.name}</strong>? Data terkait akan tetap tersimpan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(u.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {totalPages > 1 && (
          <div className="table-info-bar">
            <span className="table-info-text">
              Menampilkan {startItem}–{endItem} dari {total} pengguna
            </span>
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => handlePage(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2
                if (p < 1 || p > totalPages) return null
                return (
                  <button
                    key={p}
                    className={cn("pagination-btn", p === page && "active")}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </button>
                )
              })}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditData(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={18} className="text-gold-400" />
              {editData ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </DialogTitle>
            <DialogDescription>
              {editData ? 'Kosongkan password jika tidak ingin mengubah' : 'Isi semua field yang diperlukan'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input id="name" name="name" defaultValue={editData?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" defaultValue={editData?.email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {editData ? '(kosongkan jika tidak diubah)' : '*'}</Label>
              <Input id="password" name="password" type="password" required={!editData} placeholder="Min. 6 karakter" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select name="role" defaultValue={editData?.role || 'ADMIN'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editData ? String(editData.status) : 'true'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                {editData ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
