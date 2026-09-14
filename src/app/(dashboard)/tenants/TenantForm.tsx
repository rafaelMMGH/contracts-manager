import FormCard, { FormField, inputClass } from '@/components/FormCard'
import PhoneInput from '@/components/PhoneInput'
import Link from 'next/link'
import { Tenant } from '@prisma/client'

interface Props {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Tenant>
}

export default function TenantForm({ action, defaultValues = {} }: Props) {
  const dob = defaultValues.dateOfBirth
    ? new Date(defaultValues.dateOfBirth).toISOString().split('T')[0]
    : ''

  return (
    <FormCard title="Datos del inquilino">
      <form action={action} className="space-y-5">
        {/* Required */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre completo" required>
            <input name="fullName" type="text" required defaultValue={defaultValues.fullName} className={inputClass} placeholder="Juan Pérez García" />
          </FormField>
          <FormField label="Teléfono" required>
            <PhoneInput name="phone" required defaultValue={defaultValues.phone} className={inputClass} />
          </FormField>
        </div>

        {/* Personal */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fecha de nacimiento">
            <input name="dateOfBirth" type="date" defaultValue={dob} className={inputClass} />
          </FormField>
          <FormField label="CURP / RFC">
            <input name="curpRfc" type="text" defaultValue={defaultValues.curpRfc ?? ''} className={inputClass} placeholder="PEGJ900101HCHRN01" />
          </FormField>
        </div>

        <FormField label="Correo electrónico">
          <input name="email" type="email" defaultValue={defaultValues.email ?? ''} className={inputClass} placeholder="inquilino@correo.com" />
        </FormField>

        <FormField label="Domicilio actual">
          <input name="currentAddress" type="text" defaultValue={defaultValues.currentAddress ?? ''} className={inputClass} placeholder="Calle, número, colonia, ciudad" />
        </FormField>

        {/* Emergency */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-sans font-normal tracking-[0.12em] uppercase text-slate-400 mb-4">Contacto de emergencia</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre">
              <input name="emergencyContactName" type="text" defaultValue={defaultValues.emergencyContactName ?? ''} className={inputClass} />
            </FormField>
            <FormField label="Teléfono">
              <PhoneInput name="emergencyContactPhone" defaultValue={defaultValues.emergencyContactPhone ?? ''} className={inputClass} />
            </FormField>
          </div>
        </div>

        {/* Reference */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-sans font-normal tracking-[0.12em] uppercase text-slate-400 mb-4">Referencia personal</p>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Nombre">
              <input name="referenceName" type="text" defaultValue={defaultValues.referenceName ?? ''} className={inputClass} />
            </FormField>
            <FormField label="Teléfono">
              <PhoneInput name="referencePhone" defaultValue={defaultValues.referencePhone ?? ''} className={inputClass} />
            </FormField>
            <FormField label="Relación">
              <input name="referenceRelationship" type="text" defaultValue={defaultValues.referenceRelationship ?? ''} className={inputClass} placeholder="Familiar, amigo..." />
            </FormField>
          </div>
        </div>

        {/* Employment */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-sans font-normal tracking-[0.12em] uppercase text-slate-400 mb-4">Información laboral</p>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Empleador">
              <input name="employerName" type="text" defaultValue={defaultValues.employerName ?? ''} className={inputClass} />
            </FormField>
            <FormField label="Tel. empleador">
              <PhoneInput name="employerPhone" defaultValue={defaultValues.employerPhone ?? ''} className={inputClass} />
            </FormField>
            <FormField label="Ingreso mensual">
              <input name="monthlyIncome" type="number" step="0.01" defaultValue={defaultValues.monthlyIncome?.toString() ?? ''} className={inputClass} placeholder="0.00" />
            </FormField>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="btn-primary">Guardar inquilino</button>
          <Link href="/tenants" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </FormCard>
  )
}
