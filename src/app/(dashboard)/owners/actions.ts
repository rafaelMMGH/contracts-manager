'use server'

import { revalidatePath } from 'next/cache'
import { requireUserId } from '@/lib/requireUserId'
import { prisma } from '@/lib/prisma'

export async function createOwner(formData: FormData) {
  const userId = await requireUserId()

  await prisma.owner.create({
    data: {
      userId,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || null,
      address: formData.get('address') as string,
    },
  })

  revalidatePath('/owners')
}

export async function updateOwner(id: string, formData: FormData) {
  const userId = await requireUserId()

  await prisma.owner.updateMany({
    where: { id, userId },
    data: {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || null,
      address: formData.get('address') as string,
    },
  })

  revalidatePath('/owners')
}

export async function deleteOwner(id: string) {
  const userId = await requireUserId()
  await prisma.owner.deleteMany({ where: { id, userId } })
  revalidatePath('/owners')
}
