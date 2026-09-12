import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

function optional(value: unknown): string | null {
  const str = String(value ?? '')
  return str.trim() !== '' ? str.trim() : null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const tenant = await prisma.tenant.findFirst({
    where: { id: id, userId },
    include: {
      contracts: {
        include: {
          house: { select: { street: true, number: true, colony: true, city: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!tenant) return notFound('Inquilino no encontrado')
  return NextResponse.json(tenant)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()
  const dob = optional(body.dateOfBirth)

  const updated = await prisma.tenant.updateMany({
    where: { id: id, userId },
    data: {
      fullName: body.fullName,
      phone: body.phone,
      dateOfBirth: dob ? new Date(dob) : null,
      curpRfc: optional(body.curpRfc),
      email: optional(body.email),
      currentAddress: optional(body.currentAddress),
      emergencyContactName: optional(body.emergencyContactName),
      emergencyContactPhone: optional(body.emergencyContactPhone),
      referenceName: optional(body.referenceName),
      referencePhone: optional(body.referencePhone),
      referenceRelationship: optional(body.referenceRelationship),
      employerName: optional(body.employerName),
      employerPhone: optional(body.employerPhone),
      monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
    },
  })

  if (updated.count === 0) return notFound('Inquilino no encontrado')

  const tenant = await prisma.tenant.findFirst({ where: { id: id, userId } })
  return NextResponse.json(tenant)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const deleted = await prisma.tenant.deleteMany({ where: { id: id, userId } })
  if (deleted.count === 0) return notFound('Inquilino no encontrado')
  return NextResponse.json({ ok: true })
}
