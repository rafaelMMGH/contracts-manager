'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PencilSquareIcon, HomeModernIcon } from '@heroicons/react/24/outline'
import { Owner } from '@prisma/client'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { DeleteButton } from './DeleteButton'
import NewHouseModal from './NewHouseModal'

interface House {
  id: string
  street: string
  number: string
  colony: string
  city: string
  status: string
  propertyType: string
  owner: { name: string }
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  AVAILABLE:   { label: 'Disponible',    bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  RENTED:      { label: 'Rentado',       bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  MAINTENANCE: { label: 'Mantenimiento', bg: '#fefce8', text: '#a16207', border: '#fef08a' },
}

const typeLabel: Record<string, string> = {
  RESIDENTIAL: 'Casa Habitación',
  COMMERCIAL:  'Comercio',
}

export default function HousesClient({ houses, owners }: { houses: House[]; owners: Owner[] }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Inmuebles"
        description="Administra todos los inmuebles en renta"
        createLabel="Nuevo inmueble"
        onNew={() => setModalOpen(true)}
      />

      {houses.length === 0 ? (
        <EmptyState
          icon={HomeModernIcon}
          title="Sin inmuebles"
          description="Agrega tu primer inmueble para comenzar"
          createLabel="Nuevo inmueble"
          onNew={() => setModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Dirección', 'Propietario', 'Tipo', 'Estado', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-slate-400 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {houses.map((house, i) => {
                const status = statusConfig[house.status]
                return (
                  <tr
                    key={house.id}
                    className="table-row-anim group hover:bg-slate-50 transition-[background-color] duration-150"
                    style={{
                      borderBottom: i < houses.length - 1 ? '1px solid #f1f5f9' : 'none',
                      animationDelay: `${i * 35}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-slate-900 font-medium leading-snug">
                        {house.street} <span className="text-slate-400">#{house.number}</span>
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{house.colony}, {house.city}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[13px]">{house.owner.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-[13px]">{typeLabel[house.propertyType]}</td>
                    <td className="px-5 py-3.5">
                      {status && (
                        <span
                          className="text-[10px] font-medium tracking-[0.06em] px-2.5 py-1 rounded-md"
                          style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}
                        >
                          {status.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-[opacity] duration-150">
                        <Link href={`/houses/${house.id}/edit`} className="action-btn" aria-label="Editar inmueble">
                          <PencilSquareIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
                        </Link>
                        <DeleteButton id={house.id} address={`${house.street} #${house.number}`} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <NewHouseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} owners={owners} />
    </div>
  )
}
