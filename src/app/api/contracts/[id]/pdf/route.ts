import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { ContractPDF } from '@/lib/contractPdf'
import React from 'react'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('No autorizado', { status: 401 })

  const contract = await prisma.contract.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      house: {
        include: { owner: true },
      },
      tenant: true,
    },
  })

  if (!contract) return new NextResponse('Contrato no encontrado', { status: 404 })

  const { house, tenant } = contract
  const houseAddress = `${house.street} #${house.number}, ${house.colony}, ${house.city}, ${house.state}`

  const element = React.createElement(ContractPDF, {
    data: {
      ownerName: house.owner.name,
      ownerAddress: house.owner.address,
      tenantName: tenant.fullName,
      houseAddress,
      houseType: house.propertyType,
      rentPrice: Number(contract.rentPrice),
      depositPrice: Number(contract.depositPrice),
      startDate: contract.startDate,
      startDateDay: contract.startDateDay,
      deadline: contract.deadline,
      expirationDate: contract.expirationDate,
      witnessName: contract.witnessName,
      witness2Name: contract.witness2Name,
      signingDate: contract.signingDate,
    },
  }) as any

  const pdfBuffer = await renderToBuffer(element)

  const tenantName = tenant.fullName.toUpperCase().replace(/ /g, '_')
  const filename = `CONTRATO_${tenantName}.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}
