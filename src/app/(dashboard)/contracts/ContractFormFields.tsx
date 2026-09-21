'use client'

import { useState } from 'react'

type HouseOption = {
  id: string
  label: string
}

type TenantOption = {
  id: string
  fullName: string
}

export type ContractFormDefaults = {
  houseId?: string
  tenantId?: string
  rentPrice?: number | string
  depositPrice?: number | string
  startDate?: string
  startDateDay?: number | string
  deadline?: number | string
  witnessName?: string
  witness2Name?: string
  status?: string
}

type ContractFormFieldsProps = {
  houses: HouseOption[]
  tenants: TenantOption[]
  defaults?: ContractFormDefaults
  /** When set, inmueble is fixed (hidden input + disabled select). */
  lockedHouseId?: string
  showStatus?: boolean
}

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

/** Local calendar YYYY-MM-DD (avoids UTC day shift). */
export function todayDateStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dayFromDateStr(dateStr: string) {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return 1
  const day = Number(parts[2])
  return Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1
}

export default function ContractFormFields({
  houses,
  tenants,
  defaults = {},
  lockedHouseId,
  showStatus = false,
}: ContractFormFieldsProps) {
  const initialStart =
    defaults.startDate ?? (showStatus ? undefined : todayDateStr())
  const [startDate, setStartDate] = useState(initialStart ?? todayDateStr())
  const [payDay, setPayDay] = useState(() => {
    if (defaults.startDateDay != null && defaults.startDateDay !== '') {
      return String(defaults.startDateDay)
    }
    return String(dayFromDateStr(initialStart ?? todayDateStr()))
  })

  const houseId = lockedHouseId ?? defaults.houseId ?? ''

  function handleStartDateChange(value: string) {
    setStartDate(value)
    setPayDay(String(dayFromDateStr(value)))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Inmueble" required>
          {lockedHouseId ? (
            <>
              <input type="hidden" name="houseId" value={lockedHouseId} />
              <select
                disabled
                value={lockedHouseId}
                className={`${f} opacity-70`}
                aria-readonly="true"
              >
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <select
              name="houseId"
              required
              defaultValue={houseId}
              className={f}
            >
              <option value="" disabled>
                Selecciona
              </option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField label="Inquilino" required>
          <select
            name="tenantId"
            required
            defaultValue={defaults.tenantId ?? ''}
            className={f}
          >
            <option value="" disabled>
              Selecciona
            </option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Renta mensual (MXN)" required>
          <input
            name="rentPrice"
            type="number"
            step="0.01"
            required
            defaultValue={defaults.rentPrice}
            className={f}
            placeholder="5000.00"
          />
        </FormField>
        <FormField label="Depósito (MXN)" required>
          <input
            name="depositPrice"
            type="number"
            step="0.01"
            required
            defaultValue={defaults.depositPrice}
            className={f}
            placeholder="5000.00"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Fecha de inicio" required>
          <input
            name="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className={f}
          />
        </FormField>
        <FormField
          label="Día de pago"
          required
          hint="Se sincroniza con la fecha de inicio; puedes cambiarlo"
        >
          <input
            name="startDateDay"
            type="number"
            min={1}
            max={31}
            required
            value={payDay}
            onChange={(e) => setPayDay(e.target.value)}
            className={f}
            placeholder="1"
          />
        </FormField>
        <FormField label="Plazo" required>
          <select
            name="deadline"
            required
            defaultValue={String(defaults.deadline ?? '6')}
            className={f}
          >
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Testigo 1" required>
          <input
            name="witnessName"
            type="text"
            required
            defaultValue={defaults.witnessName}
            className={f}
            placeholder="Nombre del testigo"
          />
        </FormField>
        <FormField label="Testigo 2" required>
          <input
            name="witness2Name"
            type="text"
            required
            defaultValue={defaults.witness2Name}
            className={f}
            placeholder="Nombre del testigo"
          />
        </FormField>
      </div>

      {showStatus ? (
        <FormField label="Estado">
          <select
            name="status"
            required
            defaultValue={defaults.status ?? 'ACTIVE'}
            className={f}
          >
            <option value="ACTIVE">Activo</option>
          </select>
        </FormField>
      ) : null}
    </>
  )
}
