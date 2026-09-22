import { prisma } from './prisma'
import { getSession } from './auth'

export async function createAuditLog(params: {
  action: string
  module: string
  recordId?: string
  description?: string
}) {
  try {
    const session = await getSession()
    if (!session) return

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: params.action,
        module: params.module,
        recordId: params.recordId || null,
        description: params.description || null,
        ipAddress: null,
        userAgent: null,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
