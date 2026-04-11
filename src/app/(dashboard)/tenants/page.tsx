import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TenantsClient from './TenantsClient'

export default async function TenantsPage() {
  const session = await getServerSession(authOptions)
  const tenants = await prisma.tenant.findMany({
    where: { userId: session!.user.id },
    orderBy: { fullName: 'asc' },
    include: { _count: { select: { contracts: true } } },
  })

  return <TenantsClient tenants={tenants} />
}
