import { getPelanggaranList } from '@/actions/pelanggaran'
import { getAllKelas } from '@/actions/kelas'
import { getAllKategori } from '@/actions/kategori'
import { getSiswaForSelect } from '@/actions/siswa'
import { PelanggaranTable } from '@/components/pelanggaran/pelanggaran-table'

export default async function PelanggaranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; kelasId?: string; kategoriId?: string }>
}) {
  const params = await searchParams
  const [result, kelasList, kategoriList, siswaList] = await Promise.all([
    getPelanggaranList({
      page: Number(params.page) || 1,
      search: params.search,
      kelasId: params.kelasId,
      kategoriId: params.kategoriId,
    }),
    getAllKelas(),
    getAllKategori(),
    getSiswaForSelect(),
  ])

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Data Pelanggaran</h1>
        <p className="page-subtitle">Catat dan kelola seluruh pelanggaran siswa</p>
      </div>

      <PelanggaranTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
        siswaList={siswaList as any}
        kelasList={kelasList}
        kategoriList={kategoriList}
      />
    </div>
  )
}
