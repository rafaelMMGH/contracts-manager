export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function format(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShort(date: Date): string {
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const MONTHS_ES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
]

const NUMBERS_ES: Record<number, string> = {
  0: 'CERO', 1: 'UNO', 2: 'DOS', 3: 'TRES', 4: 'CUATRO', 5: 'CINCO',
  6: 'SEIS', 7: 'SIETE', 8: 'OCHO', 9: 'NUEVE', 10: 'DIEZ',
  11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
  16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
  20: 'VEINTE', 21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS',
  24: 'VEINTICUATRO', 25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE',
  28: 'VEINTIOCHO', 29: 'VEINTINUEVE', 30: 'TREINTA', 31: 'TREINTA Y UNO',
}

function yearInWords(year: number): string {
  const thousands: Record<number, string> = {
    2020: 'DOS MIL VEINTE', 2021: 'DOS MIL VEINTIUNO', 2022: 'DOS MIL VEINTIDÓS',
    2023: 'DOS MIL VEINTITRÉS', 2024: 'DOS MIL VEINTICUATRO', 2025: 'DOS MIL VEINTICINCO',
    2026: 'DOS MIL VEINTISÉIS', 2027: 'DOS MIL VEINTISIETE', 2028: 'DOS MIL VEINTIOCHO',
    2029: 'DOS MIL VEINTINUEVE', 2030: 'DOS MIL TREINTA',
  }
  return thousands[year] ?? `DOS MIL ${year - 2000}`
}

export function formatContractDate(date: Date): string {
  const day = date.getDate()
  const month = MONTHS_ES[date.getMonth()]
  const year = yearInWords(date.getFullYear())
  return `${NUMBERS_ES[day] ?? day} DE ${month} DEL AÑO ${year}`
}
