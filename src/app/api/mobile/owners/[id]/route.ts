import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const owner = await prisma.owner.findFirst({
    where: { id: id, userId },
    include: {
      houses: {
        select: { id: true, street: true, number: true, colony: true, city: true, status: true },
      },
    },
  })

  if (!owner) return notFound('Propietario no encontrado')
  return NextResponse.json(owner)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()

  const updated = await prisma.owner.updateMany({
    where: { id: id, userId },
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      address: body.address,
    },
  })

  if (updated.count === 0) return notFound('Propietario no encontrado')

  const owner = await prisma.owner.findFirst({ where: { id: id, userId } })
  return NextResponse.json(owner)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const deleted = await prisma.owner.deleteMany({ where: { id: id, userId } })
  if (deleted.count === 0) return notFound('Propietario no encontrado')
  return NextResponse.json({ ok: true })
}
