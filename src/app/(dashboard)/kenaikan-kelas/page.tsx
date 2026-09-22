import { getPromotionProcesses, getPromotionStats } from '@/actions/kenaikan-kelas'
import { getAllTahunAjaran } from '@/actions/tahun-ajaran'
import { PromotionStats } from '@/components/kenaikan-kelas/promotion-stats'
import { PromotionProcessTable } from '@/components/kenaikan-kelas/promotion-process-table'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function KenaikanKelasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; tahunAjaranId?: string }>
}) {
  const params = await searchParams
  const [result, stats, tahunAjaranList] = await Promise.all([
    getPromotionProcesses({
      page: Number(params.page) || 1,
      search: params.search,
      status: params.status,
      tahunAjaranId: params.tahunAjaranId,
    }),
    getPromotionStats(),
    getAllTahunAjaran(),
  ])

  return (
    <div className="animate-fade-in w-full max-w-full">
      <PageHeader
        title="Kenaikan Kelas"
        description="Kelola proses kenaikan kelas siswa antar tahun ajaran"
        action={
          <Link href="/kenaikan-kelas/proses">
            <Button><Plus size={15} /> Proses Kenaikan Kelas</Button>
          </Link>
        }
      />

      <PromotionStats {...stats} />

      <PromotionProcessTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
        tahunAjaranList={tahunAjaranList}
      />
    </div>
  )
}
