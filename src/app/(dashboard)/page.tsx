import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays } from '@/lib/dates'
import { getMobileHouses } from '@/lib/mobileHouses'
import Link from 'next/link'
import ContractRow from './dashboard/ContractRow'
import MobileDashboardClient from './dashboard/MobileDashboardClient'
import { WorkspaceHomeHeader } from '@/components/WorkspaceGlassKpis'
import { FileText, ArrowRight } from 'lucide-react'

async function getDesktopDashboardData(userId: string) {
  const now = new Date()
  const in60Days = addDays(now, 60)

  const [totalHouses, activeContracts, expiringContracts, monthlyIncome] =
    await Promise.all([
      prisma.house.count({ where: { userId } }),
      prisma.contract.count({ where: { userId, status: 'ACTIVE' } }),
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

  const kpis = {
    totalHouses: desktop.totalHouses,
    activeContracts: desktop.activeContracts,
    monthlyIncome: desktop.monthlyIncome,
  }

  return (
    <>
      <MobileDashboardClient
        userId={userId}
        userName={session?.user?.name}
        houses={mobileHouses}
        owners={owners}
        kpis={kpis}
      />

      <div className="relative hidden min-h-full space-y-8 md:block">
        <WorkspaceHomeHeader userName={session?.user?.name} kpis={kpis} />

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
    </>
  )
}
