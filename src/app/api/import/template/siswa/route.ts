import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSiswaTemplate } from '@/lib/excel-template'

export async function GET() {
  try {
    await requireAuth()

    // Fetch active classes from database
    const kelasList = await prisma.kelas.findMany({
      where: { deletedAt: null, status: true },
      select: { id: true, namaKelas: true, tingkat: true, jurusan: true },
      orderBy: [{ tingkat: 'asc' }, { namaKelas: 'asc' }],
    })

    const buffer = await generateSiswaTemplate(kelasList)

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template_import_siswa.xlsx"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error generating siswa template:', error)
    return NextResponse.json({ error: 'Gagal membuat template' }, { status: 500 })
  }
}
