import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/requireUserId'
import OwnersClient from './OwnersClient'

export default async function OwnersPage() {
  const userId = await requireUserId()

  const owners = await prisma.owner.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { houses: true } } },
  })

  return <OwnersClient owners={owners} />
}
