'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import { FormField, inputClass } from '@/components/FormCard'
import { showToast } from '@/components/Toast'
import { createTenant } from './actions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-[10px] text-slate-400 tracking-[0.12em] uppercase shrink-0 px-1">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  )
}

export default function NewTenantModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const formId = 'new-tenant-form'

  function handleClose() {
    setError('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createTenant(formData)
        showToast('Inquilino creado correctamente')
        handleClose()
        router.refresh()
      } catch {
        setError('Ocurrió un error al guardar. Intenta de nuevo.')
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo inquilino"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-ghost">
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isPending}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Guardando…
              </span>
            ) : 'Guardar inquilino'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {/* Datos principales */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre completo" required>
            <input
              name="fullName"
              type="text"
              required
              autoFocus
              className={inputClass}
              placeholder="Juan Pérez García"
            />
          </FormField>
          <FormField label="Teléfono" required>
            <input name="phone" type="tel" required className={inputClass} placeholder="961 000 0000" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fecha de nacimiento">
            <input name="dateOfBirth" type="date" className={inputClass} />
          </FormField>
          <FormField label="CURP / RFC">
            <input name="curpRfc" type="text" className={inputClass} placeholder="PEGJ900101HCHRN01" />
          </FormField>
        </div>

        <FormField label="Correo electrónico">
          <input name="email" type="email" className={inputClass} placeholder="inquilino@correo.com" />
        </FormField>

        <FormField label="Domicilio actual">
          <input name="currentAddress" type="text" className={inputClass} placeholder="Calle, número, colonia, ciudad" />
        </FormField>

        {/* Contacto de emergencia */}
        <SectionDivider label="Contacto de emergencia" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre">
            <input name="emergencyContactName" type="text" className={inputClass} />
          </FormField>
          <FormField label="Teléfono">
            <input name="emergencyContactPhone" type="tel" className={inputClass} />
          </FormField>
        </div>

        {/* Referencia personal */}
        <SectionDivider label="Referencia personal" />
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Nombre">
            <input name="referenceName" type="text" className={inputClass} />
          </FormField>
          <FormField label="Teléfono">
            <input name="referencePhone" type="tel" className={inputClass} />
          </FormField>
          <FormField label="Relación">
            <input name="referenceRelationship" type="text" className={inputClass} placeholder="Familiar…" />
          </FormField>
        </div>

        {/* Información laboral */}
        <SectionDivider label="Información laboral" />
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Empleador">
            <input name="employerName" type="text" className={inputClass} />
          </FormField>
          <FormField label="Tel. empleador">
            <input name="employerPhone" type="tel" className={inputClass} />
          </FormField>
          <FormField label="Ingreso mensual">
            <input name="monthlyIncome" type="number" step="0.01" className={inputClass} placeholder="0.00" />
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
