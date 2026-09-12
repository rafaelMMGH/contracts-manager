import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { addMonths } from '@/lib/dates'
import { ContractStatus } from '@prisma/client'

const contractInclude = {
  tenant: { select: { id: true, fullName: true, phone: true, email: true } },
  house: {
    select: {
      id: true, street: true, number: true, colony: true, city: true, state: true,
      propertyType: true, status: true,
      owner: { select: { id: true, name: true } },
    },
  },
}

export async function GET(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as ContractStatus | null

  const contracts = await prisma.contract.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: contractInclude,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(contracts)
}

export async function POST(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()
  const startDate = new Date(body.startDate)
  const deadline = parseInt(body.deadline)
  const expirationDate = addMonths(startDate, deadline)

  const contract = await prisma.contract.create({
    data: {
      userId,
      houseId: body.houseId,
      tenantId: body.tenantId,
      rentPrice: parseFloat(body.rentPrice),
      depositPrice: parseFloat(body.depositPrice),
      startDate,
      startDateDay: parseInt(body.startDateDay),
      deadline,
      expirationDate,
      witnessName: body.witnessName,
      witness2Name: body.witness2Name,
      signingDate: body.signingDate ? new Date(body.signingDate) : new Date(),
      status: 'ACTIVE',
    },
    include: contractInclude,
  })

  await prisma.house.updateMany({
    where: { id: body.houseId, userId },
    data: { status: 'RENTED' },
  })

  return NextResponse.json(contract, { status: 201 })
}
