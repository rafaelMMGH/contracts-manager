import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { addMonths } from '@/lib/dates'
import { ContractStatus } from '@prisma/client'

const contractInclude = {
  tenant: { select: { id: true, fullName: true, phone: true, email: true } },
  house: {
    select: {
      id: true, street: true, number: true, colony: true, city: true, state: true,
      propertyType: true, status: true,
      owner: { select: { id: true, name: true, address: true } },
    },
  },
  notifications: true,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const contract = await prisma.contract.findFirst({
    where: { id: id, userId },
    include: contractInclude,
  })

  if (!contract) return notFound('Contrato no encontrado')
  return NextResponse.json(contract)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const body = await request.json()
  const startDate = new Date(body.startDate)
  const deadline = parseInt(body.deadline)
  const expirationDate = addMonths(startDate, deadline)

  const updated = await prisma.contract.updateMany({
    where: { id: id, userId },
    data: {
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
      signingDate: body.signingDate ? new Date(body.signingDate) : undefined,
      status: body.status as ContractStatus,
    },
  })

  if (updated.count === 0) return notFound('Contrato no encontrado')

  const contract = await prisma.contract.findFirst({
    where: { id: id, userId },
    include: contractInclude,
  })

  return NextResponse.json(contract)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const deleted = await prisma.contract.deleteMany({
    where: { id: id, userId },
  })

  if (deleted.count === 0) return notFound('Contrato no encontrado')
  return NextResponse.json({ ok: true })
}
