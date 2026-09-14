/** Digits only, max 10 (xxx-xxx-xxxx). */
export function phoneDigits(value: string, maxLength = 10): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

/**
 * Formats a phone string as `xxx-xxx-xxxx` while typing.
 * Non-digits are stripped; at most 10 digits are kept.
 */
export function formatPhoneXxxXxxXxxx(value: string): string {
  const digits = phoneDigits(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}
