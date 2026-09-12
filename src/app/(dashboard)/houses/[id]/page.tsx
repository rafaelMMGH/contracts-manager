import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { ViewTransition } from 'react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMobileHouseDetail } from '@/lib/mobileHouses'
import MobileHouseDetail from '@/components/mobile/MobileHouseDetail'

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [detail, owners, tenants] = await Promise.all([
    getMobileHouseDetail(userId, id),
    prisma.owner.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.tenant.findMany({
      where: { userId },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
    }),
  ])

  if (!detail) notFound()

  return (
    <ViewTransition
      enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
      exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
      default="none"
    >
      <MobileHouseDetail
        house={detail.house}
        owners={owners}
        tenants={tenants}
        formDefaults={detail.formDefaults}
        contractDefaults={detail.contractDefaults}
        contractTenantName={detail.contractTenantName}
      />
    </ViewTransition>
  )
}
