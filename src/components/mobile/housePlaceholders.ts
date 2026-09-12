export type PropertyTypeKey = 'RESIDENTIAL' | 'COMMERCIAL'

export type MobileBadgeStatus =
  | 'disponible'
  | 'rentado'
  | 'por_vencer'
  | 'vencido'
  | 'mantenimiento'

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeKey, string> = {
  RESIDENTIAL: 'Residencial',
  COMMERCIAL: 'Comercial',
}

export const HOUSE_STATUS_LABELS: Record<
  'AVAILABLE' | 'RENTED' | 'MAINTENANCE',
  string
> = {
  AVAILABLE: 'Disponible',
  RENTED: 'Rentado',
  MAINTENANCE: 'Mantenimiento',
}

/** Deterministic placeholder photo from house id → /mobile-mock/house-1…5.jpg */
export function placeholderFor(houseId: string): string {
  return placeholdersFor(houseId, 1)[0]
}

/** Deterministic gallery of placeholder photos for carousel previews. */
export function placeholdersFor(houseId: string, count = 4): string[] {
  let hash = 0
  for (let i = 0; i < houseId.length; i++) {
    hash = (hash * 31 + houseId.charCodeAt(i)) >>> 0
  }
  const start = hash % 5
  const n = Math.max(1, Math.min(count, 5))
  return Array.from({ length: n }, (_, i) => {
    const idx = ((start + i) % 5) + 1
    return `/mobile-mock/house-${idx}.jpg`
  })
}

export function formatRent(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Card/detail title: Nombre del inmueble, else street #number. */
export function houseTitle(
  street: string,
  number: string,
  name?: string | null
): string {
  const trimmed = name?.trim()
  if (trimmed) return trimmed
  return `${street.trim()} #${number.trim()}`
}

export function houseAddress(street: string, number: string, colony: string): string {
  return `${street} #${number}, ${colony}`
}
