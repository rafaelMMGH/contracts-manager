import { NextRequest, NextResponse } from 'next/server'

export type GeocodeHit = {
  query: string
  id?: string
  lat: number
  lng: number
}

export type GeocodeMiss = {
  query: string
  id?: string
  error: string
}

type NominatimResult = {
  lat: string
  lon: string
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
/** Nominatim usage policy: max ~1 req/s */
const DELAY_MS = 1100

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocodeOne(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL(NOMINATIM)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'mx')

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ContratosManager/1.0 (property-management; local-dev)',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) return null
  const data = (await res.json()) as NominatimResult[]
  if (!data?.length) return null
  const lat = Number(data[0].lat)
  const lng = Number(data[0].lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

/**
 * Live-geocode address queries via Nominatim (proxied to avoid CORS + set User-Agent).
 * Body: { items: { id?: string; query: string }[] }
 */
export async function POST(req: NextRequest) {
  let body: { items?: { id?: string; query: string }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const items = body.items?.filter((i) => i.query?.trim()) ?? []
  if (items.length === 0) {
    return NextResponse.json({ hits: [], misses: [] })
  }
  if (items.length > 40) {
    return NextResponse.json(
      { error: 'Máximo 40 direcciones por solicitud' },
      { status: 400 }
    )
  }

  const hits: GeocodeHit[] = []
  const misses: GeocodeMiss[] = []

  for (let i = 0; i < items.length; i++) {
    if (i > 0) await sleep(DELAY_MS)
    const item = items[i]
    const query = item.query.trim()
    try {
      const coords = await geocodeOne(query)
      if (coords) {
        hits.push({ query, id: item.id, ...coords })
      } else {
        misses.push({ query, id: item.id, error: 'Sin resultados' })
      }
    } catch {
      misses.push({ query, id: item.id, error: 'Error de geocodificación' })
    }
  }

  return NextResponse.json({ hits, misses })
}
