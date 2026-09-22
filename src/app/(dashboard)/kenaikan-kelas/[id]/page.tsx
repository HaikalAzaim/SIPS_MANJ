import { getPromotionById } from '@/actions/kenaikan-kelas'
import { PromotionDetailTabs } from '@/components/kenaikan-kelas/promotion-detail-tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function KenaikanKelasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const process = await getPromotionById(id)

  if (!process) notFound()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/kenaikan-kelas">
          <Button variant="ghost" size="icon-sm"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
          <h1 className="text-[1.375rem] font-bold text-[var(--text-primary)] tracking-tight">
            Detail Kenaikan Kelas
          </h1>
          <p className="text-[0.8125rem] text-[var(--text-secondary)] mt-1">
            {process.dariTahunAjaran?.nama} → {process.keTahunAjaran?.nama}
          </p>
        </div>
      </div>

      <PromotionDetailTabs process={process} />
    </div>
  )
}
