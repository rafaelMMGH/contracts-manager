import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays } from '@/lib/dates'
import { getMobileHouses } from '@/lib/mobileHouses'
import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'
import ContractRow from './dashboard/ContractRow'
import MobileDashboardClient from './dashboard/MobileDashboardClient'
import { Home, FileText, Users, TrendingUp, ArrowRight } from 'lucide-react'

async function getDesktopDashboardData(userId: string) {
  const now = new Date()
  const in60Days = addDays(now, 60)

  const [totalHouses, activeContracts, totalTenants, expiringContracts, monthlyIncome] =
    await Promise.all([
      prisma.house.count({ where: { userId } }),
      prisma.contract.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { userId } }),
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
    totalTenants,
    expiringContracts: expiringContracts.map((c) => ({
      id: c.id,
      houseId: c.houseId,
      expirationDate: c.expirationDate.toISOString(),
      tenant: { fullName: c.tenant.fullName },
      house: {
        street: c.house.street,
        number: c.house.number,
        colony: c.house.colony,
      },
    })),
    monthlyIncome: Number(monthlyIncome._sum.rentPrice ?? 0),
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const [desktop, mobileHouses, owners] = await Promise.all([
    getDesktopDashboardData(userId),
    getMobileHouses(userId),
    prisma.owner.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Usuario'

  const sideKpis = [
    {
      label: 'Inmuebles',
      value: String(desktop.totalHouses),
      sub: 'en portafolio',
      icon: Home,
    },
    {
      label: 'Contratos activos',
      value: String(desktop.activeContracts),
      sub: 'vigentes',
      icon: FileText,
    },
    {
      label: 'Inquilinos',
      value: String(desktop.totalTenants),
      sub: 'registrados',
      icon: Users,
    },
  ]

  return (
    <ViewTransition
      enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
      exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
      default="none"
    >
      <MobileDashboardClient
        userId={userId}
        houses={mobileHouses}
        owners={owners}
      />

      <div className="hidden space-y-6 md:block">
        <section className="relative overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="absolute inset-0">
            <Image
              src="/dashboard-brand-atmosphere.jpg"
              alt="Interior residencial iluminado para gestión inmobiliaria"
              fill
              priority
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900/88 via-brand-800/72 to-brand-700/35" />
          </div>

          <div className="relative grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-end md:p-8">
            <div className="max-w-xl space-y-3">
              <p className="text-[12px] font-medium text-brand-100/80">
                Gestión inmobiliaria
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white text-balance md:text-3xl">
                Hola, {firstName}
              </h2>
              <p className="max-w-[42ch] text-sm leading-relaxed text-white/70">
                Revisa rentas, vencimientos e inmuebles desde un solo panel.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md md:justify-self-end md:min-w-[220px]">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-brand-100" strokeWidth={1.8} />
                <p className="text-[11px] font-medium text-brand-100/90">
                  Ingresos mensuales
                </p>
              </div>
              <p className="tabular text-[28px] font-semibold leading-none tracking-tight text-white">
                ${Number(desktop.monthlyIncome).toLocaleString('es-MX')}
              </p>
              <p className="mt-1.5 text-[11px] text-white/55">renta activa</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sideKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="kpi-card relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-card"
            >
              <div className="mb-4 flex items-start justify-between">
                <p className="text-[12px] font-medium text-text-muted">{kpi.label}</p>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <kpi.icon className="size-4 text-brand-600" strokeWidth={1.8} />
                </div>
              </div>
              <p className="tabular text-[28px] font-semibold leading-none tracking-tight text-text-primary">
                {kpi.value}
              </p>
              <p className="mt-1.5 text-[11px] text-text-muted">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div className="min-w-0 space-y-0.5">
              <p className="text-[14px] font-semibold text-text-primary">
                Contratos por vencer
              </p>
              <p className="text-[11px] text-text-muted">próximos 60 días</p>
            </div>
            <div className="flex items-center gap-3">
              {desktop.expiringContracts.length > 0 ? (
                <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  {desktop.expiringContracts.length} alerta
                  {desktop.expiringContracts.length !== 1 ? 's' : ''}
                </span>
              ) : null}
              <Link
                href="/houses"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700"
              >
                Ver inmuebles
                <ArrowRight className="size-3" strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="p-4">
            {desktop.expiringContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50">
                  <FileText className="size-4 text-brand-600" strokeWidth={1.8} />
                </div>
                <p className="text-[13px] font-medium text-text-primary">
                  Sin alertas de vencimiento
                </p>
                <p className="max-w-[36ch] text-[12px] leading-relaxed text-text-muted">
                  Todos los contratos activos están dentro de plazo.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {desktop.expiringContracts.map((contract, i) => (
                  <ContractRow
                    key={contract.id}
                    contract={contract}
                    animationDelay={i * 55}
                  />
                ))}
              </div>
            )}
          </div>

          {desktop.expiringContracts.length > 0 ? (
            <div className="flex flex-wrap items-center gap-5 border-t border-border/70 px-5 py-3">
              {[
                { color: 'bg-red-700', label: 'Crítico ≤15 días' },
                { color: 'bg-amber-700', label: 'Urgente ≤30 días' },
                { color: 'bg-brand-600', label: 'En tiempo' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`size-1.5 shrink-0 rounded-full ${color}`} />
                  <span className="text-[10px] text-text-muted">{label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ViewTransition>
  )
}
