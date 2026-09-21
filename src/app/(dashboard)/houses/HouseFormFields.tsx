'use client'

type OwnerOption = {
  id: string
  name: string
}

type HouseFormDefaults = {
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
}

export default function HouseFormFields({
  owners,
  defaults = {},
  showStatus = false,
  hasContract = false,
}: HouseFormFieldsProps) {
  const defaultState = defaults.state ?? 'Chiapas'

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
      <FormField label="Calle" required>
        <input
          name="street"
          type="text"
          required
          defaultValue={defaults.street}
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
            defaultValue={defaults.number}
            className={f}
            placeholder="123"
          />
        </FormField>
        <FormField label="Colonia" required>
          <input
            name="colony"
            type="text"
            required
            defaultValue={defaults.colony}
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
            defaultValue={defaults.city ?? 'Tuxtla Gutiérrez'}
            className={f}
          />
        </FormField>
        <FormField label="Estado" required>
          <select
            name="state"
            required
            defaultValue={
              (MEXICAN_STATES as readonly string[]).includes(defaultState)
                ? defaultState
                : 'Chiapas'
            }
            className={f}
          >
            {MEXICAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </FormField>
      </div>
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
