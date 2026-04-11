'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PencilSquareIcon, PrinterIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { House, Tenant, Owner } from '@prisma/client'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { DeleteButton } from './DeleteButton'
import NewContractModal from './NewContractModal'
import { formatShort } from '@/lib/dates'

type HouseWithOwner = House & { owner: Owner }

interface Contract {
  id: string
  status: string
  rentPrice: number | { toNumber: () => number }
  startDate: Date
  expirationDate: Date
  house: { street: string; number: string; colony: string }
  tenant: { fullName: string }
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  ACTIVE:    { label: 'Activo',     bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  EXPIRED:   { label: 'Vencido',   bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  CANCELLED: { label: 'Cancelado', bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
}

export default function ContractsClient({
  contracts,
  houses,
  tenants,
}: {
  contracts: Contract[]
  houses: HouseWithOwner[]
  tenants: Tenant[]
}) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Contratos"
        description="Gestiona los contratos de arrendamiento"
        createLabel="Nuevo contrato"
        onNew={() => setModalOpen(true)}
      />

      {contracts.length === 0 ? (
        <EmptyState
          icon={DocumentTextIcon}
          title="Sin contratos"
          description="Crea tu primer contrato de arrendamiento"
          createLabel="Nuevo contrato"
          onNew={() => setModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Inquilino', 'Inmueble', 'Renta', 'Inicio', 'Vence', 'Estado', ''].map((h) => (
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
              {contracts.map((contract, i) => {
                const status = statusConfig[contract.status]
                const rent = typeof contract.rentPrice === 'object'
                  ? contract.rentPrice.toNumber()
                  : contract.rentPrice
                return (
                  <tr
                    key={contract.id}
                    className="table-row-anim group hover:bg-slate-50 transition-[background-color] duration-150"
                    style={{
                      borderBottom: i < contracts.length - 1 ? '1px solid #f1f5f9' : 'none',
                      animationDelay: `${i * 35}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
                    }}
                  >
                    <td className="px-5 py-3.5 text-slate-900 font-medium">{contract.tenant.fullName}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700 text-[13px] leading-snug">
                        {contract.house.street} <span className="text-slate-400">#{contract.house.number}</span>
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{contract.house.colony}</p>
                    </td>
                    <td
                      className="px-5 py-3.5 tabular text-emerald-700 font-medium"
                      style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem' }}
                    >
                      ${rent.toLocaleString('es-MX')}
                    </td>
                    <td
                      className="px-5 py-3.5 tabular text-slate-400"
                      style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem' }}
                    >
                      {formatShort(new Date(contract.startDate))}
                    </td>
                    <td
                      className="px-5 py-3.5 tabular text-slate-400"
                      style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem' }}
                    >
                      {formatShort(new Date(contract.expirationDate))}
                    </td>
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
                        <Link href={`/contracts/${contract.id}/pdf`} target="_blank" className="action-btn" aria-label="Generar PDF">
                          <PrinterIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
                        </Link>
                        <Link href={`/contracts/${contract.id}/edit`} className="action-btn" aria-label="Editar contrato">
                          <PencilSquareIcon className="h-4 w-4" style={{ strokeWidth: 1.5 }} />
                        </Link>
                        <DeleteButton id={contract.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <NewContractModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        houses={houses}
        tenants={tenants}
      />
    </div>
  )
}
