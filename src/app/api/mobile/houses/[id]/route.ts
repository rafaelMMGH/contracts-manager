import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { HouseStatus, PropertyType } from '@prisma/client'

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
      contracts: {
        where: { status: 'ACTIVE' },
        include: { tenant: { select: { id: true, fullName: true, phone: true } } },
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

  const body = await request.json()

  const updated = await prisma.house.updateMany({
    where: { id: id, userId },
    data: {
      ownerId: body.ownerId,
      name: typeof body.name === 'string' ? body.name.trim() || null : null,
      street: body.street,
      number: body.number,
      colony: body.colony,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      propertyType: body.propertyType as PropertyType,
      status: body.status as HouseStatus,
      notes: body.notes || null,
    },
  })

  if (updated.count === 0) return notFound('Propiedad no encontrada')

  const house = await prisma.house.findFirst({
    where: { id: id, userId },
    include: { owner: { select: { id: true, name: true, phone: true } } },
  })

  return NextResponse.json(house)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const deleted = await prisma.house.deleteMany({ where: { id: id, userId } })
  if (deleted.count === 0) return notFound('Propiedad no encontrada')
  return NextResponse.json({ ok: true })
}
