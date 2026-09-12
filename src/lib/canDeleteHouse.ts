/** Pure delete policy: a house may be deleted only when it has no Activo/Vencido contract. */
export function canDeleteHouse({
  attachedContractCount,
}: {
  attachedContractCount: number
}): boolean {
  return attachedContractCount === 0
}
