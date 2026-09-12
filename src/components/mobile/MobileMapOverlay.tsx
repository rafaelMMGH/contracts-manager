'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  addTransitionType,
  startTransition,
} from 'react'
import { X, Loader2, MapPinned } from 'lucide-react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MobileHouseDto } from './types'
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

export default function MobileMapOverlay({
  open,
  onClose,
  houses,
}: MobileMapOverlayProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pins, setPins] = useState<Pin[]>([])
  const [missCount, setMissCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setPins([])
    setMissCount(0)

    const snapshot = houses
    const items = snapshot.map((h) => ({
      id: h.id,
      query: `${h.address}, ${h.city}, México`,
    }))
    const requestKey = items.map((i) => i.id).join(',')

    ;(async () => {
      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })
        if (!res.ok) throw new Error('Geocode failed')
        const data = (await res.json()) as {
          hits: { id?: string; lat: number; lng: number }[]
          misses: { id?: string }[]
        }
        if (cancelled) return

        const byId = new Map(snapshot.map((h) => [h.id, h]))
        const next: Pin[] = []
        for (const hit of data.hits) {
          if (!hit.id) continue
          const house = byId.get(hit.id)
          if (house) next.push({ house, lat: hit.lat, lng: hit.lng })
        }
        setPins(next)
        setMissCount(data.misses?.length ?? 0)
      } catch {
        if (!cancelled) setError('No se pudo cargar el mapa de ubicaciones.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // Re-run when the visible set of house ids changes while open
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by ids
  }, [open, houses.map((h) => h.id).join(',')])

  useEffect(() => {
    if (!open || !mounted || !containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
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

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [open, mounted])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !open) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (pins.length === 0) return

    const bounds = new maplibregl.LngLatBounds()

    for (const pin of pins) {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'mobile-map-pin'
      el.setAttribute('aria-label', pin.house.title)
      el.innerHTML = `<span class="mobile-map-pin__dot"></span>`

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onClose()
        startTransition(() => {
          addTransitionType('nav-forward')
          router.push(`/houses/${pin.house.id}`)
        })
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)

      markersRef.current.push(marker)
      bounds.extend([pin.lng, pin.lat])
    }

    if (pins.length === 1) {
      map.easeTo({ center: [pins[0].lng, pins[0].lat], zoom: 14, duration: 600 })
    } else {
      map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 600 })
    }
  }, [pins, open, onClose, router])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
      <header className="relative z-20 flex items-center gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="liquid-glass flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 py-2.5">
          <MapPinned className="size-4 shrink-0 text-brand-700" strokeWidth={1.9} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-text-primary">
              Mapa
            </p>
            <p className="truncate text-[11px] text-text-muted">
              {loading
                ? 'Ubicando inmuebles…'
                : located > 0
                  ? `${located} de ${total} ubicados`
                  : total === 0
                    ? 'Sin inmuebles'
                    : 'Sin ubicaciones'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="liquid-glass flex size-11 shrink-0 items-center justify-center rounded-full text-text-primary transition-transform active:scale-[0.96]"
          aria-label="Cerrar mapa"
        >
          <X className="size-5" strokeWidth={2} />
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <div ref={containerRef} className="absolute inset-0" />

        {loading ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#F3F5F4]/80 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-brand-600" strokeWidth={2} />
            <p className="text-[13px] text-text-muted">
              Geocodificando direcciones…
            </p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="absolute inset-x-4 top-4 z-10 rounded-2xl bg-white/95 px-4 py-3 text-[13px] text-red-700 shadow-card">
            {error}
          </div>
        ) : null}

        {!loading && !error && missCount > 0 ? (
          <div
            className={cn(
              'absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10',
              'rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-[12px] text-text-secondary',
              'shadow-[0_8px_28px_rgba(15,23,42,0.1)] backdrop-blur-xl'
            )}
          >
            {located} de {total} ubicados
            {missCount > 0
              ? ` · No se pudo ubicar ${missCount}`
              : null}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}
