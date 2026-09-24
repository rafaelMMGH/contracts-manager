import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { HouseStatus, PropertyType } from '@prisma/client'
import {
  deleteAllHouseBlobs,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const house = await prisma.house.findFirst({
    where: { id: id, userId },
    include: {
      owner: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, pathname: true, sortOrder: true },
      },
      contracts: {
        where: { status: 'ACTIVE' },
        include: {
          tenant: { select: { id: true, fullName: true, phone: true } },
        },
        take: 1,
      },
    },
  })

  if (!house) return notFound('Propiedad no encontrada')
  return NextResponse.json(house)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const updated = await prisma.house.updateMany({
      where: { id: id, userId },
      data: {
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
        status: body.status as HouseStatus,
        notes: (body.notes as string) || null,
      },
    })

    if (updated.count === 0) return notFound('Propiedad no encontrada')

    await syncHouseImages(id, userId, images)

    const house = await prisma.house.findFirst({
      where: { id: id, userId },
      include: houseInclude,
    })

    return NextResponse.json(house)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const house = await prisma.house.findFirst({
    where: { id: id, userId },
    select: { id: true },
  })
  if (!house) return notFound('Propiedad no encontrada')

  await deleteAllHouseBlobs(id)
  await prisma.house.deleteMany({ where: { id: id, userId } })
  return NextResponse.json({ ok: true })
}
