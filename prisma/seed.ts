import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'admin@contratos.com' },
    update: {},
    create: {
      name: 'Rafael Martinez',
      email: 'admin@contratos.com',
      password: hashedPassword,
    },
  })

  console.log('Usuario creado:', user.email)
  console.log('Contraseña: admin123')
  console.log('¡Cambia la contraseña después del primer inicio de sesión!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
