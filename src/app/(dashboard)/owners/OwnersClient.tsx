'use client'

import {
  useCallback,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
  UserStar,
} from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import PhoneInput from '@/components/PhoneInput'
import SlideSheet from '@/components/SlideSheet'
import { useRegisterMobileCreate } from '@/components/mobile/MobileCreateContext'
import { formatPhoneXxxXxxXxxx } from '@/lib/phone'
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

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium tracking-wide text-[#64748b]">
        {label}
        {required && <span className="ml-0.5 text-[#215a4e]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#94a3b8]">{hint}</p>}
    </div>
  )
}

const f = 'field-input'

const SWIPE_REVEAL = 88
const SWIPE_OPEN_THRESHOLD = 44
const LONG_PRESS_MS = 480
const MOVE_CANCEL_PX = 10

function ownerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function housesLabel(count: number) {
  return count === 1 ? '1 inmueble' : `${count} inmuebles`
}

function lightHaptic() {
  try {
    navigator.vibrate?.(10)
  } catch {
    /* unsupported */
  }
}

function OwnerMobileCard({
  owner,
  onEdit,
  onRequestDelete,
}: {
  owner: Owner
  onEdit: () => void
  onRequestDelete: () => void
}) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [pressed, setPressed] = useState(false)
  const gesture = useRef<{
    pointerId: number
    startX: number
    startY: number
    origin: number
    axis: 'none' | 'h' | 'v'
    longPressTimer: ReturnType<typeof setTimeout> | null
    longPressFired: boolean
  } | null>(null)

  const clearLongPress = useCallback(() => {
    const g = gesture.current
    if (g?.longPressTimer) {
      clearTimeout(g.longPressTimer)
      g.longPressTimer = null
    }
  }, [])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setPressed(true)
    gesture.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: offset,
      axis: 'none',
      longPressTimer: setTimeout(() => {
        const g = gesture.current
        if (!g || g.axis === 'h') return
        g.longPressFired = true
        clearLongPress()
        lightHaptic()
        setOffset(0)
        setPressed(false)
        onEdit()
      }, LONG_PRESS_MS),
      longPressFired: false,
    }
    setDragging(true)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId || g.longPressFired) return

    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY

    if (g.axis === 'none') {
      if (Math.abs(dx) < MOVE_CANCEL_PX && Math.abs(dy) < MOVE_CANCEL_PX) return
      if (Math.abs(dx) > Math.abs(dy) * 1.15) {
        g.axis = 'h'
        clearLongPress()
        setPressed(false)
      } else {
        g.axis = 'v'
        clearLongPress()
        setPressed(false)
        setDragging(false)
        return
      }
    }

    if (g.axis !== 'h') return

    const next = Math.min(0, Math.max(-SWIPE_REVEAL, g.origin + dx))
    setOffset(next)
  }

  function endGesture(e: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return

    clearLongPress()
    setPressed(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }

    if (!g.longPressFired && g.axis === 'h') {
      setOffset(offset <= -SWIPE_OPEN_THRESHOLD ? -SWIPE_REVEAL : 0)
    } else if (g.axis !== 'h') {
      setOffset(0)
    }

    setDragging(false)
    gesture.current = null
  }

  const phone = formatPhoneXxxXxxXxxx(owner.phone)
  const email = owner.email?.trim() || 'Sin correo'
  const deleteRevealed = offset < 0 && !pressed

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[28px]',
        deleteRevealed && 'bg-[#FF3B30]'
      )}
    >
      <button
        type="button"
        onClick={() => {
          setOffset(0)
          onRequestDelete()
        }}
        className={cn(
          'absolute inset-y-0 right-0 flex w-[88px] items-center justify-center rounded-r-[28px] text-white transition-opacity duration-150',
          deleteRevealed
            ? 'bg-[#FF3B30] active:bg-[#E0352B]'
            : 'pointer-events-none bg-transparent opacity-0'
        )}
        aria-label={`Eliminar a ${owner.name}`}
        tabIndex={deleteRevealed ? 0 : -1}
        aria-hidden={!deleteRevealed}
      >
        <Trash2 className="size-5" strokeWidth={1.75} />
      </button>

      <div
        role="button"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEdit()
          }
        }}
        className={cn(
          'relative z-[1] flex gap-3.5 rounded-[28px] bg-white p-3.5 origin-center',
          'shadow-[0_8px_28px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)]',
          'select-none touch-pan-y [-webkit-user-select:none] [-webkit-touch-callout:none]',
          'outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35',
          pressed && 'shadow-[0_4px_16px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.05)]'
        )}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          scale: pressed ? 0.96 : 1,
          transition: dragging
            ? 'scale 160ms cubic-bezier(0.2, 0, 0, 1), box-shadow 160ms cubic-bezier(0.2, 0, 0, 1)'
            : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1), scale 160ms cubic-bezier(0.2, 0, 0, 1), box-shadow 160ms cubic-bezier(0.2, 0, 0, 1)',
        }}
        aria-label={`${owner.name}. Mantén pulsado para editar. Desliza a la izquierda para eliminar.`}
      >
        <div
          className="flex size-[5.25rem] shrink-0 items-center justify-center rounded-[22px] bg-brand-700 text-[22px] font-semibold tracking-tight text-white"
          aria-hidden
        >
          {ownerInitials(owner.name)}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold leading-tight tracking-tight text-black">
              {owner.name}
            </p>
            <p className="mt-1 truncate text-[13px] leading-snug text-[#8C8C8C]">
              {owner.address}
            </p>
          </div>

          <div className="mt-2.5 flex min-w-0 items-center gap-2.5 text-[#8C8C8C]">
            <span className="flex min-w-0 max-w-[42%] items-center gap-1">
              <Phone className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="truncate text-[11px] tabular-nums leading-none">
                {phone}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1">
              <Mail className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="truncate text-[11px] leading-none">{email}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <List className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="text-[11px] tabular-nums leading-none">
                {owner._count.houses}
              </span>
            </span>
          </div>

          <p className="mt-2.5 text-[16px] font-semibold tabular-nums tracking-tight text-brand-700">
            {housesLabel(owner._count.houses)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OwnersClient({ owners }: { owners: Owner[] }) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Owner | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deletingOwner = owners.find((o) => o.id === deletingId)

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }
  function openEdit(o: Owner) {
    setEditing(o)
    setSheetOpen(true)
  }
  function closeSheet() {
    setSheetOpen(false)
    setEditing(null)
  }

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
      className={cn('flex min-h-0 flex-col', owners.length === 0 && 'flex-1')}
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
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary mx-auto"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Nuevo propietario
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Mobile — Apple-style cards */}
          <ul className="flex flex-col gap-3 md:hidden">
            {owners.map((o) => (
              <li key={o.id}>
                <OwnerMobileCard
                  owner={o}
                  onEdit={() => openEdit(o)}
                  onRequestDelete={() => setDeletingId(o.id)}
                />
              </li>
            ))}
          </ul>

          {/* Desktop — refined table */}
          <div
            className="hidden overflow-hidden rounded-2xl border border-[#e4e6ef] bg-white md:block"
            style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8f9fc]">
                  {['Nombre', 'Teléfono', 'Correo', 'Inmuebles', ''].map(
                    (h) => (
                      <th
                        key={h || 'actions'}
                        className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.1em] text-[#94a3b8]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {owners.map((o, i) => (
                  <tr
                    key={o.id}
                    className="table-row-anim group transition-colors duration-150 hover:bg-[#f8f9fc]"
                    style={{
                      borderBottom:
                        i < owners.length - 1 ? '1px solid #f1f5f9' : 'none',
                      animationDelay: `${i * 35}ms`,
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-semibold text-white"
                          aria-hidden
                        >
                          {ownerInitials(o.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-[#1e293b]">
                            {o.name}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-[#94a3b8]">
                            {o.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] tabular-nums text-[#64748b]">
                      {formatPhoneXxxXxxXxxx(o.phone)}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#64748b]">
                      {o.email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] tabular-nums text-[#94a3b8]">
                      {o._count.houses}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEdit(o)}
                          className="action-btn"
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(o.id)}
                          className="action-btn action-btn-danger"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <SlideSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editing ? 'Editar propietario' : 'Nuevo propietario'}
        width={420}
        footer={
          <button
            type="submit"
            form="owner-form"
            disabled={isPending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending
              ? 'Guardando…'
              : editing
                ? 'Guardar cambios'
                : 'Crear propietario'}
          </button>
        }
      >
        <form
          key={editing?.id ?? 'new'}
          id="owner-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormField label="Nombre completo" required>
            <input
              name="name"
              type="text"
              required
              defaultValue={editing?.name}
              className={f}
              placeholder="Alejandro de Jesus Martinez Mendez"
            />
          </FormField>

          <FormField label="Teléfono" required>
            <PhoneInput
              name="phone"
              required
              defaultValue={editing?.phone}
              className={f}
            />
          </FormField>

          <FormField label="Correo electrónico">
            <input
              name="email"
              type="email"
              defaultValue={editing?.email ?? ''}
              className={f}
              placeholder="propietario@gmail.com"
            />
          </FormField>

          <FormField
            label="Domicilio"
            required
            hint="Aquí se entregará el pago de renta"
          >
            <input
              name="address"
              type="text"
              required
              defaultValue={editing?.address}
              className={f}
              placeholder="Calle, número, colonia, ciudad"
            />
          </FormField>
        </form>
      </SlideSheet>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar a &ldquo;{deletingOwner?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
