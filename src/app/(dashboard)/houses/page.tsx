import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { attachedContractWhere } from '@/lib/houseContract'
import HousesClient from './HousesClient'
import MobileHousesListRedirect from './MobileHousesListRedirect'

export default async function HousesPage() {
  const session = await getServerSession(authOptions)
  const [houses, owners] = await Promise.all([
    prisma.house.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true } },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, pathname: true, sortOrder: true },
        },
        contracts: {
          where: attachedContractWhere,
          select: { id: true },
          take: 1,
        },
      },
    }),
    prisma.owner.findMany({
      where: { userId: session!.user.id },
      orderBy: { name: 'asc' },
    }),
  ])

  const housesForClient = houses.map(({ contracts, ...house }) => ({
    ...house,
    hasContract: contracts.length > 0,
  }))

  return (
    <MobileHousesListRedirect>
      <HousesClient houses={housesForClient} owners={owners} />
    </MobileHousesListRedirect>
  )
}
