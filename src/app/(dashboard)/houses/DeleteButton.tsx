'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteHouse } from './actions'

export function DeleteButton({ id, address }: { id: string; address: string }) {
  async function handleDelete() {
    if (!confirm(`¿Eliminar el inmueble "${address}"? Esta acción no se puede deshacer.`)) return
    await deleteHouse(id)
  }

  return (
    <button
      onClick={handleDelete}
      className="action-btn action-btn-danger"
      aria-label="Eliminar inmueble"
    >
      <TrashIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
    </button>
  )
}
