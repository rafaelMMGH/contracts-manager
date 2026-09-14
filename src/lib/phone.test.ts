import { describe, expect, it } from 'vitest'
import { formatPhoneXxxXxxXxxx, phoneDigits } from './phone'

describe('formatPhoneXxxXxxXxxx', () => {
  it('formats partial and full numbers', () => {
    expect(formatPhoneXxxXxxXxxx('')).toBe('')
    expect(formatPhoneXxxXxxXxxx('9')).toBe('9')
    expect(formatPhoneXxxXxxXxxx('961')).toBe('961')
    expect(formatPhoneXxxXxxXxxx('9610')).toBe('961-0')
    expect(formatPhoneXxxXxxXxxx('961000')).toBe('961-000')
    expect(formatPhoneXxxXxxXxxx('9610000000')).toBe('961-000-0000')
  })

  it('strips non-digits and caps at 10', () => {
    expect(formatPhoneXxxXxxXxxx('961 000 0000')).toBe('961-000-0000')
    expect(formatPhoneXxxXxxXxxx('(961) 000-0000 ext')).toBe('961-000-0000')
    expect(formatPhoneXxxXxxXxxx('96100000001234')).toBe('961-000-0000')
  })
})

describe('phoneDigits', () => {
  it('returns digits only', () => {
    expect(phoneDigits('961-000-0000')).toBe('9610000000')
  })
})
