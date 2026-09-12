'use client'

import { Bell, MapPin } from 'lucide-react'
import { useOptionalProfileSheet } from './ProfileSheetContext'

type AppHeaderBarProps = {
  user: { name?: string | null }
}

export default function AppHeaderBar({ user }: AppHeaderBarProps) {
  const profileSheet = useOptionalProfileSheet()
  const firstName = user.name?.split(' ')[0] ?? 'Usuario'
  const initial = (user.name ?? 'U').slice(0, 1).toUpperCase()

  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => profileSheet?.openProfile()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[13px] font-semibold text-white shadow-brand transition-transform active:scale-[0.96]"
          aria-label="Perfil"
        >
          {initial}
        </button>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold leading-tight text-text-primary">
            Hola, {firstName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-text-muted">
            <MapPin className="size-3" strokeWidth={2} />
            Tu Perfil
          </p>
        </div>
      </div>
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
