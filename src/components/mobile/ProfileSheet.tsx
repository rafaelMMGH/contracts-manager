'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Drawer } from '@base-ui/react/drawer'
import {
  Bell,
  ChevronRight,
  FileClock,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ProfileSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { name?: string | null; email?: string | null }
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

type ShellRow = {
  label: string
  icon: typeof Bell
  href?: string
}

const GENERAL_ROWS: ShellRow[] = [
  { label: 'Historial de contratos', icon: FileClock },
  { label: 'Ajustes de notificaciones', icon: Bell },
]

const HELP_ROWS: ShellRow[] = [
  { label: 'Contactar soporte', icon: HelpCircle },
  { label: 'Términos y condiciones', icon: FileText },
]

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[22px] border border-white/70',
        'bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_28px_rgba(63,92,72,0.08)]',
        'backdrop-blur-xl backdrop-saturate-150',
        className
      )}
    >
      {children}
    </div>
  )
}

function ShellList({
  rows,
  onNavigate,
}: {
  rows: ShellRow[]
  onNavigate?: () => void
}) {
  return (
    <GlassCard>
      <ul className="divide-y divide-black/[0.06]">
        {rows.map((row) => {
          const content = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-700">
                <row.icon className="size-[18px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-medium text-text-primary">
                {row.label}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-text-muted"
                strokeWidth={1.75}
              />
            </>
          )

          return (
            <li key={row.label}>
              {row.href ? (
                <Link
                  href={row.href}
                  onClick={() => onNavigate?.()}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-black/[0.03]"
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-black/[0.03]"
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </GlassCard>
  )
}

export default function ProfileSheet({
  open,
  onOpenChange,
  user,
}: ProfileSheetProps) {
  const name = user.name ?? 'Usuario'
  const email = user.email ?? 'Sin correo'

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      swipeDirection="down"
    >
      <Drawer.Portal>
        <Drawer.Backdrop
          className={cn(
            'apple-drawer-backdrop fixed inset-0 z-50 bg-black/28',
            'supports-backdrop-filter:backdrop-blur-sm md:hidden'
          )}
        />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <Drawer.Popup
            className={cn(
              'apple-drawer-popup',
              'relative flex max-h-[min(92dvh,820px)] w-full flex-col overflow-hidden outline-none',
              'rounded-t-[28px] border-t border-white/60',
              'bg-[linear-gradient(165deg,rgba(255,255,255,0.72)_0%,rgba(238,247,251,0.88)_100%)]',
              'shadow-[0_-12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150',
              'supports-[backdrop-filter]:bg-[linear-gradient(165deg,rgba(255,255,255,0.55)_0%,rgba(238,247,251,0.72)_100%)]'
            )}
          >
            <Drawer.Content className="flex max-h-[min(92dvh,820px)] flex-col outline-none">
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex w-full justify-center pb-1 pt-3">
                  <span
                    className="h-1 w-10 rounded-full bg-black/15"
                    aria-hidden
                  />
                </div>
                <div className="flex w-full items-center px-5 pb-3 pt-1">
                  <Drawer.Title className="text-[22px] font-semibold tracking-tight text-text-primary">
                    Configuración
                  </Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Ajustes y opciones de {name}. Desliza hacia abajo para
                    cerrar.
                  </Drawer.Description>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[15px] font-semibold text-white shadow-brand">
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-semibold tracking-tight text-text-primary">
                        {name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-text-muted">
                        <Mail
                          className="size-3.5 shrink-0"
                          strokeWidth={1.75}
                        />
                        <span className="truncate">{email}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-black/[0.04] text-text-secondary transition-transform active:scale-[0.96]"
                      aria-label="Editar perfil"
                    >
                      <Pencil className="size-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </GlassCard>

                <ShellList
                  rows={GENERAL_ROWS}
                  onNavigate={() => onOpenChange(false)}
                />

                <ShellList rows={HELP_ROWS} />

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="liquid-glass-brand flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-medium text-white transition-transform active:scale-[0.98]"
                >
                  <LogOut className="size-4" strokeWidth={2} />
                  Cerrar sesión
                </button>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
