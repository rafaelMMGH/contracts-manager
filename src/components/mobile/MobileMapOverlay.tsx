'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  addTransitionType,
  startTransition,
} from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MobileHouseDto } from './types'
import { formatRent } from './housePlaceholders'
import HouseImageCarousel from './HouseImageCarousel'
import { cn } from '@/lib/utils'

type MobileMapOverlayProps = {
  open: boolean
  onClose: () => void
  houses: MobileHouseDto[]
}

type Pin = {
  house: MobileHouseDto
  lat: number
  lng: number
}

/** Bottom pad when no card — keep pins clear of attribution / chrome. */
const PAD_IDLE = { top: 72, left: 40, right: 40, bottom: 56 } as const
/** Bottom pad with floating card visible (~card height + margin). */
const PAD_CARD = { top: 72, left: 40, right: 40, bottom: 240 } as const

export default function MobileMapOverlay({
  open,
  onClose,
  houses,
}: MobileMapOverlayProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const markerElsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const selectPinRef = useRef<(id: string) => void>(() => {})
  const clearSelectionRef = useRef<() => void>(() => {})
  const suppressMapClickRef = useRef(false)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pins, setPins] = useState<Pin[]>([])
  const [missCount, setMissCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const housesKey = useMemo(
    () =>
      houses
        .map((h) => `${h.id}:${h.latitude ?? ''}:${h.longitude ?? ''}`)
        .join(','),
    [houses]
  )

  const selectedPin = useMemo(
    () => pins.find((p) => p.house.id === selectedId) ?? null,
    [pins, selectedId]
  )

  selectPinRef.current = (id: string) => {
    setSelectedId(id)
  }
  clearSelectionRef.current = () => {
    setSelectedId(null)
  }

  const openDetail = useCallback(
    (houseId: string) => {
      startTransition(() => {
        addTransitionType('nav-forward')
        router.push(`/houses/${houseId}`)
      })
    },
    [router]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setSelectedId(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setPins([])
    setMissCount(0)
    setSelectedId(null)

    const snapshot = houses
    const withCoords: Pin[] = []
    const needGeocode: { id: string; query: string }[] = []

    for (const h of snapshot) {
      if (
        h.latitude != null &&
        h.longitude != null &&
        Number.isFinite(h.latitude) &&
        Number.isFinite(h.longitude)
      ) {
        withCoords.push({ house: h, lat: h.latitude, lng: h.longitude })
      } else {
        needGeocode.push({
          id: h.id,
          query: `${h.address}, ${h.city}, México`,
        })
      }
    }

    ;(async () => {
      try {
        const geocoded: Pin[] = []
        let misses = 0

        if (needGeocode.length > 0) {
          const res = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: needGeocode }),
          })
          if (!res.ok) throw new Error('Geocode failed')
          const data = (await res.json()) as {
            hits: { id?: string; lat: number; lng: number }[]
            misses: { id?: string }[]
          }
          if (cancelled) return

          const byId = new Map(snapshot.map((h) => [h.id, h]))
          for (const hit of data.hits) {
            if (!hit.id) continue
            const house = byId.get(hit.id)
            if (house) geocoded.push({ house, lat: hit.lat, lng: hit.lng })
          }
          misses = data.misses?.length ?? 0
        }

        if (cancelled) return
        setPins([...withCoords, ...geocoded])
        setMissCount(misses)
      } catch {
        if (!cancelled) {
          if (withCoords.length > 0) {
            setPins(withCoords)
            setMissCount(needGeocode.length)
          } else {
            setError('No se pudo cargar el mapa de ubicaciones.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, housesKey])

  useEffect(() => {
    if (!open || !mounted || !containerRef.current) return

    const container = containerRef.current
    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [-99.1332, 19.4326],
      zoom: 11,
      attributionControl: false,
    })

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    )
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    )

    const resize = () => map.resize()
    resize()
    requestAnimationFrame(resize)
    map.on('load', resize)

    const onMapClick = () => {
      if (suppressMapClickRef.current) return
      clearSelectionRef.current()
    }
    map.on('click', onMapClick)

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      markerElsRef.current.clear()
      map.off('load', resize)
      map.off('click', onMapClick)
      map.remove()
      mapRef.current = null
    }
  }, [open, mounted])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !open) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    markerElsRef.current.clear()

    if (pins.length === 0) return

    const bounds = new maplibregl.LngLatBounds()

    for (const pin of pins) {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'mobile-map-pin'
      el.dataset.houseId = pin.house.id
      el.setAttribute('aria-label', pin.house.title)
      el.innerHTML = `<span class="mobile-map-pin__dot"></span>`

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        suppressMapClickRef.current = true
        selectPinRef.current(pin.house.id)
        window.setTimeout(() => {
          suppressMapClickRef.current = false
        }, 0)
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)

      markersRef.current.push(marker)
      markerElsRef.current.set(pin.house.id, el)
      bounds.extend([pin.lng, pin.lat])
    }

    if (pins.length === 1) {
      map.easeTo({
        center: [pins[0].lng, pins[0].lat],
        zoom: 14,
        padding: { ...PAD_IDLE },
        duration: 600,
      })
    } else {
      map.fitBounds(bounds, {
        padding: { ...PAD_IDLE },
        maxZoom: 15,
        duration: 600,
      })
    }
    map.resize()
  }, [pins, open])

  useEffect(() => {
    markerElsRef.current.forEach((el, id) => {
      el.classList.toggle('mobile-map-pin--selected', id === selectedId)
    })
  }, [selectedId, pins])

  useEffect(() => {
    if (!selectedId) return
    const pin = pins.find((p) => p.house.id === selectedId)
    const map = mapRef.current
    if (!pin || !map) return

    map.easeTo({
      center: [pin.lng, pin.lat],
      zoom: Math.max(map.getZoom(), 13),
      padding: { ...PAD_CARD },
      duration: 450,
    })
  }, [selectedId, pins])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedId) {
          setSelectedId(null)
          return
        }
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, selectedId])

  if (!mounted || !open) return null

  const total = houses.length
  const located = pins.length

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#F3F5F4] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de inmuebles"
    >
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <div ref={containerRef} className="h-full w-full" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-20 liquid-glass flex size-11 items-center justify-center rounded-full text-text-primary transition-transform active:scale-[0.96]"
          aria-label="Volver"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </button>

        {loading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#F3F5F4]/80 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-brand-600" strokeWidth={2} />
            <p className="text-[13px] text-text-muted">
              Cargando ubicaciones…
            </p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="absolute inset-x-4 top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] z-10 rounded-2xl bg-white/95 px-4 py-3 text-[13px] text-red-700 shadow-card">
            {error}
          </div>
        ) : null}

        {!loading && !error && missCount > 0 ? (
          <div
            className={cn(
              'absolute inset-x-4 z-10',
              'top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))]',
              'rounded-2xl border border-white/70 bg-white/90 px-4 py-2.5 text-[12px] text-text-secondary',
              'shadow-[0_8px_28px_rgba(15,23,42,0.1)] backdrop-blur-xl'
            )}
          >
            {located} de {total} ubicados · No se pudo ubicar {missCount}
          </div>
        ) : null}

        {selectedPin ? (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 z-30 px-8',
              'bottom-[max(1rem,env(safe-area-inset-bottom))]'
            )}
          >
            <div
              key={selectedPin.house.id}
              className="pointer-events-auto animate-[mapCardIn_220ms_cubic-bezier(0.2,0,0,1)_both]"
            >
              <MapFloatingCard
                house={selectedPin.house}
                onOpen={() => openDetail(selectedPin.house.id)}
                onDismiss={() => setSelectedId(null)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

function MapFloatingCard({
  house,
  onOpen,
  onDismiss,
}: {
  house: MobileHouseDto
  onOpen: () => void
  onDismiss: () => void
}) {
  const images =
    house.images?.length > 0 ? house.images : house.image ? [house.image] : []
  const mediaGesture = useRef<{ x: number; y: number; scrolled: boolean } | null>(
    null
  )

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl bg-white',
        'shadow-[0_10px_32px_rgba(15,23,42,0.16)]',
        'ring-1 ring-black/[0.06]'
      )}
    >
      <div
        className="relative"
        onPointerDown={(e) => {
          mediaGesture.current = {
            x: e.clientX,
            y: e.clientY,
            scrolled: false,
          }
        }}
        onPointerMove={(e) => {
          const g = mediaGesture.current
          if (!g) return
          if (
            Math.abs(e.clientX - g.x) > 10 ||
            Math.abs(e.clientY - g.y) > 10
          ) {
            g.scrolled = true
          }
        }}
        onClick={() => {
          const g = mediaGesture.current
          mediaGesture.current = null
          if (g?.scrolled) return
          onOpen()
        }}
      >
        <HouseImageCarousel
          images={images}
          alt={house.title}
          badgeStatus={house.badgeStatus}
          expiresInDays={house.expiresInDays}
          className="!aspect-[2/1] !rounded-t-xl !rounded-b-none"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            'absolute right-2.5 top-2.5 z-20 flex size-7 items-center justify-center rounded-full',
            'bg-black/45 text-white backdrop-blur-md',
            'shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.94]'
          )}
          aria-label="Cerrar tarjeta"
        >
          <X className="size-3.5" strokeWidth={2.25} />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver detalle de ${house.title}`}
        className="w-full space-y-0.5 px-2.5 py-2 text-left"
      >
        <p className="truncate text-[13px] font-semibold tracking-tight text-text-primary">
          {house.title}
        </p>
        <p className="truncate text-[10px] text-text-muted">
          {house.address}
          {house.city ? ` · ${house.city}` : ''}
        </p>
        {house.rentMxn != null ? (
          <p className="pt-0.5 text-[13px] font-semibold tabular-nums text-text-primary">
            {formatRent(house.rentMxn)}
            <span className="ml-1 text-[10px] font-medium text-text-muted">
              / mes
            </span>
          </p>
        ) : (
          <p className="pt-0.5 text-[10px] font-medium text-text-muted">
            Sin renta activa
          </p>
        )}
      </button>
    </article>
  )
}
