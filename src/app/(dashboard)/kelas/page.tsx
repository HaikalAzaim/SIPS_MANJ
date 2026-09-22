import { getKelasList } from '@/actions/kelas'
import { getAllGuru } from '@/actions/guru'
import { KelasTable } from '@/components/kelas/kelas-table'

export default async function KelasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const [result, guruList] = await Promise.all([
    getKelasList({
      page: Number(params.page) || 1,
      search: params.search,
    }),
    getAllGuru(),
  ])

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Data Kelas</h1>
        <p className="page-subtitle">Kelola kelas dan penugasan wali kelas</p>
      </div>

      <KelasTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
        guruList={guruList}
      />
    </div>
  )
}
