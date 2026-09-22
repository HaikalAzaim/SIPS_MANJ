"use client"

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { upsertSystemSetting } from '@/actions/pengaturan'
import { toast } from 'sonner'
import { Save, FileSignature, BookOpen, Eye, EyeOff } from 'lucide-react'

interface SignatorySettingsProps {
  initialValues: {
    kepalaSekolahNama: string
    kepalaSekolahNip: string
    stafKesiswaanNama: string
    stafKesiswaanNip: string
    showTtdLaporan: boolean
    // TTD Surat Teguran
    suratTeguranPenandatanganNama: string
    suratTeguranPenandatanganJabatan: string
    suratTeguranPenandatanganNip: string
    suratTeguranTempatTanggal: string
    showTtdSuratTeguran: boolean
  }
}

export function SignatorySettings({ initialValues }: SignatorySettingsProps) {
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState(initialValues)

  function handleChange(key: keyof typeof values, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await Promise.all([
          // TTD Laporan
          upsertSystemSetting('show_ttd_laporan', String(values.showTtdLaporan), 'Tampilkan tanda tangan di PDF laporan'),
          upsertSystemSetting('kepala_sekolah_nama', values.kepalaSekolahNama, 'Nama Kepala Sekolah untuk tanda tangan laporan'),
          upsertSystemSetting('kepala_sekolah_nip', values.kepalaSekolahNip, 'NIP Kepala Sekolah'),
          upsertSystemSetting('staf_kesiswaan_nama', values.stafKesiswaanNama, 'Nama Staf Kesiswaan untuk tanda tangan laporan'),
          upsertSystemSetting('staf_kesiswaan_nip', values.stafKesiswaanNip, 'NIP Staf Kesiswaan'),
          // TTD Surat Teguran
          upsertSystemSetting('show_ttd_surat_teguran', String(values.showTtdSuratTeguran), 'Tampilkan tanda tangan di surat teguran'),
          upsertSystemSetting('surat_teguran_penandatangan_nama', values.suratTeguranPenandatanganNama, 'Nama penandatangan surat teguran'),
          upsertSystemSetting('surat_teguran_penandatangan_jabatan', values.suratTeguranPenandatanganJabatan, 'Jabatan penandatangan surat teguran'),
          upsertSystemSetting('surat_teguran_penandatangan_nip', values.suratTeguranPenandatanganNip, 'NIP penandatangan surat teguran'),
          upsertSystemSetting('surat_teguran_tempat_tanggal', values.suratTeguranTempatTanggal, 'Tempat dan tanggal surat teguran'),
        ])
        toast.success('Pengaturan tanda tangan berhasil disimpan')
      } catch {
        toast.error('Gagal menyimpan pengaturan')
      }
    })
  }

  const laporanFields = [
    { key: 'kepalaSekolahNama' as const, label: 'Nama Kepala Sekolah', placeholder: 'Contoh: Drs. H. Ahmad Fauzi, M.Pd.' },
    { key: 'kepalaSekolahNip' as const, label: 'NIUP / NIP Kepala Sekolah', placeholder: 'Contoh: 19720516 199803 1 002' },
    { key: 'stafKesiswaanNama' as const, label: 'Nama Staf Kesiswaan', placeholder: 'Contoh: Siti Nurhayati, S.Pd.' },
    { key: 'stafKesiswaanNip' as const, label: 'NIUP / NIP Staf Kesiswaan', placeholder: 'Contoh: 19891224 201903 1 005' },
  ]

  const suratTeguranFields = [
    { key: 'suratTeguranPenandatanganNama' as const, label: 'Nama Penandatangan', placeholder: 'Contoh: Drs. H. Ahmad Fauzi, M.Pd.', colSpan: true },
    { key: 'suratTeguranPenandatanganJabatan' as const, label: 'Jabatan', placeholder: 'Contoh: Kepala Sekolah', colSpan: false },
    { key: 'suratTeguranPenandatanganNip' as const, label: 'NIP / NIUP Penandatangan', placeholder: 'Contoh: 19720516 199803 1 002', colSpan: false },
    { key: 'suratTeguranTempatTanggal' as const, label: 'Tempat (kota surat)', placeholder: 'Contoh: Paiton', colSpan: true },
  ]

  return (
    <div className="space-y-6">
      {/* ── TTD Laporan ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature size={18} className="text-gold-400" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Tanda Tangan Laporan PDF</h3>
          </div>
          {/* Toggle show/hide */}
          <button
            type="button"
            onClick={() => handleChange('showTtdLaporan', !values.showTtdLaporan)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              values.showTtdLaporan
                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.07)]'
            }`}
            title={values.showTtdLaporan ? 'Klik untuk menyembunyikan TTD di laporan' : 'Klik untuk menampilkan TTD di laporan'}
          >
            {values.showTtdLaporan ? <Eye size={13} /> : <EyeOff size={13} />}
            {values.showTtdLaporan ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] -mt-2">
          Data ini akan muncul di bagian bawah PDF laporan pelanggaran.
          {!values.showTtdLaporan && <span className="text-amber-400 ml-1">⚠ TTD sedang disembunyikan — tidak akan muncul di laporan.</span>}
        </p>
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${values.showTtdLaporan ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {laporanFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">{f.label}</label>
              <Input
                value={values[f.key] as string}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="text-sm"
                disabled={!values.showTtdLaporan}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,0.07)]" />

      {/* ── TTD Surat Teguran ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-gold-400" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Tanda Tangan Surat Teguran</h3>
          </div>
          {/* Toggle show/hide */}
          <button
            type="button"
            onClick={() => handleChange('showTtdSuratTeguran', !values.showTtdSuratTeguran)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              values.showTtdSuratTeguran
                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.07)]'
            }`}
            title={values.showTtdSuratTeguran ? 'Klik untuk menyembunyikan TTD di surat teguran' : 'Klik untuk menampilkan TTD di surat teguran'}
          >
            {values.showTtdSuratTeguran ? <Eye size={13} /> : <EyeOff size={13} />}
            {values.showTtdSuratTeguran ? 'Tampil' : 'Tersembunyi'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] -mt-2">
          Data ini akan muncul di bagian bawah setiap surat teguran yang dicetak.
          {!values.showTtdSuratTeguran && <span className="text-amber-400 ml-1">⚠ TTD sedang disembunyikan — tidak akan muncul di surat teguran.</span>}
        </p>
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${values.showTtdSuratTeguran ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {suratTeguranFields.map((f) => (
            <div key={f.key} className={`space-y-1.5 ${f.colSpan ? 'sm:col-span-2' : ''}`}>
              <label className="text-xs font-medium text-[var(--text-secondary)]">{f.label}</label>
              <Input
                value={values[f.key] as string}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="text-sm"
                disabled={!values.showTtdSuratTeguran}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-1">
        <Button
          onClick={handleSave}
          disabled={isPending}
          size="sm"
          className="bg-gold-500 hover:bg-gold-600 text-white"
        >
          <Save size={14} className="mr-1.5" />
          {isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  )
}
