'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteTenant } from './actions'

export function DeleteButton({ id, name }: { id: string; name: string }) {
  async function handleDelete() {
    if (!confirm(`¿Eliminar al inquilino "${name}"? Esta acción no se puede deshacer.`)) return
    await deleteTenant(id)
  }

  return (
    <button
      onClick={handleDelete}
      className="action-btn action-btn-danger"
      aria-label="Eliminar inquilino"
    >
      <TrashIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
    </button>
  )
}
