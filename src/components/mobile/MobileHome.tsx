'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ViewTransition,
  addTransitionType,
  startTransition,
} from 'react'
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Building2,
  Map,
  Home,
  Building,
  LayoutGrid,
  Users,
  CalendarDays,
} from 'lucide-react'
import BuildingComplexPlus from '@/components/icons/BuildingComplexPlus'
import MobileMapOverlay from './MobileMapOverlay'
import { useRegisterMobileCreate } from './MobileCreateContext'
import SlideSheet from '@/components/SlideSheet'
import HouseFormFields from '@/app/(dashboard)/houses/HouseFormFields'
import { createHouse } from '@/app/(dashboard)/houses/actions'
import { notify } from '@/lib/toast'
import {
  formatRent,
  PROPERTY_TYPE_LABELS,
  type MobileBadgeStatus,
} from './housePlaceholders'
import {
  filterMobileHouses,
  pickFeaturedHouse,
  type ChipId,
  type TypeFilterId,
  type MobileHouseDto,
} from './types'
import { cn } from '@/lib/utils'
import {
  WorkspaceHomeHeader,
  type WorkspaceKpiData,
} from '@/components/WorkspaceGlassKpis'

const TYPE_FILTERS: {
  id: TypeFilterId
  label: string
  icon: typeof Home
}[] = [
  { id: 'todos', label: 'Todos', icon: LayoutGrid },
  { id: 'residencial', label: 'Residencial', icon: Home },
  { id: 'comercial', label: 'Comercial', icon: Building },
]

const CHIPS: { id: ChipId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'por_vencer', label: 'Por vencer' },
  { id: 'disponibles', label: 'Disponibles' },
]

export type MobileOwnerOption = {
  id: string
  name: string
}

type MobileHomeProps = {
  userId: string
  userName?: string | null
  houses: MobileHouseDto[]
  owners: MobileOwnerOption[]
  kpis: WorkspaceKpiData
}

function tipDismissedKey(userId: string) {
  return `contratos.mobileHome.tipDismissed:${userId}`
}

export default function MobileHome({
  userId,
  userName,
  houses,
  owners,
  kpis,
}: MobileHomeProps) {
  const router = useRouter()
  const [chip, setChip] = useState<ChipId>('todos')
  const [typeFilter, setTypeFilter] = useState<TypeFilterId>('todos')
  const [query, setQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isPending, startFormTransition] = useTransition()
  const [tipDismissed, setTipDismissed] = useState(false)

  useEffect(() => {
    try {
      setTipDismissed(localStorage.getItem(tipDismissedKey(userId)) === '1')
    } catch {
      setTipDismissed(false)
    }
  }, [userId])

  function dismissTip() {
    try {
      localStorage.setItem(tipDismissedKey(userId), '1')
    } catch {
      /* ignore quota / private mode */
    }
    setTipDismissed(true)
  }

  const filtered = useMemo(() => {
    const byFilters = filterMobileHouses(houses, chip, typeFilter)
    const q = query.trim().toLowerCase()
    if (!q) return byFilters
    return byFilters.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q)
    )
  }, [houses, chip, typeFilter, query])

  function openCreate() {
    setSheetOpen(true)
  }

  useRegisterMobileCreate('Nuevo inmueble', BuildingComplexPlus, openCreate)

  useEffect(() => {
    document.body.dataset.mobileMapOpen = mapOpen ? 'true' : ''
    return () => {
      delete document.body.dataset.mobileMapOpen
    }
  }, [mapOpen])

  const featured =
    chip === 'todos' && typeFilter === 'todos' && !query.trim()
      ? pickFeaturedHouse(houses)
      : (filtered[0] ?? null)

  const showList = chip === 'por_vencer'
  const portfolioEmpty = houses.length === 0
  const hasOwners = owners.length > 0

  function closeSheet() {
    setSheetOpen(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startFormTransition(async () => {
      try {
        await createHouse(fd)
        notify.created('Inmueble')
        closeSheet()
        router.refresh()
      } catch {
        notify.saveError()
      }
    })
  }

  function emptyState() {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-[13px] text-text-muted shadow-card">
        {showList
          ? 'No hay contratos por vencer.'
          : 'No hay inmuebles en este filtro.'}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        aria-hidden
        className="workspace-mesh pointer-events-none absolute inset-0 -mx-4 -mb-28 -mt-4 min-h-full"
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
      <MobileMapOverlay
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        houses={filtered}
      />

      <WorkspaceHomeHeader
        userName={userName}
        kpis={kpis}
        className="-mb-3 px-1"
      />

      {portfolioEmpty ? (
        <div className="-mb-28 flex min-h-0 flex-1 flex-col px-1 pb-28 pt-1">
          {!tipDismissed ? (
            <div className="mb-2 flex items-start gap-4 rounded-3xl border border-border bg-white p-5">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  Agrega un inmueble y empieza a registrar contratos, inquilinos
                  y a recibir alertas sobre las fechas de pago.
                </p>
                <button
                  type="button"
                  onClick={dismissTip}
                  className="mt-3 text-[13px] font-semibold text-brand-600 transition-opacity hover:opacity-80"
                >
                  Descartar
                </button>
              </div>
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                <Home className="size-6 text-brand-600" strokeWidth={1.8} />
              </div>
            </div>
          ) : null}

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-black/[0.05]">
              <Building2
                className="size-7 text-text-muted"
                strokeWidth={1.6}
              />
            </div>
            <p className="text-[15px] font-semibold text-text-primary">
              Sin inmuebles
            </p>
          </div>
        </div>
      ) : (
      <div className="flex min-h-0 flex-1 flex-col px-1 pb-4 pt-1">
        {/* Liquid-glass chrome: search · map · filter */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="liquid-glass flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full px-3.5">
            <Search className="size-4 shrink-0 text-text-secondary" strokeWidth={1.75} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar inmueble…"
              className="w-full border-0 bg-transparent p-0 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 md:text-[13px]"
            />
          </div>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            disabled={filtered.length === 0}
            className={cn(
              'liquid-glass flex size-12 shrink-0 items-center justify-center rounded-full text-text-secondary transition-transform active:scale-[0.96]',
              filtered.length === 0 && 'cursor-not-allowed opacity-45 active:scale-100'
            )}
            aria-label="Ver mapa"
          >
            <Map className="size-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="mobile-home-filters"
            className="liquid-glass-brand flex size-12 shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.96]"
            aria-label={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            <SlidersHorizontal className="size-[18px]" strokeWidth={2} />
          </button>
        </div>

        <div
          id="mobile-home-filters"
          className={cn(
            'overflow-hidden [overflow-anchor:none] transition-[max-height,opacity,margin] duration-200 ease-out',
            filtersOpen
              ? 'mb-5 max-h-40 opacity-100'
              : 'pointer-events-none mb-0 max-h-0 opacity-0'
          )}
        >
          {/* Row 1: property type filters (icon pills) */}
          <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TYPE_FILTERS.map((f) => {
              const active = f.id === typeFilter
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTypeFilter(f.id)}
                  tabIndex={filtersOpen ? 0 : -1}
                  className={cn(
                    'liquid-glass-flat flex h-11 shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[12px] font-medium transition-[transform,opacity] duration-200 active:scale-[0.97]',
                    active ? 'liquid-glass-brand' : 'liquid-glass text-black'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full',
                      active
                        ? 'bg-white/95 text-brand-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
                        : 'bg-black/[0.06] text-black'
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Row 2: status chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CHIPS.map((c) => {
              const active = c.id === chip
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChip(c.id)}
                  tabIndex={filtersOpen ? 0 : -1}
                  className={cn(
                    'liquid-glass-flat flex h-11 shrink-0 items-center rounded-full px-3.5 text-[12px] font-medium transition-[transform,opacity] duration-200 active:scale-[0.97]',
                    active
                      ? 'liquid-glass-brand'
                      : 'liquid-glass text-text-secondary'
                  )}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {showList ? (
          <>
            <h2 className="mb-4 text-[22px] font-semibold tracking-tight text-text-primary">
              Por vencer
            </h2>
            {filtered.length === 0 ? (
              emptyState()
            ) : (
              <ul className="space-y-5">
                {filtered.map((house, i) => (
                  <li key={house.id}>
                    <PropertyCard house={house} animationDelay={i * 75} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold text-text-primary">
                Inmueble destacado
              </h2>
              <span className="text-[11px] text-text-muted">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {featured && filtered.some((h) => h.id === featured.id) ? (
              <PropertyCard house={featured} priority animationDelay={0} />
            ) : filtered[0] ? (
              <PropertyCard house={filtered[0]} priority animationDelay={0} />
            ) : (
              emptyState()
            )}

            {filtered.length > 1 ? (
              <ul className="mt-5 space-y-5">
                {filtered
                  .filter((h) => h.id !== (featured?.id ?? filtered[0]?.id))
                  .map((house, i) => (
                    <li key={house.id}>
                      <PropertyCard
                        house={house}
                        animationDelay={(i + 1) * 75}
                      />
                    </li>
                  ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
      )}

      <SlideSheet
        open={sheetOpen}
        onClose={closeSheet}
        title="Nuevo inmueble"
        width={480}
        footer={
          hasOwners ? (
            <button
              type="submit"
              form="mobile-house-form"
              disabled={isPending}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? 'Guardando…' : 'Crear inmueble'}
            </button>
          ) : undefined
        }
      >
        {hasOwners ? (
          <form
            id="mobile-house-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <HouseFormFields owners={owners} />
          </form>
        ) : (
          <div className="flex flex-col items-center px-2 py-10 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50">
              <Users className="size-5 text-brand-600" strokeWidth={1.8} />
            </div>
            <p className="mb-1 text-[14px] font-medium text-text-primary">
              Sin propietarios
            </p>
            <p className="mb-5 max-w-[36ch] text-[12px] leading-relaxed text-text-muted">
              Registra un propietario antes de crear un inmueble.
            </p>
            <Link
              href="/owners"
              onClick={closeSheet}
              className="btn-primary"
            >
              Ir a Propietarios
            </Link>
          </div>
        )}
      </SlideSheet>
      </div>
    </div>
  )
}

function PropertyCard({
  house,
  priority = false,
  animationDelay = 0,
}: {
  house: MobileHouseDto
  priority?: boolean
  animationDelay?: number
}) {
  const router = useRouter()
  const TypeIcon = house.propertyType === 'COMMERCIAL' ? Building2 : Home
  const imageShareName = `house-${house.id}`
  const openShareName = `house-open-${house.id}`
  const statusLabel = glassStatusLabel(house.badgeStatus, house.expiresInDays)
  const tenantInitial = house.contractTenantName
    ? house.contractTenantName.trim().charAt(0).toUpperCase()
    : null
  const showExpiry =
    house.badgeStatus === 'por_vencer' || house.badgeStatus === 'vencido'

  function openDetail() {
    startTransition(() => {
      addTransitionType('nav-forward')
      router.push(`/houses/${house.id}`)
    })
  }

  return (
    <article
      className="property-card w-full"
      style={{ ['--card-delay' as string]: `${animationDelay}ms` }}
    >
      <div className="rounded-[2rem] bg-transparent">
        <ViewTransition
          name={imageShareName}
          share={{
            'nav-forward': 'morph',
            'nav-back': 'morph',
            default: 'morph',
          }}
          default="none"
        >
          <button
            type="button"
            onClick={openDetail}
            aria-label={`Ver detalle de ${house.title}`}
            className="property-card__media relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] text-left"
          >
            <Image
              src={house.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={priority}
            />
          </button>
        </ViewTransition>

        <div className="property-card__body liquid-glass-tile relative z-10 -mt-10 space-y-5 rounded-[28px] px-5 pb-5 pt-5">
          {/* Pills + open */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] px-2.5 py-1.5 text-[12px] font-medium text-text-primary">
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    STATUS_DOT[house.badgeStatus]
                  )}
                />
                {statusLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] px-2.5 py-1.5 text-[12px] font-medium text-text-primary">
                <TypeIcon className="size-3 text-emerald-600" strokeWidth={2.2} />
                {PROPERTY_TYPE_LABELS[house.propertyType]}
              </span>
            </div>

            <ViewTransition
              name={openShareName}
              share={{
                'nav-forward': 'morph',
                'nav-back': 'morph',
                default: 'morph',
              }}
              default="none"
            >
              <button
                type="button"
                onClick={openDetail}
                aria-label={`Ver detalle de ${house.title}`}
                className="liquid-glass liquid-glass-flat flex size-10 shrink-0 items-center justify-center rounded-full text-text-primary transition-transform active:scale-[0.96]"
              >
                <ArrowUpRight className="size-[18px]" strokeWidth={2.25} />
              </button>
            </ViewTransition>
          </div>

          {/* Title + address */}
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-[20px] font-semibold leading-snug tracking-tight text-text-primary">
              {house.title}
            </p>
            <p className="line-clamp-2 text-[13px] leading-snug text-text-muted">
              {house.address}
            </p>
          </div>

          {/* Rent metric (replaces progress) */}
          {house.rentMxn != null ? (
            <p className="tabular text-[28px] font-semibold leading-none tracking-tight text-text-primary">
              {formatRent(house.rentMxn)}
              <span className="ml-1.5 text-[13px] font-medium text-text-muted">
                / mes
              </span>
            </p>
          ) : (
            <p className="text-[15px] font-medium text-text-muted">
              Sin renta activa
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center">
              {tenantInitial ? (
                <span
                  className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[12px] font-semibold text-white shadow-[0_0_0_2px_rgba(255,255,255,0.85)]"
                  title={house.contractTenantName ?? undefined}
                >
                  {tenantInitial}
                </span>
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-black/[0.06] text-text-secondary shadow-[0_0_0_2px_rgba(255,255,255,0.85)]">
                  <TypeIcon className="size-4" strokeWidth={1.75} />
                </span>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-3 text-[12px] font-medium">
              <span className="truncate text-text-muted">{house.city}</span>
              {showExpiry ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-rose-500">
                  <CalendarDays className="size-3.5" strokeWidth={2} />
                  {house.badgeStatus === 'vencido'
                    ? 'Vencido'
                    : house.expiresInDays != null
                      ? `Vence en ${house.expiresInDays}d`
                      : 'Por vencer'}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

const STATUS_DOT: Record<MobileBadgeStatus, string> = {
  disponible: 'bg-emerald-500',
  rentado: 'bg-amber-400',
  por_vencer: 'bg-rose-500',
  vencido: 'bg-rose-700',
  mantenimiento: 'bg-sky-500',
}

const STATUS_PILL_LABEL: Record<MobileBadgeStatus, string> = {
  disponible: 'Disponible',
  rentado: 'Rentado',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  mantenimiento: 'Mantenimiento',
}

function glassStatusLabel(
  status: MobileBadgeStatus,
  expiresInDays: number | null
) {
  if (status === 'por_vencer' && expiresInDays != null) {
    return `Vence en ${expiresInDays}d`
  }
  return STATUS_PILL_LABEL[status]
}
