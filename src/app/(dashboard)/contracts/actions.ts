'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { addMonths } from '@/lib/dates'
import {
  contractStatusFromExpiration,
  syncHouseStatusFromContracts,
} from '@/lib/houseContract'
import { requireUserId } from '@/lib/requireUserId'

function revalidateContractPaths(houseId?: string | null) {
  revalidatePath('/')
  if (houseId) revalidatePath(`/houses/${houseId}`)
  revalidatePath('/houses')
}

export async function createContract(formData: FormData) {
  const userId = await requireUserId()
  const startDate = new Date(formData.get('startDate') as string)
  const deadline = parseInt(formData.get('deadline') as string)
  const expirationDate = addMonths(startDate, deadline)
  const houseId = formData.get('houseId') as string

  await prisma.contract.create({
    data: {
      userId,
      houseId,
      tenantId: formData.get('tenantId') as string,
      rentPrice: parseFloat(formData.get('rentPrice') as string),
      depositPrice: parseFloat(formData.get('depositPrice') as string),
      startDate,
      startDateDay: parseInt(formData.get('startDateDay') as string),
      deadline,
      expirationDate,
      witnessName: formData.get('witnessName') as string,
      witness2Name: formData.get('witness2Name') as string,
      signingDate: new Date(),
      status: contractStatusFromExpiration(expirationDate),
    },
  })

  await prisma.house.update({
    where: { id: houseId },
    data: { status: 'RENTED' },
  })

  revalidateContractPaths(houseId)
}

export async function updateContract(id: string, formData: FormData) {
  const userId = await requireUserId()
  const startDate = new Date(formData.get('startDate') as string)
  const deadline = parseInt(formData.get('deadline') as string)
  const expirationDate = addMonths(startDate, deadline)
  const houseId = formData.get('houseId') as string
  const status = contractStatusFromExpiration(expirationDate)

  const existing = await prisma.contract.findFirst({
    where: { id, userId },
    select: { houseId: true },
  })
  if (!existing) throw new Error('Contrato no encontrado')

  await prisma.contract.updateMany({
    where: { id, userId },
    data: {
      houseId,
      tenantId: formData.get('tenantId') as string,
      rentPrice: parseFloat(formData.get('rentPrice') as string),
      depositPrice: parseFloat(formData.get('depositPrice') as string),
      startDate,
      startDateDay: parseInt(formData.get('startDateDay') as string),
      deadline,
      expirationDate,
      witnessName: formData.get('witnessName') as string,
      witness2Name: formData.get('witness2Name') as string,
      status,
    },
  })

  await prisma.house.update({
    where: { id: houseId },
    data: { status: 'RENTED' },
  })

  // If house changed, sync the previous house too
  if (existing.houseId !== houseId) {
    await syncHouseStatusFromContracts(existing.houseId, userId)
    revalidateContractPaths(existing.houseId)
  }

  revalidateContractPaths(houseId)
}

/** Cancelar contrato: delete row + house → Disponible. */
export async function deleteContract(id: string) {
  const userId = await requireUserId()
  const existing = await prisma.contract.findFirst({
    where: { id, userId },
    select: { houseId: true },
  })
  await prisma.contract.deleteMany({ where: { id, userId } })
  if (existing?.houseId) {
    await prisma.house.updateMany({
      where: { id: existing.houseId, userId },
      data: { status: 'AVAILABLE' },
    })
  }
  revalidateContractPaths(existing?.houseId)
}
