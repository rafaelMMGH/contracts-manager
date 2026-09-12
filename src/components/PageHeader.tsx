'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isMobileListRoot } from '@/components/mobile/mobileListRoots'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description?: string
  createHref?: string
  createLabel?: string
  onNew?: () => void
}

export default function PageHeader({
  title,
  description,
  createHref,
  createLabel,
  onNew,
}: Props) {
  const pathname = usePathname()
  const hideOnMobile = isMobileListRoot(pathname)

  return (
    <div
      className={cn(
        'mb-6 flex items-end justify-between gap-4',
        hideOnMobile && 'hidden md:flex'
      )}
    >
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary text-balance">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-[65ch] text-[13px] leading-relaxed text-text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {onNew ? (
        <button onClick={onNew} className="btn-primary shrink-0">
          <Plus className="size-3.5" strokeWidth={2.5} />
          {createLabel ?? 'Nuevo'}
        </button>
      ) : createHref ? (
        <Link href={createHref} className="btn-primary shrink-0">
          <Plus className="size-3.5" strokeWidth={2.5} />
          {createLabel ?? 'Nuevo'}
        </Link>
      ) : null}
    </div>
  )
}
