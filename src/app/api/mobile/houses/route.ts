import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { HouseStatus, PropertyType } from '@prisma/client'

export async function GET(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as HouseStatus | null
  const propertyType = searchParams.get('propertyType') as PropertyType | null

  const houses = await prisma.house.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
      ...(propertyType ? { propertyType } : {}),
    },
    include: {
      owner: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(houses)
}

export async function POST(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()

  const house = await prisma.house.create({
    data: {
      userId,
      ownerId: body.ownerId,
      name: typeof body.name === 'string' ? body.name.trim() || null : null,
      street: body.street,
      number: body.number,
      colony: body.colony,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      propertyType: body.propertyType as PropertyType,
      status: (body.status as HouseStatus) ?? 'AVAILABLE',
      notes: body.notes || null,
    },
    include: { owner: { select: { id: true, name: true, phone: true } } },
  })

  return NextResponse.json(house, { status: 201 })
}
