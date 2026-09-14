'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Users, UserRoundPlus, UsersRound } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import PhoneInput from '@/components/PhoneInput'
import SlideSheet from '@/components/SlideSheet'
import { useRegisterMobileCreate } from '@/components/mobile/MobileCreateContext'
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

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-[#64748b] tracking-wide">
        {label}{required && <span className="text-[#215a4e] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-[#f1f5f9]" />
      <span className="text-[10px] text-[#94a3b8] tracking-[0.12em] uppercase shrink-0">{label}</span>
      <div className="h-px flex-1 bg-[#f1f5f9]" />
    </div>
  )
}

const f = 'field-input'

export default function TenantsClient({ tenants }: { tenants: Tenant[] }) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deletingTenant = tenants.find(t => t.id === deletingId)

  function openCreate() { setEditing(null); setSheetOpen(true) }
  function openEdit(t: Tenant) { setEditing(t); setSheetOpen(true) }
  function closeSheet() { setSheetOpen(false); setEditing(null) }

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
        'flex min-h-0 flex-col',
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
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-black/[0.05]">
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
              <Users className="h-5 w-5 text-[#215a4e]" strokeWidth={1.8} />
            </div>
            <p className="mb-1 text-[14px] font-medium text-[#1e293b]">
              Sin inquilinos
            </p>
            <p className="mb-5 text-[12px] text-[#94a3b8]">
              Agrega tu primer inquilino para comenzar
            </p>
            <button type="button" onClick={openCreate} className="btn-primary mx-auto">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Nuevo inquilino
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e4e6ef] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] bg-[#f8f9fc]">
                {['Nombre', 'Teléfono', 'Correo', 'Contratos', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-[#94a3b8] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => (
                <tr
                  key={t.id}
                  className="table-row-anim group hover:bg-[#f8f9fc] transition-colors duration-150"
                  style={{ borderBottom: i < tenants.length - 1 ? '1px solid #f1f5f9' : 'none', animationDelay: `${i * 35}ms` }}
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1e293b]">{t.fullName}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#64748b] tabular">{t.phone}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#64748b]">{t.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#94a3b8] tabular">{t._count.contracts}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button onClick={() => openEdit(t)} className="action-btn" aria-label="Editar">
                        <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => setDeletingId(t.id)} className="action-btn action-btn-danger" aria-label="Eliminar">
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
        title={editing ? 'Editar inquilino' : 'Nuevo inquilino'}
        width={500}
        footer={
          <button type="submit" form="tenant-form" disabled={isPending} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            {isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear inquilino'}
          </button>
        }
      >
        <form key={editing?.id ?? 'new'} id="tenant-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre completo" required>
              <input name="fullName" type="text" required defaultValue={editing?.fullName} className={f} placeholder="Juan Pérez García" />
            </FormField>
            <FormField label="Teléfono" required>
              <PhoneInput name="phone" required defaultValue={editing?.phone} className={f} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha de nacimiento">
              <input name="dateOfBirth" type="date" defaultValue={toDateStr(editing?.dateOfBirth ?? null)} className={f} />
            </FormField>
            <FormField label="CURP / RFC">
              <input name="curpRfc" type="text" defaultValue={editing?.curpRfc ?? ''} className={f} placeholder="PEGJ900101…" />
            </FormField>
          </div>

          <FormField label="Correo electrónico">
            <input name="email" type="email" defaultValue={editing?.email ?? ''} className={f} placeholder="inquilino@correo.com" />
          </FormField>

          <FormField label="Domicilio actual">
            <input name="currentAddress" type="text" defaultValue={editing?.currentAddress ?? ''} className={f} placeholder="Calle, número, colonia, ciudad" />
          </FormField>

          <SectionDivider label="Contacto de emergencia" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nombre">
              <input name="emergencyContactName" type="text" defaultValue={editing?.emergencyContactName ?? ''} className={f} />
            </FormField>
            <FormField label="Teléfono">
              <PhoneInput name="emergencyContactPhone" defaultValue={editing?.emergencyContactPhone ?? ''} className={f} />
            </FormField>
          </div>

          <SectionDivider label="Referencia personal" />
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Nombre">
              <input name="referenceName" type="text" defaultValue={editing?.referenceName ?? ''} className={f} />
            </FormField>
            <FormField label="Teléfono">
              <PhoneInput name="referencePhone" defaultValue={editing?.referencePhone ?? ''} className={f} />
            </FormField>
            <FormField label="Relación">
              <input name="referenceRelationship" type="text" defaultValue={editing?.referenceRelationship ?? ''} className={f} placeholder="Familiar…" />
            </FormField>
          </div>

          <SectionDivider label="Información laboral" />
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Empleador">
              <input name="employerName" type="text" defaultValue={editing?.employerName ?? ''} className={f} />
            </FormField>
            <FormField label="Tel. empleador">
              <PhoneInput name="employerPhone" defaultValue={editing?.employerPhone ?? ''} className={f} />
            </FormField>
            <FormField label="Ingreso mensual">
              <input name="monthlyIncome" type="number" step="0.01" defaultValue={toNum(editing?.monthlyIncome ?? null)} className={f} placeholder="0.00" />
            </FormField>
          </div>
        </form>
      </SlideSheet>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a &ldquo;{deletingTenant?.fullName}&rdquo;?</AlertDialogTitle>
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
