'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Home,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMobileCreateAction } from './MobileCreateContext'

export type TabId = 'inicio' | 'inquilinos'

const TABS: {
  id: TabId
  label: string
  icon: LucideIcon
  href: string
}[] = [
  { id: 'inicio', label: 'Inicio', icon: Home, href: '/' },
  { id: 'inquilinos', label: 'Inquilinos', icon: Users, href: '/tenants' },
]

const SCRUB_PX = 12
const FLICK_PX = 52

function activeTabFromPath(pathname: string): TabId | null {
  if (pathname === '/') return 'inicio'
  if (pathname.startsWith('/tenants')) return 'inquilinos'
  return null
}

function lightHaptic() {
  try {
    navigator.vibrate?.(8)
  } catch {
    /* unsupported */
  }
}

type PillBox = { x: number; y: number; width: number; height: number }

function measurePill(nav: HTMLElement, tab: HTMLElement): PillBox {
  const navRect = nav.getBoundingClientRect()
  const tabRect = tab.getBoundingClientRect()
  return {
    x: tabRect.left - navRect.left - nav.clientLeft,
    y: tabRect.top - navRect.top - nav.clientTop,
    width: tabRect.width,
    height: tabRect.height,
  }
}

type FloatingTabBarProps = {
  className?: string
}

export default function FloatingTabBar({ className }: FloatingTabBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const routeActive = activeTabFromPath(pathname)
  const [, startTransition] = useTransition()
  const createAction = useMobileCreateAction()
  const FabIcon = createAction?.icon

  /** Visual selection — local so scrub stays interruptible (no ViewTransition). */
  const [highlight, setHighlight] = useState<TabId | null>(routeActive)

  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef(new Map<TabId, HTMLElement>())
  const [pill, setPill] = useState<PillBox | null>(null)
  const [pillAnimated, setPillAnimated] = useState(false)

  const gesture = useRef<{
    pointerId: number
    startX: number
    startY: number
    originId: TabId | null
    lastId: TabId | null
    mode: 'none' | 'scrub' | 'flick'
    captured: boolean
  } | null>(null)
  const ignoreNextClick = useRef(false)

  useEffect(() => {
    setHighlight(routeActive)
  }, [routeActive])

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav || !highlight) {
      setPill(null)
      setPillAnimated(false)
      return
    }

    const update = () => {
      const tab = linkRefs.current.get(highlight)
      if (!tab) {
        setPill(null)
        return
      }
      setPill(measurePill(nav, tab))
    }

    update()
    // Remeasure after label mount; then enable CSS sliding so the pill doesn't fly in from 0,0
    let enable = 0
    const settle = requestAnimationFrame(() => {
      update()
      enable = requestAnimationFrame(() => setPillAnimated(true))
    })

    const ro = new ResizeObserver(update)
    ro.observe(nav)
    const tab = linkRefs.current.get(highlight)
    if (tab) ro.observe(tab)
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(settle)
      cancelAnimationFrame(enable)
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [highlight])

  function navigateTo(tab: (typeof TABS)[number], haptic = true) {
    setHighlight(tab.id)
    if (haptic && tab.id !== routeActive) lightHaptic()
    if (pathname === tab.href) return
    startTransition(() => {
      router.push(tab.href, { scroll: false })
    })
  }

  function tabAtClientX(clientX: number): (typeof TABS)[number] | null {
    const nav = navRef.current
    if (!nav) return null
    const navRect = nav.getBoundingClientRect()
    if (clientX < navRect.left || clientX > navRect.right) return null

    for (const tab of TABS) {
      const el = linkRefs.current.get(tab.id)
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right) return tab
    }

    let best: (typeof TABS)[number] | null = null
    let bestDist = Infinity
    for (const tab of TABS) {
      const el = linkRefs.current.get(tab.id)
      if (!el) continue
      const r = el.getBoundingClientRect()
      const dist = Math.abs(clientX - (r.left + r.width / 2))
      if (dist < bestDist) {
        bestDist = dist
        best = tab
      }
    }
    return best
  }

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (e.button !== 0) return
    const under = tabAtClientX(e.clientX)
    gesture.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originId: highlight,
      lastId: under?.id ?? highlight,
      mode: 'none',
      captured: false,
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return

    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (g.mode === 'none') {
      if (absX < SCRUB_PX || absX < absY * 1.2) return
      g.mode = 'scrub'
      if (!g.captured) {
        navRef.current?.setPointerCapture(e.pointerId)
        g.captured = true
      }
    }

    if (g.mode !== 'scrub') return

    const tab = tabAtClientX(e.clientX)
    if (tab && tab.id !== g.lastId) {
      g.lastId = tab.id
      lightHaptic()
      setHighlight(tab.id)
    }
  }

  function finishGesture(e: ReactPointerEvent<HTMLElement>) {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return

    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (g.captured) {
      try {
        navRef.current?.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }

    // Flick to neighbor (no scrub)
    if (g.mode === 'none' && absX >= FLICK_PX && absX > absY * 1.35) {
      const from = g.originId ?? routeActive
      const idx = TABS.findIndex((t) => t.id === from)
      if (idx >= 0) {
        const next = dx < 0 ? TABS[idx + 1] : TABS[idx - 1]
        if (next) {
          ignoreNextClick.current = true
          navigateTo(next)
          gesture.current = null
          return
        }
      }
    }

    // Scrub commit
    if (g.mode === 'scrub' && g.lastId) {
      const tab = TABS.find((t) => t.id === g.lastId)
      if (tab) {
        ignoreNextClick.current = true
        navigateTo(tab, tab.id !== routeActive)
        gesture.current = null
        return
      }
    }

    // Cancelled scrub / failed flick — snap highlight back to route
    if (g.mode === 'scrub') {
      setHighlight(routeActive)
    }

    gesture.current = null
  }

  return (
    <div
      data-floating-tab-bar
      className={cn(
        'fixed inset-x-3 bottom-[max(0.35rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-center gap-2.5 md:hidden',
        className
      )}
    >
      <nav
        ref={navRef}
        className="floating-tab-glass relative flex w-fit min-w-[min(100%,18.5rem)] max-w-full shrink-0 touch-manipulation items-center justify-evenly gap-1 px-2.5 py-1.5"
        aria-label="Navegación principal"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={(e) => {
          if (gesture.current?.pointerId === e.pointerId) {
            setHighlight(routeActive)
            gesture.current = null
          }
        }}
      >
        {pill ? (
          <span
            aria-hidden
            className={cn(
              'floating-tab-active-pill pointer-events-none absolute left-0 top-0 z-[1] rounded-full',
              pillAnimated &&
                'transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'motion-reduce:transition-none'
            )}
            style={{
              width: pill.width,
              height: pill.height,
              transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
            }}
          />
        ) : null}

        {TABS.map((tab) => {
          const isActive = highlight === tab.id
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              ref={(node) => {
                if (node) linkRefs.current.set(tab.id, node)
                else linkRefs.current.delete(tab.id)
              }}
              onClick={(e) => {
                if (ignoreNextClick.current) {
                  e.preventDefault()
                  ignoreNextClick.current = false
                  return
                }
                // Keep cmd/ctrl-click / middle-click native
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return
                }
                e.preventDefault()
                navigateTo(tab)
              }}
              className={cn(
                'relative z-10 flex shrink-0 items-center justify-center gap-1.5 rounded-full',
                'transition-[padding,gap,color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
                'active:scale-[0.97] motion-reduce:transition-none',
                'select-none [-webkit-user-select:none] [-webkit-touch-callout:none]',
                isActive
                  ? 'px-3.5 py-2.5 text-black'
                  : 'min-w-12 px-3.5 py-2.5 text-black/55'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'shrink-0 transition-[color,transform] duration-200',
                  'ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                  isActive ? 'size-[18px]' : 'size-[20px]'
                )}
                strokeWidth={isActive ? 2.25 : 1.75}
                fill={isActive ? 'currentColor' : 'none'}
              />
              {isActive ? (
                <span className="truncate text-[13px] font-semibold leading-none tracking-tight text-black">
                  {tab.label}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {createAction && FabIcon ? (
        <button
          type="button"
          disabled={createAction.disabled}
          onClick={() => {
            if (createAction.disabled) return
            lightHaptic()
            createAction.open()
          }}
          className={cn(
            'relative flex size-12 shrink-0 items-center justify-center rounded-full',
            'bg-brand-700 text-white',
            'shadow-[0_8px_24px_rgba(33,90,78,0.35),0_2px_8px_rgba(15,23,42,0.12)]',
            'transition-[transform,opacity] active:scale-[0.96]',
            createAction.disabled && 'cursor-not-allowed opacity-45 active:scale-100'
          )}
          aria-label={createAction.label}
          aria-disabled={createAction.disabled || undefined}
        >
          <FabIcon className="size-5 text-white" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}
