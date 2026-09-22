'use server'

import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth'

export async function getAuditLogList(params: {
  page?: number
  limit?: number
  search?: string
  action?: string
  module?: string
  userId?: string
  startDate?: string
  endDate?: string
}) {
  await requireSuperAdmin()

  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.search) {
    where.OR = [
      { description: { contains: params.search } },
      { recordId: { contains: params.search } },
    ]
  }

  if (params.action) where.action = params.action
  if (params.module) where.module = params.module
  if (params.userId) where.userId = params.userId

  if (params.startDate || params.endDate) {
    where.createdAt = {}
    if (params.startDate) where.createdAt.gte = new Date(params.startDate)
    if (params.endDate) where.createdAt.lte = new Date(params.endDate + 'T23:59:59')
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        module: true,
        recordId: true,
        description: true,
        ipAddress: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ])

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getAuditLogModules() {
  await requireSuperAdmin()
  const results = await prisma.auditLog.findMany({
    distinct: ['module'],
    select: { module: true },
    orderBy: { module: 'asc' },
  })
  return results.map((r) => r.module)
}

export async function getAuditLogUsers() {
  await requireSuperAdmin()
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
