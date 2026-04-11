'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PencilSquareIcon, UsersIcon } from '@heroicons/react/24/outline'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { DeleteButton } from './DeleteButton'
import NewTenantModal from './NewTenantModal'

interface Tenant {
  id: string
  fullName: string
  phone: string
  email: string | null
  _count: { contracts: number }
}

export default function TenantsClient({ tenants }: { tenants: Tenant[] }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Inquilinos"
        description="Administra los inquilinos registrados"
        createLabel="Nuevo inquilino"
        onNew={() => setModalOpen(true)}
      />

      {tenants.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Sin inquilinos"
          description="Agrega tu primer inquilino para comenzar"
          createLabel="Nuevo inquilino"
          onNew={() => setModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Nombre', 'Teléfono', 'Correo', 'Contratos', ''].map((h) => (
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
              {tenants.map((tenant, i) => (
                <tr
                  key={tenant.id}
                  className="table-row-anim group hover:bg-slate-50 transition-[background-color] duration-150"
                  style={{
                    borderBottom: i < tenants.length - 1 ? '1px solid #f1f5f9' : 'none',
                    animationDelay: `${i * 35}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
                  }}
                >
                  <td className="px-5 py-3.5 text-slate-900 font-medium">{tenant.fullName}</td>
                  <td
                    className="px-5 py-3.5 text-slate-600 tabular"
                    style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem' }}
                  >
                    {tenant.phone}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-[13px]">{tenant.email ?? '—'}</td>
                  <td
                    className="px-5 py-3.5 tabular text-slate-400"
                    style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem' }}
                  >
                    {tenant._count.contracts}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-[opacity] duration-150">
                      <Link href={`/tenants/${tenant.id}/edit`} className="action-btn" aria-label="Editar inquilino">
                        <PencilSquareIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
                      </Link>
                      <DeleteButton id={tenant.id} name={tenant.fullName} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewTenantModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
