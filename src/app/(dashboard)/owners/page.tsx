import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OwnersClient from './OwnersClient'

export default async function OwnersPage() {
  const session = await getServerSession(authOptions)
  const owners = await prisma.owner.findMany({
    where: { userId: session!.user.id },
    orderBy: { name: 'asc' },
    include: { _count: { select: { houses: true } } },
  })

  return <OwnersClient owners={owners} />
}
