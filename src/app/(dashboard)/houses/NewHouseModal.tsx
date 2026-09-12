'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Owner } from '@prisma/client'
import Modal from '@/components/Modal'
import { notify } from '@/lib/toast'
import { createHouse } from './actions'
import HouseFormFields from './HouseFormFields'

interface Props {
  isOpen: boolean
  onClose: () => void
  owners: Owner[]
}

export default function NewHouseModal({ isOpen, onClose, owners }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const formId = 'new-house-form'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createHouse(formData)
        notify.created('Inmueble')
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
      title="Nuevo inmueble"
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
            ) : 'Guardar inmueble'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <HouseFormFields owners={owners} />
      </form>
    </Modal>
  )
}
