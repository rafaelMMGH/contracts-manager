import FormCard, { FormField, inputClass, selectClass } from '@/components/FormCard'
import Link from 'next/link'
import { House, Tenant, Owner } from '@prisma/client'

type HouseWithOwner = House & { owner: Owner }

interface Props {
  action: (formData: FormData) => Promise<void>
  houses: HouseWithOwner[]
  tenants: Tenant[]
  defaultValues?: {
    houseId?: string
    tenantId?: string
    rentPrice?: string
    depositPrice?: string
    startDate?: string
    startDateDay?: string
    deadline?: string
    witnessName?: string
    witness2Name?: string
    status?: string
  }
  isEdit?: boolean
}

export default function ContractForm({ action, houses, tenants, defaultValues = {}, isEdit }: Props) {
  return (
    <FormCard title="Datos del contrato">
      <form action={action} className="space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Inmueble" required>
            <select name="houseId" required defaultValue={defaultValues.houseId ?? ''} className={selectClass}>
              <option value="" disabled>Selecciona un inmueble</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.street} #{h.number}, {h.colony}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Inquilino" required>
            <select name="tenantId" required defaultValue={defaultValues.tenantId ?? ''} className={selectClass}>
              <option value="" disabled>Selecciona un inquilino</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Renta mensual (MXN)" required>
            <input name="rentPrice" type="number" step="0.01" required defaultValue={defaultValues.rentPrice} className={inputClass} placeholder="5000.00" />
          </FormField>
          <FormField label="Depósito (MXN)" required>
            <input name="depositPrice" type="number" step="0.01" required defaultValue={defaultValues.depositPrice} className={inputClass} placeholder="5000.00" />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Fecha de inicio" required>
            <input name="startDate" type="date" required defaultValue={defaultValues.startDate} className={inputClass} />
          </FormField>
          <FormField label="Día de pago" required hint="Día del mes en que se paga la renta">
            <input name="startDateDay" type="number" min="1" max="31" required defaultValue={defaultValues.startDateDay} className={inputClass} placeholder="1" />
          </FormField>
          <FormField label="Plazo (meses)" required>
            <select name="deadline" required defaultValue={defaultValues.deadline ?? '12'} className={selectClass}>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Testigo 1" required>
            <input name="witnessName" type="text" required defaultValue={defaultValues.witnessName} className={inputClass} placeholder="Nombre del testigo" />
          </FormField>
          <FormField label="Testigo 2" required>
            <input name="witness2Name" type="text" required defaultValue={defaultValues.witness2Name} className={inputClass} placeholder="Nombre del testigo" />
          </FormField>
        </div>

        {isEdit && (
          <FormField label="Estado del contrato" required>
            <select name="status" required defaultValue={defaultValues.status ?? 'ACTIVE'} className={selectClass}>
              <option value="ACTIVE">Activo</option>
              <option value="EXPIRED">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </FormField>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="btn-primary">{isEdit ? 'Guardar cambios' : 'Crear contrato'}</button>
          <Link href="/contracts" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </FormCard>
  )
}
