import { getGuruList } from '@/actions/guru'
import { GuruTable } from '@/components/guru/guru-table'

export default async function GuruPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const result = await getGuruList({
    page: Number(params.page) || 1,
    search: params.search,
  })

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Data Guru</h1>
        <p className="page-subtitle">Kelola data guru dan wali kelas</p>
      </div>

      <GuruTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
      />
    </div>
  )
}
