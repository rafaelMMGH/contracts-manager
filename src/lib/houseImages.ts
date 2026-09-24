import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const MAX_HOUSE_IMAGES = 20
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024 // post-compression server guard
export const MAX_CLIENT_UPLOAD_BYTES = 15 * 1024 * 1024 // pre-compression
export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export type HouseImageInput = {
  url: string
  pathname: string
  sortOrder?: number
}

/** Alias used by form defaults / gallery UI */
export type HouseImageItem = {
  url: string
  pathname: string
}

export function blobPathForUser(userId: string, filename: string): string {
  return `houses/${userId}/${filename}`
}

export function isUserBlobPathname(userId: string, pathname: string): boolean {
  const prefix = `houses/${userId}/`
  return pathname.startsWith(prefix) && !pathname.includes('..')
}

export function parseLatitude(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

export function parseLongitude(value: unknown): number | null {
  return parseLatitude(value)
}

export function validateCoords(
  latitude: number | null,
  longitude: number | null
): { latitude: number; longitude: number } {
  if (latitude == null || longitude == null) {
    throw new Error('Ubicación en el mapa requerida')
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Coordenadas inválidas')
  }
  return { latitude, longitude }
}

export function normalizeHouseImages(
  raw: unknown,
  userId: string
): HouseImageInput[] {
  if (raw == null || raw === '') return []

  let list: unknown[]
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw) as unknown[]
    } catch {
      throw new Error('Lista de imágenes inválida')
    }
  } else if (Array.isArray(raw)) {
    list = raw
  } else {
    throw new Error('Lista de imágenes inválida')
  }

  if (list.length > MAX_HOUSE_IMAGES) {
    throw new Error(`Máximo ${MAX_HOUSE_IMAGES} fotos`)
  }

  const images: HouseImageInput[] = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (!item || typeof item !== 'object') {
      throw new Error('Imagen inválida')
    }
    const { url, pathname } = item as Record<string, unknown>
    if (typeof url !== 'string' || !url.trim()) {
      throw new Error('URL de imagen inválida')
    }
    if (typeof pathname !== 'string' || !pathname.trim()) {
      throw new Error('Pathname de imagen inválido')
    }
    if (!isUserBlobPathname(userId, pathname)) {
      throw new Error('Imagen no autorizada')
    }
    images.push({
      url: url.trim(),
      pathname: pathname.trim(),
      sortOrder: i,
    })
  }
  return images
}

export async function deleteBlobPathnames(pathnames: string[]) {
  const unique = Array.from(new Set(pathnames.filter(Boolean)))
  if (unique.length === 0) return
  try {
    await del(unique)
  } catch (err) {
    console.error('Failed to delete blob pathnames', unique, err)
  }
}

/** Replace house images; deletes removed blobs from Vercel Blob. */
export async function syncHouseImages(
  houseId: string,
  userId: string,
  nextImages: HouseImageInput[]
) {
  const existing = await prisma.houseImage.findMany({
    where: { houseId },
    select: { pathname: true },
  })

  const nextPathnames = new Set(nextImages.map((i) => i.pathname))
  const removed = existing
    .map((e) => e.pathname)
    .filter((p) => !nextPathnames.has(p))

  await prisma.$transaction([
    prisma.houseImage.deleteMany({ where: { houseId } }),
    ...(nextImages.length > 0
      ? [
          prisma.houseImage.createMany({
            data: nextImages.map((img, i) => ({
              houseId,
              url: img.url,
              pathname: img.pathname,
              sortOrder: img.sortOrder ?? i,
            })),
          }),
        ]
      : []),
  ])

  await deleteBlobPathnames(removed)
}

export async function deleteAllHouseBlobs(houseId: string) {
  const images = await prisma.houseImage.findMany({
    where: { houseId },
    select: { pathname: true },
  })
  await deleteBlobPathnames(images.map((i) => i.pathname))
}

export function parseImagesFromFormData(
  formData: FormData,
  userId: string
): HouseImageInput[] {
  return normalizeHouseImages(formData.get('imagesJson'), userId)
}

export function parseCoordsFromFormData(formData: FormData) {
  return validateCoords(
    parseLatitude(formData.get('latitude')),
    parseLongitude(formData.get('longitude'))
  )
}
