import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import HousesClient from './HousesClient'

export default async function HousesPage() {
  const session = await getServerSession(authOptions)
  const [houses, owners] = await Promise.all([
    prisma.house.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { name: true } } },
    }),
    prisma.owner.findMany({
      where: { userId: session!.user.id },
      orderBy: { name: 'asc' },
    }),
  ])

  return <HousesClient houses={houses} owners={owners} />
}
