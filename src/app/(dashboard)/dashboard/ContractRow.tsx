'use client'

import Link from 'next/link'
import { format } from '@/lib/dates'

interface ContractRowProps {
  contract: {
    id: string
    expirationDate: Date
    tenant: { fullName: string }
    house: { street: string; number: string; colony: string }
  }
  animationDelay: number
}

function UrgencyBar({ daysLeft }: { daysLeft: number }) {
  const color =
    daysLeft <= 15 ? '#b91c1c' :
    daysLeft <= 30 ? '#b45309' :
                     '#047857'
  const pulse = daysLeft <= 15

  return (
    <div
      className={['w-1 self-stretch rounded-full shrink-0', pulse ? 'pulse-urgent' : ''].join(' ')}
      style={{ background: color }}
    />
  )
}

function DaysChip({ daysLeft }: { daysLeft: number }) {
  const crit = daysLeft <= 15
  const warn = daysLeft <= 30
  const style = crit
    ? { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }
    : warn
    ? { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }
    : { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' }

  return (
    <span
      className="shrink-0 text-[11px] font-bold px-2 py-1 rounded tabular"
      style={{
        fontFamily: 'Space Mono, monospace',
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {daysLeft}d
    </span>
  )
}

export default function ContractRow({ contract, animationDelay }: ContractRowProps) {
  const daysLeft = Math.ceil(
    (new Date(contract.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div
      className="contract-row group flex items-center gap-4 rounded-xl px-4 py-3.5
        bg-white hover:bg-slate-50
        border border-slate-200 hover:border-slate-300
        shadow-card
        transition-[background-color,border-color,box-shadow] duration-150"
      style={{
        animationDelay: `${animationDelay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
      }}
    >
      <UrgencyBar daysLeft={daysLeft} />

      <div className="min-w-0 flex-1">
        <p className="text-slate-900 text-sm font-medium truncate leading-snug">
          {contract.tenant.fullName}
        </p>
        <p className="text-slate-400 text-[11px] mt-0.5 truncate">
          {contract.house.street} #{contract.house.number},{' '}
          {contract.house.colony}
        </p>
      </div>

      <p
        className="text-slate-400 text-[11px] shrink-0 hidden sm:block tabular"
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        {format(new Date(contract.expirationDate))}
      </p>

      <DaysChip daysLeft={daysLeft} />

      <Link
        href={`/contracts/${contract.id}/edit`}
        className="shrink-0 -mr-1 w-10 h-10 flex items-center justify-center rounded-lg
          text-slate-300 hover:text-emerald-700 hover:bg-emerald-50
          opacity-0 group-hover:opacity-100
          transition-[opacity,color,background-color,transform] duration-150"
        style={{ transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)' }}
        aria-label="Editar contrato"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  )
}
