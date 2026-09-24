'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import HouseImageGallery from './HouseImageGallery'
import HouseLocationField from './HouseLocationField'
import type { HouseImageItem } from '@/lib/houseImages'

type OwnerOption = {
  id: string
  name: string
}

export type HouseFormDefaults = {
  ownerId?: string
  name?: string | null
  street?: string
  number?: string
  colony?: string
  city?: string
  state?: string
  zipCode?: string
  propertyType?: string
  status?: string
  notes?: string | null
  latitude?: number | null
  longitude?: number | null
  images?: HouseImageItem[]
}

/** 32 estados + CDMX */
const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
] as const

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium tracking-wide text-[#64748b]">
        {label}
        {required ? <span className="ml-0.5 text-[#3f5c48]">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[10px] text-[#94a3b8]">{hint}</p> : null}
    </div>
  )
}

const f = 'field-input'

type HouseFormFieldsProps = {
  owners: OwnerOption[]
  defaults?: HouseFormDefaults
  /** When false (create), status is hidden and submits AVAILABLE. */
  showStatus?: boolean
  /**
   * When true (Activo/Vencido contract), Estado is read-only Rentado.
   * When false, user may pick Disponible | Mantenimiento.
   */
  hasContract?: boolean
  /** False when location is missing or address changed without confirming pin. */
  onCanSubmitChange?: (canSubmit: boolean) => void
}

export default function HouseFormFields({
  owners,
  defaults = {},
  showStatus = false,
  hasContract = false,
  onCanSubmitChange,
}: HouseFormFieldsProps) {
  const defaultState = defaults.state ?? 'Chiapas'

  const baselineAddress = useRef({
    street: defaults.street ?? '',
    number: defaults.number ?? '',
    colony: defaults.colony ?? '',
  })

  const [street, setStreet] = useState(defaults.street ?? '')
  const [number, setNumber] = useState(defaults.number ?? '')
  const [colony, setColony] = useState(defaults.colony ?? '')
  const [city, setCity] = useState(defaults.city ?? 'Tuxtla Gutiérrez')
  const [state, setState] = useState(
    (MEXICAN_STATES as readonly string[]).includes(defaultState)
      ? defaultState
      : 'Chiapas'
  )

  const [locationStale, setLocationStale] = useState(false)
  const [hasCoords, setHasCoords] = useState(
    () =>
      defaults.latitude != null &&
      defaults.longitude != null &&
      Number.isFinite(defaults.latitude) &&
      Number.isFinite(defaults.longitude)
  )

  const onCoordsChange = useCallback(
    (coords: { lat: number; lng: number } | null) => {
      setHasCoords(coords != null)
    },
    []
  )

  const getAddressQuery = useCallback(() => {
    const parts = [street, number, colony, city, state, 'México']
      .map((p) => p.trim())
      .filter(Boolean)
    return parts.join(', ')
  }, [street, number, colony, city, state])

  function markAddressDirty(
    next: Partial<{ street: string; number: string; colony: string }>
  ) {
    const merged = {
      street: next.street ?? street,
      number: next.number ?? number,
      colony: next.colony ?? colony,
    }
    const base = baselineAddress.current
    const changed =
      merged.street !== base.street ||
      merged.number !== base.number ||
      merged.colony !== base.colony
    if (changed && hasCoords) {
      setLocationStale(true)
    }
  }

  function handleLocationStaleChange(stale: boolean) {
    setLocationStale(stale)
    if (!stale) {
      baselineAddress.current = { street, number, colony }
    }
  }

  useEffect(() => {
    onCanSubmitChange?.(hasCoords && !locationStale)
  }, [hasCoords, locationStale, onCanSubmitChange])

  return (
    <>
      <FormField label="Propietario" required>
        <select
          name="ownerId"
          required
          defaultValue={defaults.ownerId ?? ''}
          className={f}
        >
          <option value="" disabled>
            Selecciona un propietario
          </option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Nombre del inmueble" required>
        <input
          name="name"
          type="text"
          required
          defaultValue={defaults.name ?? ''}
          className={f}
          placeholder="Casa Centro, Local Reforma…"
        />
      </FormField>

      <div className="space-y-4 border-t border-black/[0.06] pt-4">
        <HouseImageGallery initialImages={defaults.images ?? []} />

        <FormField label="Calle" required>
          <input
            name="street"
            type="text"
            required
            value={street}
            onChange={(e) => {
              const v = e.target.value
              setStreet(v)
              markAddressDirty({ street: v })
            }}
            className={f}
            placeholder="Av. Central"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Número" required>
            <input
              name="number"
              type="text"
              required
              value={number}
              onChange={(e) => {
                const v = e.target.value
                setNumber(v)
                markAddressDirty({ number: v })
              }}
              className={f}
              placeholder="123"
            />
          </FormField>
          <FormField label="Colonia" required>
            <input
              name="colony"
              type="text"
              required
              value={colony}
              onChange={(e) => {
                const v = e.target.value
                setColony(v)
                markAddressDirty({ colony: v })
              }}
              className={f}
              placeholder="Centro"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ciudad" required>
            <input
              name="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={f}
            />
          </FormField>
          <FormField label="Estado" required>
            <select
              name="state"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={f}
            >
              {MEXICAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <HouseLocationField
          initialLatitude={defaults.latitude}
          initialLongitude={defaults.longitude}
          locationStale={locationStale}
          onLocationStaleChange={handleLocationStaleChange}
          onCoordsChange={onCoordsChange}
          getAddressQuery={getAddressQuery}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Código postal" required>
          <input
            name="zipCode"
            type="text"
            required
            defaultValue={defaults.zipCode}
            className={f}
            placeholder="29000"
          />
        </FormField>
      </div>

      <div className="mt-2 space-y-4 border-t border-black/[0.06] pt-4">
        {showStatus ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo de inmueble" required>
              <select
                name="propertyType"
                required
                defaultValue={defaults.propertyType ?? 'RESIDENTIAL'}
                className={f}
              >
                <option value="RESIDENTIAL">Casa Habitación</option>
                <option value="COMMERCIAL">Comercio</option>
              </select>
            </FormField>
            <FormField
              label="Estado del inmueble"
              required
              hint={
                hasContract
                  ? 'Lo define el contrato (Rentado). Cancela el contrato para cambiarlo.'
                  : 'Disponible o Mantenimiento. Rentado lo asigna el sistema al crear un contrato.'
              }
            >
              {hasContract ? (
                <>
                  <input type="hidden" name="status" value="RENTED" />
                  <select
                    disabled
                    value="RENTED"
                    className={`${f} opacity-70`}
                    aria-readonly="true"
                  >
                    <option value="RENTED">Rentado</option>
                  </select>
                </>
              ) : (
                <select
                  name="status"
                  required
                  defaultValue={
                    defaults.status === 'MAINTENANCE'
                      ? 'MAINTENANCE'
                      : 'AVAILABLE'
                  }
                  className={f}
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                </select>
              )}
            </FormField>
          </div>
        ) : (
          <>
            <FormField label="Tipo de inmueble" required>
              <select
                name="propertyType"
                required
                defaultValue={defaults.propertyType ?? 'RESIDENTIAL'}
                className={f}
              >
                <option value="RESIDENTIAL">Casa Habitación</option>
                <option value="COMMERCIAL">Comercio</option>
              </select>
            </FormField>
            <input type="hidden" name="status" value="AVAILABLE" />
          </>
        )}

        <FormField label="Notas">
          <textarea
            name="notes"
            rows={2}
            defaultValue={defaults.notes ?? ''}
            className={f}
            placeholder="Observaciones…"
          />
        </FormField>
      </div>
    </>
  )
}
