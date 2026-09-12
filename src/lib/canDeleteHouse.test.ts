import { describe, expect, it } from 'vitest'
import { canDeleteHouse } from './canDeleteHouse'

describe('canDeleteHouse', () => {
  it('allows delete when attachedContractCount is 0', () => {
    expect(canDeleteHouse({ attachedContractCount: 0 })).toBe(true)
  })

  it('blocks delete when there is an Activo/Vencido contract', () => {
    expect(canDeleteHouse({ attachedContractCount: 1 })).toBe(false)
    expect(canDeleteHouse({ attachedContractCount: 3 })).toBe(false)
  })
})
