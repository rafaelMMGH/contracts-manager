// Spanish number-to-words for Mexican peso amounts
// Returns uppercase string like "CINCO MIL PESOS"

const ones = [
  '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
  'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS',
  'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
]

const tens = [
  '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
  'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
]

const hundreds = [
  '', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
]

function threeDigits(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'CIEN'

  const h = Math.floor(n / 100)
  const remainder = n % 100

  let result = h > 0 ? (h === 1 && remainder > 0 ? 'CIENTO' : hundreds[h]) : ''

  if (remainder > 0) {
    if (result) result += ' '
    if (remainder < 30) {
      result += ones[remainder]
    } else {
      const t = Math.floor(remainder / 10)
      const o = remainder % 10
      result += tens[t]
      if (o > 0) result += ' Y ' + ones[o]
    }
  }

  return result
}

function convert(n: number): string {
  if (n === 0) return 'CERO'

  const millions = Math.floor(n / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1_000)
  const remainder = n % 1_000

  const parts: string[] = []

  if (millions > 0) {
    parts.push(millions === 1 ? 'UN MILLÓN' : `${threeDigits(millions)} MILLONES`)
  }

  if (thousands > 0) {
    parts.push(thousands === 1 ? 'MIL' : `${threeDigits(thousands)} MIL`)
  }

  if (remainder > 0) {
    parts.push(threeDigits(remainder))
  }

  return parts.join(' ')
}

export function amountToWords(amount: number): string {
  const intPart = Math.floor(amount)
  return `${convert(intPart)} PESOS`
}
