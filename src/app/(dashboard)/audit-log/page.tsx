import { getAuditLogList, getAuditLogModules, getAuditLogUsers } from '@/actions/audit-log'
import { AuditLogTable } from '@/components/audit-log/audit-log-table'
import { Shield } from 'lucide-react'

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    action?: string
    module?: string
    userId?: string
    startDate?: string
    endDate?: string
  }>
}) {
  const params = await searchParams
  const [result, modules, users] = await Promise.all([
    getAuditLogList({
      page: Number(params.page) || 1,
      search: params.search,
      action: params.action,
      module: params.module,
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    getAuditLogModules(),
    getAuditLogUsers(),
  ])

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="page-header-wrap">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Rekam jejak semua aktivitas pengguna di sistem</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Log', value: result.total, highlight: true },
          { label: 'Halaman Ini', value: result.data.length, highlight: false },
          { label: 'Modul Terlibat', value: modules.length, highlight: false },
          { label: 'Pengguna Aktif', value: users.length, highlight: false },
        ].map((c) => (
          <div key={c.label} className={`stat-card ${c.highlight ? 'gold' : ''}`}>
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <AuditLogTable
        data={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        modules={modules}
        users={users}
      />
    </div>
  )
}
