import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized, notFound } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { ContractPDF } from '@/lib/contractPdf'
import React from 'react'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const contract = await prisma.contract.findFirst({
    where: { id: id, userId },
    include: { house: { include: { owner: true } }, tenant: true },
  })

  if (!contract) return notFound('Contrato no encontrado')

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
  }) as unknown as React.ReactElement<DocumentProps>

  const pdfBuffer = await renderToBuffer(element)
  const filename = `CONTRATO_${tenant.fullName.toUpperCase().replace(/ /g, '_')}.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
