'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import { FormField, inputClass } from '@/components/FormCard'
import PhoneInput from '@/components/PhoneInput'
import { notify } from '@/lib/toast'
import { createOwner } from './actions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function NewOwnerModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const formId = 'new-owner-form'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createOwner(formData)
        notify.created('Propietario')
        onClose()
        router.refresh()
      } catch {
        notify.saveError()
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo propietario"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
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
            ) : 'Guardar propietario'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre completo" required>
          <input
            name="name"
            type="text"
            required
            autoFocus
            className={inputClass}
            placeholder="Alejandro de Jesus Martinez Mendez"
          />
        </FormField>

        <FormField label="Teléfono" required>
          <PhoneInput name="phone" required className={inputClass} />
        </FormField>

        <FormField label="Correo electrónico">
          <input
            name="email"
            type="email"
            className={inputClass}
            placeholder="propietario@correo.com"
          />
        </FormField>

        <FormField label="Domicilio del propietario" required hint="Aquí se entregará el pago de renta">
          <input
            name="address"
            type="text"
            required
            className={inputClass}
            placeholder="Calle, número, colonia, ciudad"
          />
        </FormField>
      </form>
    </Modal>
  )
}
