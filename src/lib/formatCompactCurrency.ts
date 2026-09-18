/** Compact MXN for tall KPI tiles (e.g. $12.5k, $1.2M). */
export function formatCompactCurrency(amount: number): string {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '$0'

  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs < 10_000) {
    return `${sign}$${Math.round(abs).toLocaleString('es-MX')}`
  }

  if (abs < 1_000_000) {
    const k = abs / 1_000
    const rounded = k >= 100 ? Math.round(k).toString() : trimFixed(k, 1)
    return `${sign}$${rounded}k`
  }

  const m = abs / 1_000_000
  return `${sign}$${trimFixed(m, m >= 10 ? 1 : 2)}M`
}

function trimFixed(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}
