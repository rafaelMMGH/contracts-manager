import { prisma } from '@/lib/prisma'
import { ContractStatus } from '@prisma/client'

/** Active or expired contract attached to a house (Cancelado is ignored / deleted). */
export const ATTACHED_CONTRACT_STATUSES: ContractStatus[] = [
  'ACTIVE',
  'EXPIRED',
]

export const attachedContractWhere = {
  status: { in: ATTACHED_CONTRACT_STATUSES },
}

/**
 * Prefer Activo, else Vencido. ACTIVE sorts before EXPIRED alphabetically.
 */
export const attachedContractOrderBy = [
  { status: 'asc' as const },
  { expirationDate: 'asc' as const },
]

export async function findAttachedContract(houseId: string, userId?: string) {
  return prisma.contract.findFirst({
    where: {
      houseId,
      ...(userId ? { userId } : {}),
      ...attachedContractWhere,
    },
    orderBy: attachedContractOrderBy,
  })
}

/** Mark past-due Activo contracts as Vencido for a user (or one house). */
export async function expireStaleContracts(opts: {
  userId: string
  houseId?: string
  now?: Date
}) {
  const now = opts.now ?? new Date()
  await prisma.contract.updateMany({
    where: {
      userId: opts.userId,
      ...(opts.houseId ? { houseId: opts.houseId } : {}),
      status: 'ACTIVE',
      expirationDate: { lt: now },
    },
    data: { status: 'EXPIRED' },
  })
}

/**
 * System-owned house status around contracts:
 * - Has Activo/Vencido → Rentado
 * - No contract + was Rentado → Disponible
 * - Mantenimiento without contract stays until the user clears it
 */
export async function syncHouseStatusFromContracts(
  houseId: string,
  userId: string
) {
  const house = await prisma.house.findFirst({
    where: { id: houseId, userId },
    select: { id: true, status: true },
  })
  if (!house) return

  const attached = await findAttachedContract(houseId, userId)

  if (attached) {
    if (house.status !== 'RENTED') {
      await prisma.house.update({
        where: { id: houseId },
        data: { status: 'RENTED' },
      })
    }
    return
  }

  if (house.status === 'RENTED') {
    await prisma.house.update({
      where: { id: houseId },
      data: { status: 'AVAILABLE' },
    })
  }
}

export function contractStatusFromExpiration(
  expirationDate: Date,
  now = new Date()
): 'ACTIVE' | 'EXPIRED' {
  return expirationDate.getTime() > now.getTime() ? 'ACTIVE' : 'EXPIRED'
}

/** Local calendar YYYY-MM-DD (avoids UTC day shift). */
export function toLocalDateStr(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
