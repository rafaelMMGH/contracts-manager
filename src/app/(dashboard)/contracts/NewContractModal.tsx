'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { House, Tenant, Owner } from '@prisma/client'
import Modal from '@/components/Modal'
import { FormField, inputClass, selectClass } from '@/components/FormCard'
import { showToast } from '@/components/Toast'
import { createContract } from './actions'

type HouseWithOwner = House & { owner: Owner }

interface Props {
  isOpen: boolean
  onClose: () => void
  houses: HouseWithOwner[]
  tenants: Tenant[]
}

export default function NewContractModal({ isOpen, onClose, houses, tenants }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const formId = 'new-contract-form'

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
        await createContract(formData)
        showToast('Contrato creado correctamente')
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
      title="Nuevo contrato"
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
            ) : 'Crear contrato'}
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Inmueble" required>
            <select name="houseId" required defaultValue="" className={selectClass}>
              <option value="" disabled>Selecciona un inmueble</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.street} #{h.number}, {h.colony}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Inquilino" required>
            <select name="tenantId" required defaultValue="" className={selectClass}>
              <option value="" disabled>Selecciona un inquilino</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Renta mensual (MXN)" required>
            <input name="rentPrice" type="number" step="0.01" required autoFocus className={inputClass} placeholder="5000.00" />
          </FormField>
          <FormField label="Depósito (MXN)" required>
            <input name="depositPrice" type="number" step="0.01" required className={inputClass} placeholder="5000.00" />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Fecha de inicio" required>
            <input name="startDate" type="date" required className={inputClass} />
          </FormField>
          <FormField label="Día de pago" required hint="Día del mes">
            <input name="startDateDay" type="number" min="1" max="31" required className={inputClass} placeholder="1" />
          </FormField>
          <FormField label="Plazo" required>
            <select name="deadline" required defaultValue="12" className={selectClass}>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Testigo 1" required>
            <input name="witnessName" type="text" required className={inputClass} placeholder="Nombre del testigo" />
          </FormField>
          <FormField label="Testigo 2" required>
            <input name="witness2Name" type="text" required className={inputClass} placeholder="Nombre del testigo" />
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
