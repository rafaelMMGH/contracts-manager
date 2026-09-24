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
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRoundPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import PhoneInput from '@/components/PhoneInput'
import SlideSheet from '@/components/SlideSheet'
import { useRegisterMobileCreate } from '@/components/mobile/MobileCreateContext'
import { formatPhoneXxxXxxXxxx } from '@/lib/phone'
import { notify } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { deleteTenant, createTenant, updateTenant } from './actions'
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

interface Tenant {
  id: string
  fullName: string
  phone: string
  email: string | null
  dateOfBirth: Date | null
  curpRfc: string | null
  currentAddress: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  referenceName: string | null
  referencePhone: string | null
  referenceRelationship: string | null
  employerName: string | null
  employerPhone: string | null
  monthlyIncome: number | { toNumber: () => number } | null
  _count: { contracts: number }
}

function toDateStr(d: Date | string | null) {
  if (!d) return undefined
  return new Date(d).toISOString().slice(0, 10)
}

function toNum(v: number | { toNumber: () => number } | null): string {
  if (!v) return ''
  return String(typeof v === 'object' ? v.toNumber() : v)
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium tracking-wide text-[#64748b]">
        {label}
        {required && <span className="ml-0.5 text-[#3f5c48]">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-[#f1f5f9]" />
      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#f1f5f9]" />
    </div>
  )
}

const f = 'field-input'

const SWIPE_REVEAL = 88
const SWIPE_OPEN_THRESHOLD = 44
const LONG_PRESS_MS = 480
const MOVE_CANCEL_PX = 10

function tenantInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function contractsLabel(count: number) {
  return count === 1 ? '1 contrato' : `${count} contratos`
}

function lightHaptic() {
  try {
    navigator.vibrate?.(10)
  } catch {
    /* unsupported */
  }
}

function TenantMobileCard({
  tenant,
  onEdit,
  onRequestDelete,
}: {
  tenant: Tenant
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

  const phone = formatPhoneXxxXxxXxxx(tenant.phone)
  const email = tenant.email?.trim() || 'Sin correo'
  const address = tenant.currentAddress?.trim() || 'Sin domicilio'
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
        aria-label={`Eliminar a ${tenant.fullName}`}
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
          'relative z-[1] flex gap-3.5 rounded-[28px] p-3.5 origin-center',
          'liquid-glass-tile',
          offset < 0 && 'liquid-glass-tile--opaque',
          'select-none touch-pan-y [-webkit-user-select:none] [-webkit-touch-callout:none]',
          'outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35'
        )}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          scale: pressed ? 0.97 : 1,
          transition: dragging
            ? 'scale 160ms cubic-bezier(0.2, 0, 0, 1)'
            : 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1), scale 160ms cubic-bezier(0.2, 0, 0, 1)',
        }}
        aria-label={`${tenant.fullName}. Mantén pulsado para editar. Desliza a la izquierda para eliminar.`}
      >
        <div
          className="flex size-[5.25rem] shrink-0 items-center justify-center rounded-[22px] bg-brand-700 text-[22px] font-semibold tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
          aria-hidden
        >
          {tenantInitials(tenant.fullName)}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-[17px] font-semibold leading-tight tracking-tight text-text-primary">
              {tenant.fullName}
            </p>
            <p className="mt-0 truncate text-[13px] leading-snug text-text-muted">
              {address}
            </p>
          </div>

          <div className="mt-2.5 flex min-w-0 items-center gap-2.5 text-text-muted">
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
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/[0.06] px-2 py-1">
              <List className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="text-[11px] font-medium tabular-nums leading-none text-text-primary">
                {tenant._count.contracts}
              </span>
            </span>
          </div>

          <p className="mt-2.5 text-[15px] font-semibold tabular-nums tracking-tight text-brand-700">
            {contractsLabel(tenant._count.contracts)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TenantsClient({ tenants }: { tenants: Tenant[] }) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deletingTenant = tenants.find((t) => t.id === deletingId)

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }
  function openEdit(t: Tenant) {
    setEditing(t)
    setSheetOpen(true)
  }
  function closeSheet() {
    setSheetOpen(false)
    setEditing(null)
  }

  useRegisterMobileCreate('Nuevo inquilino', UserRoundPlus, openCreate)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (editing) {
          await updateTenant(editing.id, fd)
          notify.updated('Inquilino')
        } else {
          await createTenant(fd)
          notify.created('Inquilino')
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
      await deleteTenant(id)
      notify.deleted('Inquilino')
      router.refresh()
    })
  }

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-col',
        tenants.length === 0 && 'flex-1'
      )}
    >
      <PageHeader
        title="Inquilinos"
        description="Administra los inquilinos registrados"
        createLabel="Nuevo inquilino"
        onNew={openCreate}
      />

      {tenants.length === 0 ? (
        <>
          <div className="-mb-28 flex min-h-0 flex-1 flex-col pb-28 md:hidden">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full liquid-glass">
                <UsersRound
                  className="size-7 text-text-muted"
                  strokeWidth={1.6}
                />
              </div>
              <p className="text-[15px] font-semibold text-text-primary">
                Sin inquilinos
              </p>
            </div>
          </div>

          <div
            className="hidden rounded-2xl border border-[#e4e6ef] bg-white p-16 text-center md:block"
            style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff]">
              <Users className="h-5 w-5 text-[#3f5c48]" strokeWidth={1.8} />
            </div>
            <p className="mb-1 text-[14px] font-medium text-[#1e293b]">
              Sin inquilinos
            </p>
            <p className="mb-5 text-[12px] text-[#94a3b8]">
              Agrega tu primer inquilino para comenzar
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary mx-auto"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Nuevo inquilino
            </button>
          </div>
        </>
      ) : (
        <>
          <ul className="flex flex-col gap-3 md:hidden">
            {tenants.map((t, i) => (
              <li
                key={t.id}
                style={{
                  animation: 'fadeSlideIn 0.4s cubic-bezier(0.2, 0, 0, 1) both',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <TenantMobileCard
                  tenant={t}
                  onEdit={() => openEdit(t)}
                  onRequestDelete={() => setDeletingId(t.id)}
                />
              </li>
            ))}
          </ul>

          <div
            className="hidden overflow-hidden rounded-2xl border border-[#e4e6ef] bg-white md:block"
            style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8f9fc]">
                  {['Nombre', 'Teléfono', 'Correo', 'Contratos', ''].map(
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
                {tenants.map((t, i) => (
                  <tr
                    key={t.id}
                    className="table-row-anim group transition-colors duration-150 hover:bg-[#f8f9fc]"
                    style={{
                      borderBottom:
                        i < tenants.length - 1 ? '1px solid #f1f5f9' : 'none',
                      animationDelay: `${i * 35}ms`,
                    }}
                  >
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#1e293b]">
                      {t.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] tabular-nums text-[#64748b]">
                      {t.phone}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#64748b]">
                      {t.email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] tabular-nums text-[#94a3b8]">
                      {t._count.contracts}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="action-btn"
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(t.id)}
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
        title={editing ? 'Editar inquilino' : 'Nuevo inquilino'}
        width={500}
        footer={
          <button
            type="submit"
            form="tenant-form"
            disabled={isPending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending
              ? 'Guardando…'
              : editing
                ? 'Guardar cambios'
                : 'Crear inquilino'}
          </button>
        }
      >
        <form
          key={editing?.id ?? 'new'}
          id="tenant-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre completo" required>
              <input
                name="fullName"
                type="text"
                required
                defaultValue={editing?.fullName}
                className={f}
                placeholder="Juan Pérez García"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha de nacimiento">
              <input
                name="dateOfBirth"
                type="date"
                defaultValue={toDateStr(editing?.dateOfBirth ?? null)}
                className={f}
              />
            </FormField>
            <FormField label="CURP / RFC">
              <input
                name="curpRfc"
                type="text"
                defaultValue={editing?.curpRfc ?? ''}
                className={f}
                placeholder="PEGJ900101…"
              />
            </FormField>
          </div>

          <FormField label="Correo electrónico">
            <input
              name="email"
              type="email"
              defaultValue={editing?.email ?? ''}
              className={f}
              placeholder="inquilino@correo.com"
            />
          </FormField>

          <FormField label="Domicilio actual">
            <input
              name="currentAddress"
              type="text"
              defaultValue={editing?.currentAddress ?? ''}
              className={f}
              placeholder="Calle, número, colonia, ciudad"
            />
          </FormField>

          <SectionDivider label="Contacto de emergencia" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre">
              <input
                name="emergencyContactName"
                type="text"
                defaultValue={editing?.emergencyContactName ?? ''}
                className={f}
              />
            </FormField>
            <FormField label="Teléfono">
              <PhoneInput
                name="emergencyContactPhone"
                defaultValue={editing?.emergencyContactPhone ?? ''}
                className={f}
              />
            </FormField>
          </div>

          <SectionDivider label="Referencia personal" />
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Nombre">
              <input
                name="referenceName"
                type="text"
                defaultValue={editing?.referenceName ?? ''}
                className={f}
              />
            </FormField>
            <FormField label="Teléfono">
              <PhoneInput
                name="referencePhone"
                defaultValue={editing?.referencePhone ?? ''}
                className={f}
              />
            </FormField>
            <FormField label="Relación">
              <input
                name="referenceRelationship"
                type="text"
                defaultValue={editing?.referenceRelationship ?? ''}
                className={f}
                placeholder="Familiar…"
              />
            </FormField>
          </div>

          <SectionDivider label="Información laboral" />
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Empleador">
              <input
                name="employerName"
                type="text"
                defaultValue={editing?.employerName ?? ''}
                className={f}
              />
            </FormField>
            <FormField label="Tel. empleador">
              <PhoneInput
                name="employerPhone"
                defaultValue={editing?.employerPhone ?? ''}
                className={f}
              />
            </FormField>
            <FormField label="Ingreso mensual">
              <input
                name="monthlyIncome"
                type="number"
                step="0.01"
                defaultValue={toNum(editing?.monthlyIncome ?? null)}
                className={f}
                placeholder="0.00"
              />
            </FormField>
          </div>
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
              ¿Eliminar a &ldquo;{deletingTenant?.fullName}&rdquo;?
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
