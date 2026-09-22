import { getThresholdList, getSystemSettings } from '@/actions/pengaturan'
import { ThresholdManager } from '@/components/pengaturan/threshold-manager'
import { SignatorySettings } from '@/components/pengaturan/signatory-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Shield, Info } from 'lucide-react'

export default async function PengaturanSistemPage() {
  const [thresholds, settings] = await Promise.all([
    getThresholdList(),
    getSystemSettings(),
  ])

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value || ''
  const signatoryValues = {
    kepalaSekolahNama:               getSetting('kepala_sekolah_nama'),
    kepalaSekolahNip:                getSetting('kepala_sekolah_nip'),
    stafKesiswaanNama:               getSetting('staf_kesiswaan_nama'),
    stafKesiswaanNip:                getSetting('staf_kesiswaan_nip'),
    showTtdLaporan:                  getSetting('show_ttd_laporan') !== 'false',
    suratTeguranPenandatanganNama:    getSetting('surat_teguran_penandatangan_nama'),
    suratTeguranPenandatanganJabatan: getSetting('surat_teguran_penandatangan_jabatan'),
    suratTeguranPenandatanganNip:     getSetting('surat_teguran_penandatangan_nip'),
    suratTeguranTempatTanggal:        getSetting('surat_teguran_tempat_tanggal'),
    showTtdSuratTeguran:              getSetting('show_ttd_surat_teguran') !== 'false',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Settings size={22} className="text-gold-400" />
          Pengaturan Sistem
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Konfigurasi threshold poin dan parameter sistem</p>
      </div>

      {/* Threshold Preview */}
      {thresholds.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {thresholds.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: `${t.warna}22`, color: t.warna, border: `1px solid ${t.warna}44` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: t.warna }} />
              {t.namaStatus}
              <span className="text-xs opacity-70">
                {t.minimumPoin}+
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threshold Manager */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <ThresholdManager thresholds={thresholds} />
          </Card>

          {/* Tanda Tangan Laporan */}
          <Card className="p-6">
            <SignatorySettings initialValues={signatoryValues} />
          </Card>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info size={16} className="text-gold-400" />
                Cara Kerja Threshold
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--text-secondary)] space-y-2">
              <p>Threshold poin digunakan untuk menentukan <strong className="text-[var(--text-primary)]">status</strong> seorang siswa berdasarkan total poin pelanggaran yang terakumulasi.</p>
              <p>Sistem akan <strong className="text-[var(--text-primary)]">otomatis membuat notifikasi</strong> setiap kali siswa mencapai batas threshold tertentu.</p>
              <p>Pastikan threshold ditulis secara berurutan dari poin terendah ke tertinggi.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield size={16} className="text-gold-400" />
                Contoh Konfigurasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Normal', range: '0 – 25 poin', color: '#22c55e' },
                { label: 'Perhatian', range: '26 – 50 poin', color: '#f59e0b' },
                { label: 'Peringatan', range: '51 – 75 poin', color: '#f97316' },
                { label: 'Teguran', range: '76+ poin', color: '#ef4444' },
              ].map((e) => (
                <div key={e.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    <span style={{ color: e.color }}>{e.label}</span>
                  </span>
                  <span className="text-[var(--text-secondary)]">{e.range}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
