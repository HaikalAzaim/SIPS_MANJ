import { getSiswaById } from '@/actions/siswa'
import { getThresholds } from '@/actions/dashboard'
import { getStudentAcademicHistory } from '@/actions/kenaikan-kelas'
import { getStatusFromPoin } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, AlertTriangle, Star, Calendar } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { SiswaDetailTabs } from '@/components/siswa/siswa-detail-tabs'

export default async function SiswaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [siswa, thresholds, academicHistory] = await Promise.all([
    getSiswaById(id),
    getThresholds(),
    getStudentAcademicHistory(id),
  ])

  if (!siswa) notFound()

  const statusInfo = getStatusFromPoin(siswa.totalPoin, thresholds as any)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/siswa">
          <Button variant="ghost" size="icon-sm"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detail Siswa</h1>
          <p className="text-[var(--text-secondary)] mt-1">{siswa.nama}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500/30 mx-auto flex items-center justify-center mb-3">
                <User size={32} className="text-gold-400" />
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{siswa.nama}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{siswa.kelas?.namaKelas}</p>
              <Badge variant={
                statusInfo.status === 'Normal' ? 'normal' :
                statusInfo.status === 'Perhatian' ? 'perhatian' :
                statusInfo.status === 'Peringatan' ? 'peringatan' : 'teguran'
              } className="mt-2">
                {statusInfo.status}
              </Badge>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['NISN', siswa.nisn],
                ['NIUP', siswa.niup],
                ['Jenis Kelamin', siswa.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'],
                ['Tempat Lahir', siswa.tempatLahir],
                ['Tanggal Lahir', siswa.tanggalLahir ? formatDate(siswa.tanggalLahir) : '-'],
                ['Alamat', siswa.alamat],
                ['Tahun Masuk', siswa.tahunMasuk],
                ['Wali Kelas', siswa.kelas?.waliKelas?.nama],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{label}</span>
                  <span className="text-[var(--text-primary)] font-medium text-right max-w-[60%]">{value || '-'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card card-gradient gold">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} className="text-[#D9A441]" />
                <span className="text-[11px] text-[var(--text-secondary)]">Total Poin</span>
              </div>
              <p className="text-3xl font-bold text-[#D9A441]">{siswa.totalPoin}</p>
            </div>
            <div className="stat-card card-gradient">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-[var(--text-secondary)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">Total Pelanggaran</span>
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{siswa.totalPelanggaran}</p>
            </div>
            <div className="stat-card card-gradient">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-[var(--text-secondary)]" />
                <span className="text-[11px] text-[var(--text-secondary)]">Status</span>
              </div>
              <Badge variant={
                statusInfo.status === 'Normal' ? 'normal' :
                statusInfo.status === 'Perhatian' ? 'perhatian' :
                statusInfo.status === 'Peringatan' ? 'peringatan' : 'teguran'
              } className="text-base px-4 py-1">
                {statusInfo.status}
              </Badge>
            </div>
          </div>

          {/* Tabbed Content */}
          <SiswaDetailTabs
            pelanggaran={siswa.pelanggaran}
            academicHistory={academicHistory}
          />
        </div>
      </div>
    </div>
  )
}
