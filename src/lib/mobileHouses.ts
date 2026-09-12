import { prisma } from '@/lib/prisma'
import { addDays } from '@/lib/dates'
import {
  placeholderFor,
  placeholdersFor,
  houseTitle,
  houseAddress,
} from '@/components/mobile/housePlaceholders'
import type { MobileHouseDto } from '@/components/mobile/types'
import type { ContractFormDefaults } from '@/app/(dashboard)/contracts/ContractFormFields'
import {
  attachedContractOrderBy,
  attachedContractWhere,
  expireStaleContracts,
  syncHouseStatusFromContracts,
  toLocalDateStr,
} from '@/lib/houseContract'

function daysUntil(date: Date, now: Date): number {
  const ms = date.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

function toBadgeStatus(
  houseStatus: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE',
  opts: { isPorVencer: boolean; isVencido: boolean }
): MobileHouseDto['badgeStatus'] {
  if (opts.isVencido) return 'vencido'
  if (opts.isPorVencer) return 'por_vencer'
  if (houseStatus === 'AVAILABLE') return 'disponible'
  if (houseStatus === 'MAINTENANCE') return 'mantenimiento'
  return 'rentado'
}

function defaultDescription(
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL',
  city: string,
  notes: string | null
): string {
  if (notes?.trim()) return notes.trim()
  const tipo =
    propertyType === 'RESIDENTIAL' ? 'Inmueble residencial' : 'Inmueble comercial'
  return `${tipo} en ${city}. Consulta el detalle para gestionar el contrato.`
}

type AttachedContract = {
  id: string
  tenantId: string
  rentPrice: { toString(): string } | number
  depositPrice: { toString(): string } | number
  startDate: Date
  startDateDay: number
  deadline: number
  expirationDate: Date
  witnessName: string
  witness2Name: string
  status: string
  tenant: { fullName: string }
}

type HouseWithContract = {
  id: string
  ownerId: string
  name: string | null
  street: string
  number: string
  colony: string
  city: string
  state: string
  zipCode: string
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL'
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'
  notes: string | null
  contracts: AttachedContract[]
}

/** Fields needed to prefill HouseFormFields on edit. */
export type MobileHouseFormDefaults = {
  ownerId: string
  name: string | null
  street: string
  number: string
  colony: string
  city: string
  state: string
  zipCode: string
  propertyType: string
  status: string
  notes: string
}

export type MobileHouseDetailData = {
  house: MobileHouseDto
  formDefaults: MobileHouseFormDefaults
  contractDefaults: ContractFormDefaults | null
  contractTenantName: string | null
}

function toFormDefaults(house: HouseWithContract): MobileHouseFormDefaults {
  return {
    ownerId: house.ownerId,
    name: house.name,
    street: house.street,
    number: house.number,
    colony: house.colony,
    city: house.city,
    state: house.state,
    zipCode: house.zipCode,
    propertyType: house.propertyType,
    status: house.status,
    notes: house.notes ?? '',
  }
}

function toContractDefaults(
  contract: AttachedContract
): ContractFormDefaults {
  return {
    houseId: undefined,
    tenantId: contract.tenantId,
    rentPrice: Number(contract.rentPrice),
    depositPrice: Number(contract.depositPrice),
    startDate: toLocalDateStr(contract.startDate),
    startDateDay: contract.startDateDay,
    deadline: contract.deadline,
    witnessName: contract.witnessName,
    witness2Name: contract.witness2Name,
    status: contract.status,
  }
}

export function toMobileHouseDto(
  house: HouseWithContract,
  now = new Date()
): MobileHouseDto {
  const in60Days = addDays(now, 60)
  const contract = house.contracts[0] ?? null
  const isVencido = Boolean(contract && contract.status === 'EXPIRED')
  const isPorVencer = Boolean(
    contract &&
      contract.status === 'ACTIVE' &&
      contract.expirationDate >= now &&
      contract.expirationDate <= in60Days
  )
  const rentMxn = contract ? Number(contract.rentPrice) : null
  const expiresInDays =
    isPorVencer && contract ? daysUntil(contract.expirationDate, now) : null

  const images = placeholdersFor(house.id, 4)

  return {
    id: house.id,
    name: house.name?.trim() || null,
    title: houseTitle(house.street, house.number, house.name),
    address: houseAddress(house.street, house.number, house.colony),
    city: house.city,
    propertyType: house.propertyType,
    houseStatus: house.status,
    badgeStatus: toBadgeStatus(house.status, { isPorVencer, isVencido }),
    rentMxn,
    image: images[0] ?? placeholderFor(house.id),
    images,
    description: defaultDescription(house.propertyType, house.city, house.notes),
    expiresInDays,
    contractId: contract?.id ?? null,
    hasContract: Boolean(contract),
    isPorVencer,
    contractStatus: contract
      ? (contract.status as 'ACTIVE' | 'EXPIRED')
      : null,
    contractTenantName: contract?.tenant.fullName ?? null,
  }
}

const houseInclude = {
  contracts: {
    where: attachedContractWhere,
    orderBy: attachedContractOrderBy,
    take: 1,
    select: {
      id: true,
      tenantId: true,
      rentPrice: true,
      depositPrice: true,
      startDate: true,
      startDateDay: true,
      deadline: true,
      expirationDate: true,
      witnessName: true,
      witness2Name: true,
      status: true,
      tenant: { select: { fullName: true } },
    },
  },
}

export async function getMobileHouses(userId: string): Promise<MobileHouseDto[]> {
  const now = new Date()
  await expireStaleContracts({ userId, now })

  const houses = await prisma.house.findMany({
    where: { userId },
    include: houseInclude,
    orderBy: { createdAt: 'desc' },
  })

  // Sync Rentado ↔ Disponible for list consistency (Mantenimiento sticky)
  await Promise.all(
    houses.map(async (h) => {
      const has = h.contracts.length > 0
      if (has && h.status !== 'RENTED') {
        await prisma.house.update({
          where: { id: h.id },
          data: { status: 'RENTED' },
        })
        h.status = 'RENTED'
      } else if (!has && h.status === 'RENTED') {
        await prisma.house.update({
          where: { id: h.id },
          data: { status: 'AVAILABLE' },
        })
        h.status = 'AVAILABLE'
      }
    })
  )

  return houses.map((h) => toMobileHouseDto(h, now))
}

export async function getMobileHouseById(
  userId: string,
  houseId: string
): Promise<MobileHouseDto | null> {
  const detail = await getMobileHouseDetail(userId, houseId)
  return detail?.house ?? null
}

export async function getMobileHouseDetail(
  userId: string,
  houseId: string
): Promise<MobileHouseDetailData | null> {
  const now = new Date()
  await expireStaleContracts({ userId, houseId, now })
  await syncHouseStatusFromContracts(houseId, userId)

  const house = await prisma.house.findFirst({
    where: { id: houseId, userId },
    include: houseInclude,
  })
  if (!house) return null

  const contract = house.contracts[0] ?? null

  return {
    house: toMobileHouseDto(house, now),
    formDefaults: toFormDefaults(house),
    contractDefaults: contract ? toContractDefaults(contract) : null,
    contractTenantName: contract?.tenant.fullName ?? null,
  }
}
