import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ContractsClient from './ContractsClient'

export default async function ContractsPage() {
  const session = await getServerSession(authOptions)
  const [contracts, houses, tenants] = await Promise.all([
    prisma.contract.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        house: { select: { street: true, number: true, colony: true } },
        tenant: { select: { fullName: true } },
      },
    }),
    prisma.house.findMany({
      where: { userId: session!.user.id },
      orderBy: { street: 'asc' },
      include: { owner: true },
    }),
    prisma.tenant.findMany({
      where: { userId: session!.user.id },
      orderBy: { fullName: 'asc' },
    }),
  ])

  return <ContractsClient contracts={contracts} houses={houses} tenants={tenants} />
}
