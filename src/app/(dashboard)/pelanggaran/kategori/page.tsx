import { getKategoriList } from '@/actions/kategori'
import { KategoriTable } from '@/components/pelanggaran/kategori-table'

export default async function KategoriPelanggaranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; tingkat?: string }>
}) {
  const params = await searchParams
  const result = await getKategoriList({
    page: Number(params.page) || 1,
    search: params.search,
  })

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Kategori Pelanggaran</h1>
        <p className="page-subtitle">Kelola jenis pelanggaran dan bobot poin</p>
      </div>

      <KategoriTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
      />
    </div>
  )
}
