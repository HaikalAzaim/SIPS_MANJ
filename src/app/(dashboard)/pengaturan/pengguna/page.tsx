import { getUserList } from '@/actions/pengaturan'
import { UserTable } from '@/components/pengaturan/user-table'
import { Users } from 'lucide-react'

export default async function PengaturanPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const result = await getUserList({
    page: Number(params.page) || 1,
    search: params.search,
  })

  const superAdminCount = result.data.filter((u: any) => u.role === 'SUPER_ADMIN').length
  const adminCount = result.data.filter((u: any) => u.role === 'ADMIN').length
  const activeCount = result.data.filter((u: any) => u.status).length

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Manajemen Pengguna</h1>
        <p className="page-subtitle">Kelola akses dan akun pengguna ke dalam sistem</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Pengguna', value: result.total, highlight: true },
          { label: 'Super Admin', value: superAdminCount, highlight: false },
          { label: 'Admin', value: adminCount, highlight: false },
          { label: 'Pengguna Aktif', value: activeCount, highlight: false },
        ].map((c) => (
          <div key={c.label} className={`stat-card ${c.highlight ? 'gold' : ''}`}>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <UserTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        limit={result.limit}
      />
    </div>
  )
}
