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
  CircleDot,
  MapPinned,
  Map,
  Home,
  Building,
  LayoutGrid,
  Users,
} from 'lucide-react'
import BuildingComplexPlus from '@/components/icons/BuildingComplexPlus'
import StatusBadge from './StatusBadge'
import MobileMapOverlay from './MobileMapOverlay'
import { useRegisterMobileCreate } from './MobileCreateContext'
import SlideSheet from '@/components/SlideSheet'
import HouseFormFields from '@/app/(dashboard)/houses/HouseFormFields'
import { createHouse } from '@/app/(dashboard)/houses/actions'
import { notify } from '@/lib/toast'
import {
  formatRent,
  PROPERTY_TYPE_LABELS,
  HOUSE_STATUS_LABELS,
} from './housePlaceholders'
import {
  filterMobileHouses,
  pickFeaturedHouse,
  type ChipId,
  type TypeFilterId,
  type MobileHouseDto,
} from './types'
import { cn } from '@/lib/utils'

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
  houses: MobileHouseDto[]
  owners: MobileOwnerOption[]
}

function tipDismissedKey(userId: string) {
  return `contratos.mobileHome.tipDismissed:${userId}`
}

export default function MobileHome({ userId, houses, owners }: MobileHomeProps) {
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
    <div className="relative flex min-h-0 flex-1 flex-col bg-bg">
      <MobileMapOverlay
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        houses={filtered}
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
              className="w-full border-0 bg-transparent p-0 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0"
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
                {filtered.map((house) => (
                  <li key={house.id}>
                    <PropertyCard house={house} />
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
              <PropertyCard house={featured} priority />
            ) : filtered[0] ? (
              <PropertyCard house={filtered[0]} priority />
            ) : (
              emptyState()
            )}

            {filtered.length > 1 ? (
              <ul className="mt-5 space-y-5">
                {filtered
                  .filter((h) => h.id !== (featured?.id ?? filtered[0]?.id))
                  .map((house) => (
                    <li key={house.id}>
                      <PropertyCard house={house} />
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
  )
}

function PropertyCard({
  house,
  priority = false,
}: {
  house: MobileHouseDto
  priority?: boolean
}) {
  const router = useRouter()
  const TypeIcon = house.propertyType === 'COMMERCIAL' ? Building2 : Home
  // Shared morph name only while navigating — idle cards use auto names so
  // refresh / Strict Mode / overlapping trees can't register duplicate house-${id}.
  const [shareName, setShareName] = useState<string | null>(null)

  const pills = [
    {
      key: 'type',
      icon: TypeIcon,
      label: PROPERTY_TYPE_LABELS[house.propertyType],
    },
    {
      key: 'city',
      icon: MapPinned,
      label: house.city,
    },
    {
      key: 'status',
      icon: CircleDot,
      label: HOUSE_STATUS_LABELS[house.houseStatus],
    },
  ] as const

  function openDetail() {
    startTransition(() => {
      setShareName(`house-${house.id}`)
      addTransitionType('nav-forward')
      router.push(`/houses/${house.id}`)
    })
  }

  return (
    <article className="w-full">
      <div className="overflow-hidden rounded-[2rem] bg-transparent">
        <ViewTransition
          name={shareName ?? undefined}
          share="morph"
          default="none"
        >
          <button
            type="button"
            onClick={openDetail}
            aria-label={`Ver detalle de ${house.title}`}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] text-left"
          >
            <Image
              src={house.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={priority}
            />
            <StatusBadge
              status={house.badgeStatus}
              variant="onImage"
              expiresInDays={house.expiresInDays}
              className="pointer-events-none absolute left-4 top-4 z-10"
            />
          </button>
        </ViewTransition>

        <div className="relative z-10 -mt-10 rounded-[28px] bg-white px-5 pb-5 pt-5 shadow-[0_10px_36px_rgba(15,23,42,0.08)]">
          {/* Header: type icon · title/address · open */}
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#F1F1F1] text-black">
              <TypeIcon className="size-5" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 truncate text-[20px] font-normal leading-snug tracking-tight text-black">
                {house.title}
              </p>
              <p className="mt-0.5 truncate text-[13px] leading-snug text-[#8C8C8C]">
                {house.address}
              </p>
            </div>
            <button
              type="button"
              onClick={openDetail}
              aria-label={`Ver detalle de ${house.title}`}
              className="liquid-glass-brand liquid-glass-flat flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.96]"
            >
              <ArrowUpRight className="size-[18px]" strokeWidth={2.25} />
            </button>
          </div>

          {/* Price */}
          {house.rentMxn != null ? (
            <p className="my-6 text-[34px] font-normal tabular leading-none tracking-tight text-brand-600">
              {formatRent(house.rentMxn)}
              <span className="ml-1.5 text-[13px] font-medium text-[#8C8C8C]">
                / mes
              </span>
            </p>
          ) : (
            <p className="my-6 text-[16px] font-normal text-[#8C8C8C]">
              Sin renta activa
            </p>
          )}

          {/* Feature pills carousel */}
          <div
            className="flex justify-start gap-2 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory sm:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
            aria-label="Detalles del inmueble"
          >
            {pills.map(({ key, icon: Icon, label }) => (
              <span
                key={key}
                role="listitem"
                className="inline-flex snap-center shrink-0 items-center gap-1.5 rounded-full border border-[#E6E6E6] bg-white px-3 py-2 text-[12px] font-medium text-[#3A3A3A]"
              >
                <Icon className="size-3.5 text-black" strokeWidth={1.6} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
