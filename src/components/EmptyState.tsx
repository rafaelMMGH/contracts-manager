'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ComponentType } from 'react'

interface Props {
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>
  title: string
  description: string
  createHref?: string
  createLabel?: string
  onNew?: () => void
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  createHref,
  createLabel,
  onNew,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-white p-14 text-center shadow-card">
      <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl border border-brand-100 bg-brand-50">
        <Icon className="size-6 text-brand-500" style={{ strokeWidth: 1.25 }} />
      </div>

      <h3 className="mb-1.5 text-base font-semibold tracking-tight text-text-primary text-balance">
        {title}
      </h3>
      <p className="mx-auto mb-7 max-w-[42ch] text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      {onNew ? (
        <button onClick={onNew} className="btn-primary">
          <Plus className="size-4" strokeWidth={2} />
          {createLabel ?? 'Crear'}
        </button>
      ) : createHref ? (
        <Link href={createHref} className="btn-primary">
          <Plus className="size-4" strokeWidth={2} />
          {createLabel ?? 'Crear'}
        </Link>
      ) : null}
    </div>
  )
}
