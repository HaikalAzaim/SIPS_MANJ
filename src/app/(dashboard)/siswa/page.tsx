import { getSiswaList } from '@/actions/siswa'
import { getAllKelas } from '@/actions/kelas'
import { getThresholds } from '@/actions/dashboard'
import { getStatusFromPoin } from '@/lib/utils'
import { SiswaTable } from '@/components/siswa/siswa-table'

export default async function SiswaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; kelasId?: string }>
}) {
  const params = await searchParams
  const [result, kelasList, thresholds] = await Promise.all([
    getSiswaList({
      page: Number(params.page) || 1,
      search: params.search,
      kelasId: params.kelasId,
    }),
    getAllKelas(),
    getThresholds(),
  ])

  const dataWithStatus = result.data.map(s => {
    const statusInfo = getStatusFromPoin(s.totalPoin, thresholds as any)
    return { ...s, statusLabel: statusInfo.status, statusWarna: statusInfo.warna }
  })

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Data Siswa</h1>
        <p className="page-subtitle">Kelola data siswa dan lihat riwayat pelanggaran</p>
      </div>

      <SiswaTable
        data={dataWithStatus}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
        kelasList={kelasList}
        thresholds={thresholds as any}
      />
    </div>
  )
}
