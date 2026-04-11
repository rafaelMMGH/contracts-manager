'use client'

import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { ComponentType } from 'react'

interface Props {
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>
  title: string
  description: string
  createHref?: string
  createLabel?: string
  onNew?: () => void
}

export default function EmptyState({ icon: Icon, title, description, createHref, createLabel, onNew }: Props) {
  return (
    <div className="rounded-xl p-14 text-center bg-white border border-slate-200">
      <div className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center bg-emerald-50 border border-emerald-100">
        <Icon className="h-6 w-6 text-emerald-600" style={{ strokeWidth: 1.25 }} />
      </div>

      <h3
        className="text-slate-800 font-medium mb-1.5"
        style={{ textWrap: 'balance' } as React.CSSProperties}
      >
        {title}
      </h3>
      <p className="text-slate-500 text-sm mb-7 font-light">{description}</p>

      {onNew ? (
        <button onClick={onNew} className="btn-primary">
          <PlusIcon className="h-4 w-4" style={{ strokeWidth: 2 }} />
          {createLabel ?? 'Crear'}
        </button>
      ) : createHref ? (
        <Link href={createHref} className="btn-primary">
          <PlusIcon className="h-4 w-4" style={{ strokeWidth: 2 }} />
          {createLabel ?? 'Crear'}
        </Link>
      ) : null}
    </div>
  )
}
