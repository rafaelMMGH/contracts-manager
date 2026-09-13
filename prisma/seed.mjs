import { PrismaClient } from '@prisma/client'
import bcryptModule from 'bcryptjs'

const bcrypt = bcryptModule.default ?? bcryptModule
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
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
