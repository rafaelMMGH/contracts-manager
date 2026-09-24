'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { canDeleteHouse } from '@/lib/canDeleteHouse'
import { attachedContractWhere, findAttachedContract } from '@/lib/houseContract'
import { requireUserId } from '@/lib/requireUserId'
import {
  deleteAllHouseBlobs,
  parseCoordsFromFormData,
  parseImagesFromFormData,
  syncHouseImages,
} from '@/lib/houseImages'
import { PropertyType, HouseStatus } from '@prisma/client'

function revalidateHousePaths(id?: string) {
  revalidatePath('/')
  revalidatePath('/houses')
  if (id) revalidatePath(`/houses/${id}`)
}

function requiredHouseName(formData: FormData): string {
  const name = ((formData.get('name') as string) || '').trim()
  if (!name) throw new Error('Nombre del inmueble requerido')
  return name
}

async function resolveHouseStatus(
  houseId: string | null,
  formData: FormData
): Promise<HouseStatus> {
  if (houseId) {
    const attached = await findAttachedContract(houseId)
    if (attached) return 'RENTED'
  }

  const requested = formData.get('status') as HouseStatus
  if (requested === 'MAINTENANCE' || requested === 'AVAILABLE') return requested
  return 'AVAILABLE'
}

export async function createHouse(formData: FormData) {
  const userId = await requireUserId()
  const name = requiredHouseName(formData)
  const status = await resolveHouseStatus(null, formData)
  const { latitude, longitude } = parseCoordsFromFormData(formData)
  const images = parseImagesFromFormData(formData, userId)

  const house = await prisma.house.create({
    data: {
      userId,
      ownerId: formData.get('ownerId') as string,
      name,
      street: formData.get('street') as string,
      number: formData.get('number') as string,
      colony: formData.get('colony') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      latitude,
      longitude,
      propertyType: formData.get('propertyType') as PropertyType,
      status,
      notes: (formData.get('notes') as string) || null,
    },
  })

  if (images.length > 0) {
    await syncHouseImages(house.id, userId, images)
  }

  revalidateHousePaths()
}

export async function updateHouse(id: string, formData: FormData) {
  const userId = await requireUserId()
  const name = requiredHouseName(formData)
  const status = await resolveHouseStatus(id, formData)
  const { latitude, longitude } = parseCoordsFromFormData(formData)
  const images = parseImagesFromFormData(formData, userId)

  const updated = await prisma.house.updateMany({
    where: { id, userId },
    data: {
      ownerId: formData.get('ownerId') as string,
      name,
      street: formData.get('street') as string,
      number: formData.get('number') as string,
      colony: formData.get('colony') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      latitude,
      longitude,
      propertyType: formData.get('propertyType') as PropertyType,
      status,
      notes: (formData.get('notes') as string) || null,
    },
  })

  if (updated.count === 0) throw new Error('Inmueble no encontrado')

  await syncHouseImages(id, userId, images)
  revalidateHousePaths(id)
}

export type DeleteHouseResult =
  | { ok: true }
  | { ok: false; code: 'HAS_CONTRACTS' | 'NOT_FOUND' | 'RENTED' }

export async function deleteHouse(id: string): Promise<DeleteHouseResult> {
  const userId = await requireUserId()

  const house = await prisma.house.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      _count: {
        select: {
          contracts: { where: attachedContractWhere },
        },
      },
    },
  })
  if (!house) return { ok: false, code: 'NOT_FOUND' }

  if (house.status === 'RENTED') {
    return { ok: false, code: 'RENTED' }
  }

  if (!canDeleteHouse({ attachedContractCount: house._count.contracts })) {
    return { ok: false, code: 'HAS_CONTRACTS' }
  }

  await deleteAllHouseBlobs(id)
  await prisma.house.deleteMany({ where: { id, userId } })
  revalidateHousePaths(id)
  return { ok: true }
}
