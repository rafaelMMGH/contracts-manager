'use client'

import Link from 'next/link'
import { FileText, Home, TrendingUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCompactCurrency } from '@/lib/formatCompactCurrency'

export type WorkspaceKpiData = {
  totalHouses: number
  activeContracts: number
  monthlyIncome: number
}

type ChipTone = 'coral' | 'amber' | 'lime'

const CARDS: {
  key: keyof WorkspaceKpiData
  label: string
  href: string
  icon: LucideIcon
  tone: ChipTone
  format: (value: number) => string
  sub?: string
}[] = [
  {
    key: 'totalHouses',
    label: 'Inmuebles',
    href: '/houses',
    icon: Home,
    tone: 'coral',
    format: (v) => String(v),
  },
  {
    key: 'activeContracts',
    label: 'Contratos activos',
    href: '/contracts',
    icon: FileText,
    tone: 'amber',
    format: (v) => String(v),
  },
  {
    key: 'monthlyIncome',
    label: 'Ingresos mensuales',
    href: '/contracts',
    icon: TrendingUp,
    tone: 'lime',
    format: formatCompactCurrency,
    sub: 'renta activa',
  },
]

const CHIP_CLASS: Record<ChipTone, string> = {
  coral: 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_4px_12px_rgba(249,115,22,0.35)]',
  amber: 'bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_4px_12px_rgba(245,158,11,0.35)]',
  lime: 'bg-gradient-to-br from-lime-400 to-emerald-500 shadow-[0_4px_12px_rgba(132,204,22,0.35)]',
}

type WorkspaceGlassKpisProps = {
  data: WorkspaceKpiData
  className?: string
}

export function WorkspaceGlassKpis({ data, className }: WorkspaceGlassKpisProps) {
  return (
    <div className={cn('-mx-1 md:mx-0', className)}>
      {/*
        overflow-x-auto also clips Y (shadows). Keep padding inside the
        scrollport so the glass glow isn't cut at the row edge.
      */}
      <div className="flex gap-3 overflow-x-auto px-1 pt-2 pb-10 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
        {CARDS.map((card, i) => {
          const Icon = card.icon
          const value = data[card.key]
          return (
            <Link
              key={card.key}
              href={card.href}
              className="kpi-card liquid-glass-tile flex min-h-[168px] w-[min(42vw,160px)] shrink-0 flex-col justify-between rounded-[28px] p-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] md:min-h-[200px] md:w-auto md:rounded-[32px] md:p-5"
              style={{ animationDelay: `${i * 75}ms` }}
            >
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
                  CHIP_CLASS[card.tone]
                )}
              >
                <Icon className="size-3.5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1 text-right text-[13px] font-medium leading-snug text-text-primary">
                {card.label}
              </span>
            </div>
              <div className="text-right">
                <p className="tabular text-[40px] font-semibold leading-none tracking-tight text-text-primary md:text-[44px]">
                  {card.format(value)}
                </p>
                {card.sub ? (
                  <p className="mt-1.5 text-[11px] text-text-muted">{card.sub}</p>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

type WorkspaceHomeHeaderProps = {
  userName?: string | null
  kpis: WorkspaceKpiData
  className?: string
}

export function WorkspaceHomeHeader({
  userName,
  kpis,
  className,
}: WorkspaceHomeHeaderProps) {
  const firstName = userName?.split(' ')[0] ?? 'Usuario'

  return (
    <header className={cn('space-y-6 md:space-y-8', className)}>
      <h1 className="max-w-[18ch] text-[32px] font-semibold leading-[1.1] tracking-tight text-text-primary text-balance md:text-[40px]">
        Espacio de {firstName}
      </h1>

      <WorkspaceGlassKpis data={kpis} />
    </header>
  )
}
