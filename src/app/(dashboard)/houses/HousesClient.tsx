'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Home } from 'lucide-react'
import { Owner } from '@prisma/client'
import PageHeader from '@/components/PageHeader'
import SlideSheet from '@/components/SlideSheet'
import BuildingComplexPlus from '@/components/icons/BuildingComplexPlus'
import { useRegisterMobileCreate } from '@/components/mobile/MobileCreateContext'
import { notify } from '@/lib/toast'
import { deleteHouse, createHouse, updateHouse } from './actions'
import HouseFormFields from './HouseFormFields'
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

interface House {
  id: string
  name: string | null
  street: string
  number: string
  colony: string
  city: string
  state: string
  zipCode: string
  status: string
  propertyType: string
  notes: string | null
  ownerId: string
  owner: { name: string }
  hasContract: boolean
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE:   { label: 'Disponible',    bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  RENTED:      { label: 'Rentado',       bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  MAINTENANCE: { label: 'Mantenimiento', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
}

const typeLabel: Record<string, string> = {
  RESIDENTIAL: 'Casa Habitación',
  COMMERCIAL:  'Comercio',
}

export default function HousesClient({ houses, owners }: { houses: House[]; owners: Owner[] }) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<House | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const deletingHouse = houses.find(h => h.id === deletingId)

  function openCreate() { setEditing(null); setSheetOpen(true) }
  function openEdit(h: House) { setEditing(h); setSheetOpen(true) }
  function closeSheet() { setSheetOpen(false); setEditing(null) }

  useRegisterMobileCreate('Nuevo inmueble', BuildingComplexPlus, openCreate)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (editing) {
          await updateHouse(editing.id, fd)
          notify.updated('Inmueble')
        } else {
          await createHouse(fd)
          notify.created('Inmueble')
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
    <div>
      <PageHeader
        title="Inmuebles"
        description="Administra todos los inmuebles en renta"
        createLabel="Nuevo inmueble"
        onNew={openCreate}
      />

      {houses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e4e6ef] p-16 text-center" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
          <div className="w-12 h-12 rounded-2xl bg-[#eef2ff] flex items-center justify-center mx-auto mb-4">
            <Home className="w-5 h-5 text-[#3f5c48]" strokeWidth={1.8} />
          </div>
          <p className="text-[14px] font-medium text-[#1e293b] mb-1">Sin inmuebles</p>
          <p className="text-[12px] text-[#94a3b8] mb-5">Agrega tu primer inmueble para comenzar</p>
          <button onClick={openCreate} className="btn-primary mx-auto">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Nuevo inmueble
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e4e6ef] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] bg-[#f8f9fc]">
                {['Dirección', 'Propietario', 'Tipo', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] tracking-[0.1em] uppercase text-[#94a3b8] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {houses.map((house, i) => {
                const status = statusConfig[house.status]
                return (
                  <tr
                    key={house.id}
                    className="table-row-anim group hover:bg-[#f8f9fc] transition-colors duration-150"
                    style={{ borderBottom: i < houses.length - 1 ? '1px solid #f1f5f9' : 'none', animationDelay: `${i * 35}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-medium text-[#1e293b]">
                        {house.street} <span className="text-[#94a3b8]">#{house.number}</span>
                      </p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">{house.colony}, {house.city}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#64748b]">{house.owner.name}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#64748b]">{typeLabel[house.propertyType]}</td>
                    <td className="px-5 py-3.5">
                      {status && (
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-md" style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                          {status.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button onClick={() => openEdit(house)} className="action-btn" aria-label="Editar">
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        {house.status !== 'RENTED' && !house.hasContract ? (
                          <button onClick={() => setDeletingId(house.id)} className="action-btn action-btn-danger" aria-label="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <SlideSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editing ? 'Editar inmueble' : 'Nuevo inmueble'}
        width={480}
        footer={
          <button type="submit" form="house-form" disabled={isPending} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            {isPending ? 'Guardando…' : editing ? 'Actualizar' : 'Crear inmueble'}
          </button>
        }
      >
        <form key={editing?.id ?? 'new'} id="house-form" onSubmit={handleSubmit} className="space-y-4">
          <HouseFormFields
            owners={owners}
            defaults={editing ?? undefined}
            showStatus={!!editing}
            hasContract={editing?.hasContract ?? false}
          />
        </form>
      </SlideSheet>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar &ldquo;{deletingHouse?.street} #{deletingHouse?.number}&rdquo;?
            </AlertDialogTitle>
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
    </div>
  )
}
