'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Building2, UserRound, UserStar } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import PhoneInput from '@/components/PhoneInput'
import SlideSheet from '@/components/SlideSheet'
import { useRegisterMobileCreate } from '@/components/mobile/MobileCreateContext'
import { notify } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { deleteOwner, createOwner, updateOwner } from './actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Owner {
  id: string
  name: string
  phone: string
  email: string | null
  address: string
  _count: { houses: number }
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-[#64748b] tracking-wide">
        {label}{required && <span className="text-[#215a4e] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#94a3b8]">{hint}</p>}
    </div>
  )
}

const f = 'field-input'

export default function OwnersClient({ owners }: { owners: Owner[] }) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Owner | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deletingOwner = owners.find(o => o.id === deletingId)

  function openCreate() { setEditing(null); setSheetOpen(true) }
  function openEdit(o: Owner) { setEditing(o); setSheetOpen(true) }
  function closeSheet() { setSheetOpen(false); setEditing(null) }

  useRegisterMobileCreate('Nuevo propietario', UserRound, openCreate)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (editing) {
          await updateOwner(editing.id, fd)
          notify.updated('Propietario')
        } else {
          await createOwner(fd)
          notify.created('Propietario')
        }
        closeSheet()
        router.refresh()
      } catch {
        notify.saveError()
      }
    })
  }

  function handleDelete() {
    if (!deletingId) return
    const id = deletingId
    setDeletingId(null)
    startTransition(async () => {
      await deleteOwner(id)
      notify.deleted('Propietario')
      router.refresh()
    })
  }

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col',
        owners.length === 0 && 'flex-1'
      )}
    >
      <PageHeader
        title="Propietarios"
        description="Administra los propietarios de los inmuebles"
        createLabel="Nuevo propietario"
        onNew={openCreate}
      />

      {owners.length === 0 ? (
        <>
          <div className="-mb-28 flex min-h-0 flex-1 flex-col pb-28 md:hidden">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-black/[0.05]">
                <UserStar
                  className="size-7 text-text-muted"
                  strokeWidth={1.6}
                />
              </div>
              <p className="text-[15px] font-semibold text-text-primary">
                Sin propietarios
              </p>
            </div>
          </div>

          <div
            className="hidden rounded-2xl border border-[#e4e6ef] bg-white p-16 text-center md:block"
            style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff]">
              <Building2 className="h-5 w-5 text-[#215a4e]" strokeWidth={1.8} />
            </div>
            <p className="mb-1 text-[14px] font-medium text-[#1e293b]">
              Sin propietarios
            </p>
            <p className="mb-5 text-[12px] text-[#94a3b8]">
              Agrega tu primer propietario para comenzar
            </p>
            <button type="button" onClick={openCreate} className="btn-primary mx-auto">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Nuevo propietario
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e4e6ef] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] bg-[#f8f9fc]">
                {['Nombre', 'Teléfono', 'Correo', 'Inmuebles', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-[#94a3b8] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {owners.map((o, i) => (
                <tr
                  key={o.id}
                  className="table-row-anim group hover:bg-[#f8f9fc] transition-colors duration-150"
                  style={{ borderBottom: i < owners.length - 1 ? '1px solid #f1f5f9' : 'none', animationDelay: `${i * 35}ms` }}
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1e293b]">{o.name}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#64748b] tabular">{o.phone}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#64748b]">{o.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#94a3b8] tabular">{o._count.houses}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button onClick={() => openEdit(o)} className="action-btn" aria-label="Editar">
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => setDeletingId(o.id)} className="action-btn action-btn-danger" aria-label="Eliminar">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SlideSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editing ? 'Editar propietario' : 'Nuevo propietario'}
        width={420}
        footer={
          <button type="submit" form="owner-form" disabled={isPending} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            {isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear propietario'}
          </button>
        }
      >
        <form key={editing?.id ?? 'new'} id="owner-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nombre completo" required>
            <input name="name" type="text" required defaultValue={editing?.name} className={f} placeholder="Alejandro de Jesus Martinez Mendez" />
          </FormField>

          <FormField label="Teléfono" required>
            <PhoneInput name="phone" required defaultValue={editing?.phone} className={f} />
          </FormField>

          <FormField label="Correo electrónico">
            <input name="email" type="email" defaultValue={editing?.email ?? ''} className={f} placeholder="propietario@gmail.com" />
          </FormField>

          <FormField label="Domicilio" required hint="Aquí se entregará el pago de renta">
            <input name="address" type="text" required defaultValue={editing?.address} className={f} placeholder="Calle, número, colonia, ciudad" />
          </FormField>
        </form>
      </SlideSheet>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a &ldquo;{deletingOwner?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
