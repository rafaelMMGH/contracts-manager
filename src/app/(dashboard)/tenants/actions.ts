'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autenticado')
  return session.user.id
}

function optional(value: FormDataEntryValue | null): string | null {
  const str = value as string
  return str && str.trim() !== '' ? str.trim() : null
}

export async function createTenant(formData: FormData) {
  const userId = await getUserId()
  const dob = optional(formData.get('dateOfBirth'))

  await prisma.tenant.create({
    data: {
      userId,
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: dob ? new Date(dob) : null,
      curpRfc: optional(formData.get('curpRfc')),
      email: optional(formData.get('email')),
      currentAddress: optional(formData.get('currentAddress')),
      emergencyContactName: optional(formData.get('emergencyContactName')),
      emergencyContactPhone: optional(formData.get('emergencyContactPhone')),
      referenceName: optional(formData.get('referenceName')),
      referencePhone: optional(formData.get('referencePhone')),
      referenceRelationship: optional(formData.get('referenceRelationship')),
      employerName: optional(formData.get('employerName')),
      employerPhone: optional(formData.get('employerPhone')),
      monthlyIncome: optional(formData.get('monthlyIncome'))
        ? parseFloat(formData.get('monthlyIncome') as string)
        : null,
    },
  })

  revalidatePath('/tenants')
}

export async function updateTenant(id: string, formData: FormData) {
  const userId = await getUserId()
  const dob = optional(formData.get('dateOfBirth'))

  await prisma.tenant.updateMany({
    where: { id, userId },
    data: {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: dob ? new Date(dob) : null,
      curpRfc: optional(formData.get('curpRfc')),
      email: optional(formData.get('email')),
      currentAddress: optional(formData.get('currentAddress')),
      emergencyContactName: optional(formData.get('emergencyContactName')),
      emergencyContactPhone: optional(formData.get('emergencyContactPhone')),
      referenceName: optional(formData.get('referenceName')),
      referencePhone: optional(formData.get('referencePhone')),
      referenceRelationship: optional(formData.get('referenceRelationship')),
      employerName: optional(formData.get('employerName')),
      employerPhone: optional(formData.get('employerPhone')),
      monthlyIncome: optional(formData.get('monthlyIncome'))
        ? parseFloat(formData.get('monthlyIncome') as string)
        : null,
    },
  })

  revalidatePath('/tenants')
}

export async function deleteTenant(id: string) {
  const userId = await getUserId()
  await prisma.tenant.deleteMany({ where: { id, userId } })
  revalidatePath('/tenants')
}
