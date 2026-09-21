'use client'

import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOptionalProfileSheet } from './ProfileSheetContext'

type AppHeaderBarProps = {
  user: { name?: string | null }
  className?: string
}

function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** Mobile list-root chrome: profile avatar + notifications placeholder. */
export default function AppHeaderBar({ user, className }: AppHeaderBarProps) {
  const profileSheet = useOptionalProfileSheet()
  const avatar = initials(user.name)

  return (
    <div className={cn('mb-5 flex items-start justify-between gap-3', className)}>
      <button
        type="button"
        onClick={() => profileSheet?.openProfile()}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[14px] font-semibold text-white shadow-brand transition-transform active:scale-[0.96]"
        aria-label="Perfil"
      >
        {avatar}
      </button>
      <button
        type="button"
        className="liquid-glass flex size-12 shrink-0 items-center justify-center rounded-full text-text-secondary transition-transform active:scale-[0.96]"
        aria-label="Notificaciones"
      >
        <Bell className="size-[18px]" strokeWidth={1.75} />
      </button>
    </div>
  )
}
