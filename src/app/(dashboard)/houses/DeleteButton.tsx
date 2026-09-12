'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteHouse } from './actions'
import { notify } from '@/lib/toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteButton({ id, address }: { id: string; address: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    setOpen(false)
    startTransition(async () => {
      const result = await deleteHouse(id)
      if (!result.ok) {
        if (result.code === 'HAS_CONTRACTS' || result.code === 'RENTED') {
          notify.error('No se puede eliminar un inmueble con contratos asociados')
        } else {
          notify.saveError()
        }
        return
      }
      notify.deleted('Inmueble')
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <button
            className="action-btn action-btn-danger"
            aria-label="Eliminar inmueble"
            disabled={isPending}
          />
        }
      >
        <TrashIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar &ldquo;{address}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
