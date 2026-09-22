import { getTahunAjaranList } from '@/actions/tahun-ajaran'
import { TahunAjaranTable } from '@/components/tahun-ajaran/tahun-ajaran-table'
import { PageHeader } from '@/components/ui/page-header'

export default async function TahunAjaranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const result = await getTahunAjaranList({
    page: Number(params.page) || 1,
    search: params.search,
  })

  return (
    <div className="animate-fade-in w-full max-w-full">
      <PageHeader
        title="Tahun Ajaran"
        description="Kelola data tahun ajaran akademik"
      />
      <TahunAjaranTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
      />
    </div>
  )
}
