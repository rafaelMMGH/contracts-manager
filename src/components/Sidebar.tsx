'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Home,
  Users,
  Building2,
  LogOut,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inmuebles', href: '/houses', icon: Home },
  { name: 'Inquilinos', href: '/tenants', icon: Users },
  { name: 'Propietarios', href: '/owners', icon: Building2 },
]

function UserAvatar({ name }: { name?: string | null }) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white shadow-brand">
      {initials}
    </div>
  )
}

export default function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null }
}) {
  const pathname = usePathname()

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-border bg-white">
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
            <Building2 className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-none tracking-tight text-text-primary">
              Contratos
            </p>
            <p className="mt-0.5 text-[10px] text-text-muted">Bienes raíces</p>
          </div>
        </div>
      </div>

      <div className="mx-3 mb-4 rounded-xl border border-border bg-brand-50/60 p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-tight text-text-primary">
              {user.name ?? 'Usuario'}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-text-muted">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="mb-2 px-5 text-[11px] font-medium text-text-muted">Navegación</p>
        <nav className="space-y-0.5 px-2.5 pb-2">
          {navigation.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200 select-none active:scale-[0.98]',
                  active
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'font-normal text-slate-500 hover:bg-brand-50/50 hover:text-text-primary'
                )}
              >
                <item.icon
                  className={cn(
                    'size-[15px] shrink-0',
                    active ? 'text-brand-600' : 'text-text-muted'
                  )}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span className="truncate">{item.name}</span>
                {active ? (
                  <span className="ml-auto size-1.5 shrink-0 rounded-full bg-brand-500" />
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="space-y-1.5 border-t border-border px-3 pb-5 pt-3">
        <Link
          href="/houses"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-[13px] font-medium text-white shadow-brand transition-all duration-200 hover:bg-brand-600 active:scale-[0.98]"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          Nuevo inmueble
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-text-muted transition-all duration-200 hover:bg-slate-100 hover:text-text-primary active:scale-[0.98]"
        >
          <LogOut className="size-3.5 shrink-0" strokeWidth={1.7} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
