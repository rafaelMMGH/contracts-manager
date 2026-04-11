'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Owner } from '@prisma/client'
import Modal from '@/components/Modal'
import { FormField, inputClass, selectClass } from '@/components/FormCard'
import { showToast } from '@/components/Toast'
import { createHouse } from './actions'

interface Props {
  isOpen: boolean
  onClose: () => void
  owners: Owner[]
}

export default function NewHouseModal({ isOpen, onClose, owners }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const formId = 'new-house-form'

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
        await createHouse(formData)
        showToast('Inmueble creado correctamente')
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
      title="Nuevo inmueble"
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
            ) : 'Guardar inmueble'}
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
        <FormField label="Propietario" required>
          <select name="ownerId" required defaultValue="" className={selectClass}>
            <option value="" disabled>Selecciona un propietario</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Calle" required>
            <input name="street" type="text" required autoFocus className={inputClass} placeholder="Av. Central" />
          </FormField>
          <FormField label="Número" required>
            <input name="number" type="text" required className={inputClass} placeholder="123" />
          </FormField>
        </div>

        <FormField label="Colonia" required>
          <input name="colony" type="text" required className={inputClass} placeholder="Centro" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ciudad" required>
            <input name="city" type="text" required defaultValue="Tuxtla Gutiérrez" className={inputClass} />
          </FormField>
          <FormField label="Estado" required>
            <input name="state" type="text" required defaultValue="Chiapas" className={inputClass} />
          </FormField>
        </div>

        <FormField label="Código postal" required>
          <input name="zipCode" type="text" required className={inputClass} placeholder="29000" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tipo de inmueble" required>
            <select name="propertyType" required defaultValue="RESIDENTIAL" className={selectClass}>
              <option value="RESIDENTIAL">Casa Habitación</option>
              <option value="COMMERCIAL">Comercio</option>
            </select>
          </FormField>
          <FormField label="Estado del inmueble" required>
            <select name="status" required defaultValue="AVAILABLE" className={selectClass}>
              <option value="AVAILABLE">Disponible</option>
              <option value="RENTED">Rentado</option>
              <option value="MAINTENANCE">Mantenimiento</option>
            </select>
          </FormField>
        </div>

        <FormField label="Notas u observaciones">
          <textarea
            name="notes"
            rows={2}
            className={inputClass}
            placeholder="Observaciones sobre el inmueble…"
          />
        </FormField>
      </form>
    </Modal>
  )
}
