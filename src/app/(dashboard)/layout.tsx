import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const notificationCount = await prisma.notification.count({
    where: {
      userId: user.id,
      dibaca: false,
    },
  })

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role }}
      notificationCount={notificationCount}
    >
      {children}
    </DashboardShell>
  )
}
