'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addMonths } from '@/lib/dates'
import { ContractStatus } from '@prisma/client'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autenticado')
  return session.user.id
}

export async function createContract(formData: FormData) {
  const userId = await getUserId()
  const startDate = new Date(formData.get('startDate') as string)
  const deadline = parseInt(formData.get('deadline') as string)
  const expirationDate = addMonths(startDate, deadline)

  const contract = await prisma.contract.create({
    data: {
      userId,
      houseId: formData.get('houseId') as string,
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
      status: 'ACTIVE',
    },
  })

  // Mark house as rented
  await prisma.house.update({
    where: { id: formData.get('houseId') as string },
    data: { status: 'RENTED' },
  })

  revalidatePath('/contracts')
}

export async function updateContract(id: string, formData: FormData) {
  const userId = await getUserId()
  const startDate = new Date(formData.get('startDate') as string)
  const deadline = parseInt(formData.get('deadline') as string)
  const expirationDate = addMonths(startDate, deadline)

  await prisma.contract.updateMany({
    where: { id, userId },
    data: {
      houseId: formData.get('houseId') as string,
      tenantId: formData.get('tenantId') as string,
      rentPrice: parseFloat(formData.get('rentPrice') as string),
      depositPrice: parseFloat(formData.get('depositPrice') as string),
      startDate,
      startDateDay: parseInt(formData.get('startDateDay') as string),
      deadline,
      expirationDate,
      witnessName: formData.get('witnessName') as string,
      witness2Name: formData.get('witness2Name') as string,
      status: formData.get('status') as ContractStatus,
    },
  })

  revalidatePath('/contracts')
}

export async function deleteContract(id: string) {
  const userId = await getUserId()
  await prisma.contract.deleteMany({ where: { id, userId } })
  revalidatePath('/contracts')
}
