'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteContract } from './actions'

export function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm('¿Eliminar este contrato? Esta acción no se puede deshacer.')) return
    await deleteContract(id)
  }

  return (
    <button
      onClick={handleDelete}
      className="action-btn action-btn-danger"
      aria-label="Eliminar contrato"
    >
      <TrashIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
    </button>
  )
}
