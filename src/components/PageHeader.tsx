'use client'

import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

interface Props {
  title: string
  description?: string
  createHref?: string
  createLabel?: string
  onNew?: () => void
}

export default function PageHeader({ title, description, createHref, createLabel, onNew }: Props) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h2
          className="text-slate-900 font-medium leading-tight"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 600,
            textWrap: 'balance',
          } as React.CSSProperties}
        >
          {title}
        </h2>
        {description && (
          <p className="text-slate-500 text-sm mt-1 font-light">{description}</p>
        )}
      </div>

      {/* onNew takes priority over createHref */}
      {onNew ? (
        <button
          onClick={onNew}
          className="btn-primary shrink-0"
        >
          <PlusIcon className="h-4 w-4" style={{ strokeWidth: 2 }} />
          {createLabel ?? 'Nuevo'}
        </button>
      ) : createHref ? (
        <Link href={createHref} className="btn-primary shrink-0">
          <PlusIcon className="h-4 w-4" style={{ strokeWidth: 2 }} />
          {createLabel ?? 'Nuevo'}
        </Link>
      ) : null}
    </div>
  )
}
