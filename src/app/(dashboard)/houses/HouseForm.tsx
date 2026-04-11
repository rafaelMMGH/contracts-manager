import FormCard, { FormField, inputClass, selectClass } from '@/components/FormCard'
import Link from 'next/link'
import { Owner } from '@prisma/client'

interface Props {
  action: (formData: FormData) => Promise<void>
  owners: Owner[]
  defaultValues?: {
    ownerId?: string
    street?: string
    number?: string
    colony?: string
    city?: string
    state?: string
    zipCode?: string
    propertyType?: string
    status?: string
    notes?: string
  }
}

export default function HouseForm({ action, owners, defaultValues = {} }: Props) {
  return (
    <FormCard title="Datos del inmueble">
      <form action={action} className="space-y-5">
        <FormField label="Propietario" required>
          <select name="ownerId" required defaultValue={defaultValues.ownerId ?? ''} className={selectClass}>
            <option value="" disabled>Selecciona un propietario</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Calle" required>
            <input name="street" type="text" required defaultValue={defaultValues.street} className={inputClass} placeholder="Av. Central" />
          </FormField>
          <FormField label="Número" required>
            <input name="number" type="text" required defaultValue={defaultValues.number} className={inputClass} placeholder="123" />
          </FormField>
        </div>

        <FormField label="Colonia" required>
          <input name="colony" type="text" required defaultValue={defaultValues.colony} className={inputClass} placeholder="Centro" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ciudad" required>
            <input name="city" type="text" required defaultValue={defaultValues.city ?? 'Tuxtla Gutiérrez'} className={inputClass} />
          </FormField>
          <FormField label="Estado" required>
            <input name="state" type="text" required defaultValue={defaultValues.state ?? 'Chiapas'} className={inputClass} />
          </FormField>
        </div>

        <FormField label="Código postal" required>
          <input name="zipCode" type="text" required defaultValue={defaultValues.zipCode} className={inputClass} placeholder="29000" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tipo de inmueble" required>
            <select name="propertyType" required defaultValue={defaultValues.propertyType ?? 'RESIDENTIAL'} className={selectClass}>
              <option value="RESIDENTIAL">Casa Habitación</option>
              <option value="COMMERCIAL">Comercio</option>
            </select>
          </FormField>
          <FormField label="Estado del inmueble" required>
            <select name="status" required defaultValue={defaultValues.status ?? 'AVAILABLE'} className={selectClass}>
              <option value="AVAILABLE">Disponible</option>
              <option value="RENTED">Rentado</option>
              <option value="MAINTENANCE">Mantenimiento</option>
            </select>
          </FormField>
        </div>

        <FormField label="Notas u observaciones">
          <textarea
            name="notes"
            rows={3}
            defaultValue={defaultValues.notes ?? ''}
            className={inputClass}
            placeholder="Observaciones sobre el inmueble..."
          />
        </FormField>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="btn-primary">Guardar inmueble</button>
          <Link href="/houses" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </FormCard>
  )
}
