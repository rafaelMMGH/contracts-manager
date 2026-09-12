'use client'

import Link from 'next/link'
import { format } from '@/lib/dates'

interface ContractRowProps {
  contract: {
    id: string
    houseId: string
    expirationDate: string
    tenant: { fullName: string }
    house: { street: string; number: string; colony: string }
  }
  animationDelay: number
}

function getDaysStyle(daysLeft: number) {
  if (daysLeft <= 15) return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }
  if (daysLeft <= 30) return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }
  return { bg: '#e8f0ed', text: '#1a4a40', border: '#a7c5bc' }
}

export default function ContractRow({ contract, animationDelay }: ContractRowProps) {
  const daysLeft = Math.ceil(
    (new Date(contract.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const style = getDaysStyle(daysLeft)
  const pulse = daysLeft <= 15

  return (
    <div
      className="contract-row flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3.5 shadow-card transition-all duration-200 hover:border-brand-200"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className={['w-1 h-9 rounded-full shrink-0', pulse ? 'pulse-urgent' : ''].join(' ')}
        style={{ background: style.text }}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-text-primary">{contract.tenant.fullName}</p>
        <p className="mt-0.5 truncate text-[11px] text-text-muted">
          {contract.house.street} #{contract.house.number}, {contract.house.colony}
        </p>
      </div>

      <p className="tabular hidden shrink-0 text-[11px] text-text-muted sm:block">
        {format(new Date(contract.expirationDate))}
      </p>

      <span
        className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md tabular"
        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
      >
        {daysLeft}d
      </span>

      <Link
        href={`/houses/${contract.houseId}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-brand-50 hover:text-brand-600 active:scale-[0.95]"
        aria-label="Ver inmueble"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}
