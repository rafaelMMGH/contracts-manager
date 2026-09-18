'use client'

import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/houses': 'Inmuebles',
  '/tenants': 'Inquilinos',
  '/owners': 'Propietarios',
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return PAGE_TITLES['/']
  if (/^\/contracts\/[^/]+\/pdf/.test(pathname)) return 'Contrato'
  for (const [key, label] of Object.entries(PAGE_TITLES)) {
    if (key === '/') continue
    if (pathname === key || pathname.startsWith(key + '/')) return label
  }
  return 'Dashboard'
}

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function TopHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null }
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const title = getPageTitle(pathname)

  if (pathname === '/') return null

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-white/90 px-6 backdrop-blur-sm">
      <h1 className="flex-1 text-[15px] font-semibold tracking-tight text-text-primary text-balance">
        {title}
      </h1>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors duration-200 hover:bg-brand-50 active:scale-[0.98]"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
            {getInitials(user.name)}
          </div>
          <span className="hidden text-[12px] font-medium text-text-primary sm:block">
            {user.name?.split(' ')[0] ?? 'Usuario'}
          </span>
          <ChevronDown
            className={`size-3.5 text-text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-card-hover"
            >
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="truncate text-[12px] font-medium text-text-primary">{user.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-text-muted">{user.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="size-3.5 shrink-0" strokeWidth={1.7} />
                Cerrar sesión
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}
