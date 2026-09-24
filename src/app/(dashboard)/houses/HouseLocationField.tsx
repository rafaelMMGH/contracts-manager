'use client'

import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Loader2, MapPinned } from 'lucide-react'
import { cn } from '@/lib/utils'

type HouseLocationFieldProps = {
  initialLatitude?: number | null
  initialLongitude?: number | null
  /** Called when street/number/colony changed after a pin was set */
  locationStale: boolean
  onLocationStaleChange: (stale: boolean) => void
  onCoordsChange: (coords: { lat: number; lng: number } | null) => void
  getAddressQuery: () => string
  disabled?: boolean
}

export default function HouseLocationField({
  initialLatitude = null,
  initialLongitude = null,
  locationStale,
  onLocationStaleChange,
  onCoordsChange,
  getAddressQuery,
  disabled = false,
}: HouseLocationFieldProps) {
  const [lat, setLat] = useState<number | null>(
    initialLatitude != null && Number.isFinite(initialLatitude)
      ? initialLatitude
      : null
  )
  const [lng, setLng] = useState<number | null>(
    initialLongitude != null && Number.isFinite(initialLongitude)
      ? initialLongitude
      : null
  )
  const [mapOpen, setMapOpen] = useState(
    () =>
      initialLatitude != null &&
      initialLongitude != null &&
      Number.isFinite(initialLatitude) &&
      Number.isFinite(initialLongitude)
  )
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)

  useEffect(() => {
    onCoordsChange(
      lat != null && lng != null ? { lat, lng } : null
    )
  }, [lat, lng, onCoordsChange])

  useEffect(() => {
    if (!mapOpen || !containerRef.current) return

    const center: [number, number] =
      lng != null && lat != null ? [lng, lat] : [-93.1292, 16.7569]

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
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center,
      zoom: lat != null ? 15 : 11,
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

    const el = document.createElement('div')
    el.className = 'mobile-map-pin'
    el.innerHTML = `<span class="mobile-map-pin__dot"></span>`

    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'bottom',
      draggable: !disabled,
    })
      .setLngLat(center)
      .addTo(map)

    // Visible pin must match form state — otherwise users see a pin but cannot
    // submit (hidden lat/lng stay empty after geocode miss / empty map open).
    if (lat == null || lng == null) {
      setLat(center[1])
      setLng(center[0])
      onLocationStaleChange(false)
    }

    marker.on('dragend', () => {
      const pos = marker.getLngLat()
      setLat(pos.lat)
      setLng(pos.lng)
      onLocationStaleChange(false)
      setError(null)
    })

    map.on('click', (e) => {
      if (disabled) return
      marker.setLngLat(e.lngLat)
      setLat(e.lngLat.lat)
      setLng(e.lngLat.lng)
      onLocationStaleChange(false)
      setError(null)
    })

    mapRef.current = map
    markerRef.current = marker

    requestAnimationFrame(() => {
      map.resize()
    })

    return () => {
      marker.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
    // Intentionally only remount when map opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOpen, disabled])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (lat == null || lng == null) return
    markerRef.current.setLngLat([lng, lat])
    mapRef.current.easeTo({ center: [lng, lat], zoom: 15, duration: 400 })
  }, [lat, lng])

  async function locateFromAddress() {
    if (disabled) return
    const query = getAddressQuery().trim()
    if (!query) {
      setError('Completa calle, número y colonia primero')
      return
    }

    setGeocoding(true)
    setError(null)
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: 'pin', query }] }),
      })
      if (!res.ok) throw new Error('Geocode failed')
      const data = (await res.json()) as {
        hits: { lat: number; lng: number }[]
      }
      const hit = data.hits[0]
      if (!hit) {
        setError('No se encontró la dirección. Mueve el pin manualmente.')
        // Open map with a saveable default pin (Tuxtla) so submit is not blocked
        // by a visual-only marker with empty hidden lat/lng fields.
        setLat(16.7569)
        setLng(-93.1292)
        onLocationStaleChange(false)
        setMapOpen(true)
        return
      }
      setLat(hit.lat)
      setLng(hit.lng)
      onLocationStaleChange(false)
      setMapOpen(true)
    } catch {
      setError('No se pudo ubicar. Intenta de nuevo.')
    } finally {
      setGeocoding(false)
    }
  }

  function keepCurrentPin() {
    onLocationStaleChange(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-[11px] font-medium tracking-wide text-[#64748b]">
          Ubicación en el mapa
          <span className="ml-0.5 text-[#3f5c48]">*</span>
        </label>
      </div>

      <input
        type="hidden"
        name="latitude"
        value={lat ?? ''}
        required
      />
      <input
        type="hidden"
        name="longitude"
        value={lng ?? ''}
        required
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || geocoding}
          onClick={locateFromAddress}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[12px] font-medium text-[#475569] transition hover:border-[#3f5c48]/40 hover:text-[#3f5c48] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {geocoding ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <MapPinned className="size-3.5" strokeWidth={2} />
          )}
          {mapOpen || (lat != null && lng != null)
            ? 'Reubicar desde dirección'
            : 'Ubicar en mapa'}
        </button>
        {!mapOpen && lat == null ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMapOpen(true)}
            className="text-[12px] font-medium text-[#3f5c48] hover:underline disabled:opacity-40"
          >
            Abrir mapa vacío
          </button>
        ) : null}
      </div>

      {locationStale ? (
        <div
          className={cn(
            'rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900'
          )}
          role="status"
        >
          <p className="mb-2 font-medium">
            La dirección cambió. Confirma la ubicación del pin.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={locateFromAddress}
              disabled={disabled || geocoding}
              className="rounded-lg bg-amber-900 px-2.5 py-1.5 text-[11px] font-medium text-white disabled:opacity-40"
            >
              Reubicar
            </button>
            <button
              type="button"
              onClick={keepCurrentPin}
              disabled={disabled || lat == null}
              className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-amber-900 disabled:opacity-40"
            >
              Mantener ubicación actual
            </button>
          </div>
        </div>
      ) : null}

      {mapOpen ? (
        <div className="overflow-hidden rounded-xl border border-black/[0.08]">
          <div ref={containerRef} className="h-52 w-full" />
          <p className="bg-[#f8fafc] px-3 py-1.5 text-[10px] text-[#94a3b8]">
            Arrastra el pin o toca el mapa para ajustar. Sin geocodificación
            inversa.
          </p>
        </div>
      ) : null}

      {lat != null && lng != null && !locationStale ? (
        <p className="text-[10px] tabular-nums text-[#94a3b8]">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      ) : null}

      {error ? (
        <p className="text-[11px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {lat == null || lng == null ? (
        <p className="text-[11px] text-[#b45309]">
          Ubica el inmueble en el mapa para guardar.
        </p>
      ) : null}
    </div>
  )
}
