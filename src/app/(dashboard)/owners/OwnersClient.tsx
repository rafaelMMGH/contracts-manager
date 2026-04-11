'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { DeleteButton } from './DeleteButton'
import NewOwnerModal from './NewOwnerModal'

interface Owner {
  id: string
  name: string
  phone: string
  email: string | null
  _count: { houses: number }
}

export default function OwnersClient({ owners }: { owners: Owner[] }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Propietarios"
        description="Administra los propietarios de los inmuebles"
        createLabel="Nuevo propietario"
        onNew={() => setModalOpen(true)}
      />

      {owners.length === 0 ? (
        <EmptyState
          icon={BuildingOfficeIcon}
          title="Sin propietarios"
          description="Agrega tu primer propietario para comenzar"
          createLabel="Nuevo propietario"
          onNew={() => setModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Nombre', 'Teléfono', 'Correo', 'Inmuebles', ''].map((h) => (
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
              {owners.map((owner, i) => (
                <tr
                  key={owner.id}
                  className="table-row-anim group hover:bg-slate-50 transition-[background-color] duration-150"
                  style={{
                    borderBottom: i < owners.length - 1 ? '1px solid #f1f5f9' : 'none',
                    animationDelay: `${i * 35}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
                  }}
                >
                  <td className="px-5 py-3.5 text-slate-900 font-medium">{owner.name}</td>
                  <td
                    className="px-5 py-3.5 text-slate-600 tabular"
                    style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem' }}
                  >
                    {owner.phone}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-[13px]">{owner.email ?? '—'}</td>
                  <td
                    className="px-5 py-3.5 tabular text-slate-400"
                    style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem' }}
                  >
                    {owner._count.houses}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-[opacity] duration-150">
                      <Link href={`/owners/${owner.id}/edit`} className="action-btn" aria-label="Editar propietario">
                        <PencilSquareIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
                      </Link>
                      <DeleteButton id={owner.id} name={owner.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewOwnerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
