import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const owners = await prisma.owner.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(owners)
}

export async function POST(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()

  const owner = await prisma.owner.create({
    data: {
      userId,
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      address: body.address,
    },
  })

  return NextResponse.json(owner, { status: 201 })
}
