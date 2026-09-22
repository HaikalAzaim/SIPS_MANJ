import { getAllTahunAjaran } from '@/actions/tahun-ajaran'
import { PromotionWizard } from '@/components/kenaikan-kelas/promotion-wizard'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function KenaikanKelasProcessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  const tahunAjaranList = await getAllTahunAjaran()

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/kenaikan-kelas">
          <Button variant="ghost" size="icon-sm"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
          <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            Proses Kenaikan Kelas
          </h1>
          <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-1">
            Ikuti langkah-langkah berikut untuk memproses kenaikan kelas
          </p>
        </div>
      </div>

      <PromotionWizard
        tahunAjaranList={tahunAjaranList}
        existingProcessId={params.id || null}
      />
    </div>
  )
}
