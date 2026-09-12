export type MobileHouseDto = {
  id: string
  /** Nombre del inmueble when set; otherwise street fallback via `houseTitle`. */
  name: string | null
  /** Display title — prefers Nombre del inmueble. */
  title: string
  address: string
  city: string
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL'
  /** Raw DB house status */
  houseStatus: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'
  /** Display badge (por_vencer / vencido overlay Rentado) */
  badgeStatus: 'disponible' | 'rentado' | 'por_vencer' | 'vencido' | 'mantenimiento'
  rentMxn: number | null
  image: string
  /** Gallery for detail carousel (includes `image` as first slide) */
  images: string[]
  description: string
  expiresInDays: number | null
  contractId: string | null
  hasContract: boolean
  isPorVencer: boolean
  contractStatus: 'ACTIVE' | 'EXPIRED' | null
  contractTenantName: string | null
}

export type MobileUserDto = {
  name?: string | null
  email?: string | null
}

export type ChipId = 'todos' | 'activos' | 'por_vencer' | 'disponibles'

export type TypeFilterId = 'todos' | 'residencial' | 'comercial'

export function filterMobileHouses(
  houses: MobileHouseDto[],
  chip: ChipId,
  typeFilter: TypeFilterId = 'todos'
): MobileHouseDto[] {
  let next = houses
  switch (typeFilter) {
    case 'residencial':
      next = next.filter((h) => h.propertyType === 'RESIDENTIAL')
      break
    case 'comercial':
      next = next.filter((h) => h.propertyType === 'COMMERCIAL')
      break
    default:
      break
  }
  switch (chip) {
    case 'activos':
      return next.filter((h) => h.houseStatus === 'RENTED')
    case 'por_vencer':
      return next.filter((h) => h.isPorVencer)
    case 'disponibles':
      return next.filter((h) => h.houseStatus === 'AVAILABLE')
    default:
      return next
  }
}

/** Featured: first AVAILABLE, else first por-vencer, else first house */
export function pickFeaturedHouse(houses: MobileHouseDto[]): MobileHouseDto | null {
  if (houses.length === 0) return null
  const available = houses.find((h) => h.houseStatus === 'AVAILABLE')
  if (available) return available
  const porVencer = houses.find((h) => h.isPorVencer)
  if (porVencer) return porVencer
  return houses[0]
}
