import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, format } from '@/lib/dates'
import Link from 'next/link'
import ContractRow from './ContractRow'

async function getDashboardData(userId: string) {
  const now = new Date()
  const in60Days = addDays(now, 60)

  const [totalHouses, activeContracts, availableHouses, expiringContracts, monthlyIncome] =
    await Promise.all([
      prisma.house.count({ where: { userId } }),
      prisma.contract.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.house.count({ where: { userId, status: 'AVAILABLE' } }),
      prisma.contract.findMany({
        where: {
          userId,
          status: 'ACTIVE',
          expirationDate: { lte: in60Days, gte: now },
        },
        include: {
          house: { select: { street: true, number: true, colony: true } },
          tenant: { select: { fullName: true } },
        },
        orderBy: { expirationDate: 'asc' },
      }),
      prisma.contract.aggregate({
        where: { userId, status: 'ACTIVE' },
        _sum: { rentPrice: true },
      }),
    ])

  return {
    totalHouses,
    activeContracts,
    availableHouses,
    expiringContracts,
    monthlyIncome: monthlyIncome._sum.rentPrice ?? 0,
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getLocalDate() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const data = await getDashboardData(session!.user.id)

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Rafael'
  const greeting = getGreeting()
  const dateStr = getLocalDate()

  const kpis = [
    {
      label: 'Inmuebles',
      value: String(data.totalHouses),
      suffix: 'total',
      accent: '#065f46',
      iconBg: '#ecfdf5',
      iconBorder: '#a7f3d0',
    },
    {
      label: 'Contratos',
      value: String(data.activeContracts),
      suffix: 'activos',
      accent: '#047857',
      iconBg: '#ecfdf5',
      iconBorder: '#6ee7b7',
    },
    {
      label: 'Disponibles',
      value: String(data.availableHouses),
      suffix: 'inmuebles',
      accent: '#0f766e',
      iconBg: '#f0fdfa',
      iconBorder: '#99f6e4',
    },
    {
      label: 'Ingresos',
      value: `$${Number(data.monthlyIncome).toLocaleString('es-MX')}`,
      suffix: 'mensuales',
      accent: '#1e293b',
      iconBg: '#f8fafc',
      iconBorder: '#e2e8f0',
      isMoney: true,
    },
  ]

  return (
    <div className="min-h-full space-y-10 py-2">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-slate-400 text-[11px] tracking-[0.18em] uppercase mb-2 font-light">
            {greeting}
          </p>
          <h1
            className="text-slate-900 leading-none"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textWrap: 'balance',
            } as React.CSSProperties}
          >
            {firstName}
          </h1>
        </div>

        <div className="text-right shrink-0">
          <p
            className="text-slate-400 text-[10px] tracking-[0.1em] uppercase tabular"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {dateStr}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-400 font-sans">Sistema activo</span>
          </div>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────── */}
      <div className="relative h-px w-full bg-slate-200">
        <div
          className="absolute left-0 top-0 h-px"
          style={{ width: '12%', background: 'linear-gradient(90deg, #065f46, transparent)' }}
        />
      </div>

      {/* ── KPI Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="kpi-card rounded-xl p-5 bg-white border border-slate-200 shadow-card relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
              style={{ background: kpi.accent, opacity: 0.6 }}
            />

            <p className="text-[10px] tracking-[0.15em] uppercase text-slate-400 font-sans mb-3 mt-1">
              {kpi.label}
            </p>

            <div
              className="leading-none mb-1 tabular"
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: kpi.isMoney ? '1.4rem' : '2.5rem',
                fontWeight: 700,
                color: kpi.accent,
              }}
            >
              {kpi.value}
            </div>

            <p className="text-[10px] text-slate-400 font-sans mt-2">{kpi.suffix}</p>
          </div>
        ))}
      </div>

      {/* ── Expiring Contracts ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-slate-800 text-base font-medium"
                style={{ textWrap: 'balance' } as React.CSSProperties}>
                Contratos por vencer
              </h2>
              <p className="text-slate-400 text-[11px] mt-0.5">próximos 60 días</p>
            </div>

            {data.expiringContracts.length > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded tabular"
                style={{
                  fontFamily: 'Space Mono, monospace',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                }}
              >
                {data.expiringContracts.length} alerta{data.expiringContracts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <Link
            href="/contracts"
            className="text-[11px] text-slate-400 hover:text-emerald-700
              transition-[color] duration-150 tracking-[0.1em] uppercase font-sans"
            style={{ transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)' }}
          >
            Ver todos →
          </Link>
        </div>

        {data.expiringContracts.length === 0 ? (
          <div className="rounded-xl p-8 text-center bg-white border border-slate-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-slate-500 text-sm">
                Sin alertas — todos los contratos están en orden.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.expiringContracts.map((contract, i) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                animationDelay={i * 55}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────── */}
      <div className="flex items-center gap-5 pt-1">
        {[
          { color: '#b91c1c', label: 'Crítico ≤15 días' },
          { color: '#b45309', label: 'Urgente ≤30 días' },
          { color: '#047857', label: 'En tiempo'        },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-slate-400 tracking-wide font-sans">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
