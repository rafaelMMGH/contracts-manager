'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteOwner } from './actions'

export function DeleteButton({ id, name }: { id: string; name: string }) {
  async function handleDelete() {
    if (!confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return
    await deleteOwner(id)
  }

  return (
    <button
      onClick={handleDelete}
      className="action-btn action-btn-danger"
      aria-label="Eliminar propietario"
    >
      <TrashIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
    </button>
  )
}
