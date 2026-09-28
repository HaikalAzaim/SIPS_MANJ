import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database SIPS (Login Only)...')

  // Bersihkan data user lama
  await prisma.user.deleteMany()

  // Buat Pengguna
  const hashedPassword = await bcrypt.hash('admin123', 12)

  await prisma.user.create({
    data: {
      name: 'Super Administrator',
      email: 'admin@sips.sch.id',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      status: true,
    },
  })

  await prisma.user.create({
    data: {
      name: 'Staf Kesiswaan & BK',
      email: 'gurubk@sips.sch.id',
      password: hashedPassword,
      role: Role.ADMIN,
      status: true,
    },
  })

  console.log('✅ Pengguna berhasil dibuat:')
  console.log('   - admin@sips.sch.id / admin123 (SUPER_ADMIN)')
  console.log('   - gurubk@sips.sch.id / admin123 (ADMIN)')
  console.log('🎉 Seeding selesai!')
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
