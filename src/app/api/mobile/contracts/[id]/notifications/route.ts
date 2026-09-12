import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

// GET  — list custom notifications for a contract
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const contract = await prisma.contract.findFirst({ where: { id: id, userId } })
  if (!contract) return notFound('Contrato no encontrado')

  const notifications = await prisma.contractNotification.findMany({
    where: { contractId: id, userId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(notifications)
}

// POST — add a custom notification (daysBeforeExpiry OR specificDate)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const contract = await prisma.contract.findFirst({ where: { id: id, userId } })
  if (!contract) return notFound('Contrato no encontrado')

  const body = await request.json()
  const daysBeforeExpiry = body.daysBeforeExpiry != null ? parseInt(body.daysBeforeExpiry) : null
  const specificDate = body.specificDate ? new Date(body.specificDate) : null

  if (daysBeforeExpiry == null && !specificDate) {
    return NextResponse.json(
      { error: 'Se requiere daysBeforeExpiry o specificDate' },
      { status: 400 }
    )
  }

  const notification = await prisma.contractNotification.create({
    data: {
      contractId: id,
      userId,
      daysBeforeExpiry,
      specificDate,
    },
  })

  return NextResponse.json(notification, { status: 201 })
}

// DELETE — remove a specific notification by id (passed as query param)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const { searchParams } = new URL(request.url)
  const notificationId = searchParams.get('notificationId')
  if (!notificationId) {
    return NextResponse.json({ error: 'notificationId requerido' }, { status: 400 })
  }

  const deleted = await prisma.contractNotification.deleteMany({
    where: { id: notificationId, contractId: id, userId },
  })

  if (deleted.count === 0) return notFound('Notificación no encontrada')
  return NextResponse.json({ ok: true })
}
