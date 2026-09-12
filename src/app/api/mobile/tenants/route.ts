import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

function optional(value: unknown): string | null {
  const str = String(value ?? '')
  return str.trim() !== '' ? str.trim() : null
}

export async function GET(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const { searchParams } = new URL(request.url)
  const hasActiveContract = searchParams.get('hasActiveContract')

  const tenants = await prisma.tenant.findMany({
    where: {
      userId,
      ...(hasActiveContract === 'true'
        ? { contracts: { some: { status: 'ACTIVE' } } }
        : hasActiveContract === 'false'
        ? { contracts: { none: { status: 'ACTIVE' } } }
        : {}),
    },
    include: {
      contracts: {
        where: { status: 'ACTIVE' },
        select: { id: true, status: true, expirationDate: true },
        take: 1,
      },
    },
    orderBy: { fullName: 'asc' },
  })

  return NextResponse.json(tenants)
}

export async function POST(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()
  const dob = optional(body.dateOfBirth)

  const tenant = await prisma.tenant.create({
    data: {
      userId,
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

  return NextResponse.json(tenant, { status: 201 })
}
