import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { HouseStatus, PropertyType } from '@prisma/client'
import {
  normalizeHouseImages,
  parseLatitude,
  parseLongitude,
  syncHouseImages,
  validateCoords,
} from '@/lib/houseImages'

const houseInclude = {
  owner: { select: { id: true, name: true, phone: true } },
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { id: true, url: true, pathname: true, sortOrder: true },
  },
}

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
    include: houseInclude,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(houses)
}

export async function POST(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  try {
    const { latitude, longitude } = validateCoords(
      parseLatitude(body.latitude),
      parseLongitude(body.longitude)
    )
    const images = normalizeHouseImages(body.images, userId)

    const house = await prisma.house.create({
      data: {
        userId,
        ownerId: body.ownerId as string,
        name:
          typeof body.name === 'string' ? body.name.trim() || null : null,
        street: body.street as string,
        number: body.number as string,
        colony: body.colony as string,
        city: body.city as string,
        state: body.state as string,
        zipCode: body.zipCode as string,
        latitude,
        longitude,
        propertyType: body.propertyType as PropertyType,
        status: (body.status as HouseStatus) ?? 'AVAILABLE',
        notes: (body.notes as string) || null,
      },
      include: houseInclude,
    })

    if (images.length > 0) {
      await syncHouseImages(house.id, userId, images)
      const refreshed = await prisma.house.findFirst({
        where: { id: house.id, userId },
        include: houseInclude,
      })
      return NextResponse.json(refreshed, { status: 201 })
    }

    return NextResponse.json(house, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
