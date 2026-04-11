'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  HomeIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  UsersIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard',    href: '/dashboard', icon: HomeIcon           },
  { name: 'Propietarios', href: '/owners',    icon: BuildingOfficeIcon },
  { name: 'Inmuebles',    href: '/houses',    icon: HomeModernIcon     },
  { name: 'Inquilinos',   href: '/tenants',   icon: UsersIcon          },
  { name: 'Contratos',    href: '/contracts', icon: DocumentTextIcon   },
]

function UserAvatar({ name }: { name?: string | null }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '1px solid #a7f3d0',
      }}
    >
      <span
        className="text-[11px] font-bold leading-none"
        style={{ fontFamily: 'Space Mono, monospace', color: '#065f46' }}
      >
        {initials}
      </span>
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
    <aside
      className="w-[220px] flex flex-col shrink-0 border-r border-slate-200"
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* ── Brand ────────────────────────────────── */}
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-[10px]"
            style={{
              background: 'linear-gradient(135deg, #065f46, #047857)',
              boxShadow: '0 2px 10px rgba(6,95,70,0.25)',
            }}
          >
            <span
              className="text-white text-sm leading-none select-none"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 700 }}
            >
              C
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="text-slate-900 text-[13px] leading-none tracking-[0.06em] uppercase"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600 }}
            >
              Contratos
            </p>
            <p className="text-slate-400 text-[9px] tracking-[0.16em] uppercase mt-1 font-light">
              Manager
            </p>
          </div>
        </div>

        {/* Accent rule */}
        <div className="mt-5 h-px bg-slate-200" />
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <nav className="flex-1 px-2.5 space-y-px overflow-y-auto pb-2">
        {navigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className={[
                'nav-link group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] select-none',
                active ? 'active font-medium' : 'font-normal',
              ].join(' ')}
              style={
                active
                  ? { color: '#065f46', backgroundColor: '#ecfdf5' }
                  : { color: '#64748b' }
              }
            >
              <item.icon
                className="h-[16px] w-[16px] shrink-0"
                style={{
                  strokeWidth: active ? 2 : 1.5,
                  color: active ? '#065f46' : '#94a3b8',
                }}
              />
              <span className="tracking-[0.01em] truncate">{item.name}</span>
              {active && (
                <span
                  className="ml-auto w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ backgroundColor: '#065f46' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Divider ──────────────────────────────── */}
      <div className="mx-4 h-px bg-slate-200" />

      {/* ── Footer ───────────────────────────────── */}
      <div className="px-2.5 pt-3 pb-5 space-y-1">
        {/* User card */}
        <div className="rounded-lg px-3 py-2.5 bg-white border border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-slate-800 font-medium truncate leading-tight">
                {user.name ?? 'Usuario'}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] font-normal
            text-slate-400 hover:text-slate-700 hover:bg-slate-100
            transition-[color,background-color,transform] duration-150 active:scale-[0.97]"
          style={{ transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)' }}
        >
          <ArrowRightOnRectangleIcon
            className="h-3.5 w-3.5 shrink-0 group-hover:text-red-400 transition-colors duration-150"
            style={{ strokeWidth: 1.5 }}
          />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
