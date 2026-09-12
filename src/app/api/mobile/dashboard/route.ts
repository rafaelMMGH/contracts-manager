import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const now = new Date()
  const in60Days = new Date(now)
  in60Days.setDate(in60Days.getDate() + 60)

  const [activeCount, expiringContracts] = await Promise.all([
    prisma.contract.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.contract.findMany({
      where: { userId, status: 'ACTIVE', expirationDate: { lte: in60Days } },
      include: {
        tenant: { select: { id: true, fullName: true, phone: true } },
        house: { select: { id: true, street: true, number: true, colony: true, city: true } },
      },
      orderBy: { expirationDate: 'asc' },
    }),
  ])

  return NextResponse.json({ activeCount, expiringContracts })
}
