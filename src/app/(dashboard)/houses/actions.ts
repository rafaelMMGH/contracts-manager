'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyType, HouseStatus } from '@prisma/client'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autenticado')
  return session.user.id
}

export async function createHouse(formData: FormData) {
  const userId = await getUserId()

  await prisma.house.create({
    data: {
      userId,
      ownerId: formData.get('ownerId') as string,
      street: formData.get('street') as string,
      number: formData.get('number') as string,
      colony: formData.get('colony') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      propertyType: formData.get('propertyType') as PropertyType,
      status: formData.get('status') as HouseStatus,
      notes: (formData.get('notes') as string) || null,
    },
  })

  revalidatePath('/houses')
}

export async function updateHouse(id: string, formData: FormData) {
  const userId = await getUserId()

  await prisma.house.updateMany({
    where: { id, userId },
    data: {
      ownerId: formData.get('ownerId') as string,
      street: formData.get('street') as string,
      number: formData.get('number') as string,
      colony: formData.get('colony') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      propertyType: formData.get('propertyType') as PropertyType,
      status: formData.get('status') as HouseStatus,
      notes: (formData.get('notes') as string) || null,
    },
  })

  revalidatePath('/houses')
}

export async function deleteHouse(id: string) {
  const userId = await getUserId()
  await prisma.house.deleteMany({ where: { id, userId } })
  revalidatePath('/houses')
}
