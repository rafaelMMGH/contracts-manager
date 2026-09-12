'use client'

import { useEffect, useState } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  /** Desktop form-sheet max width (px). */
  width?: number
  children: React.ReactNode
  footer: React.ReactNode
}

function useIsMobileSheet() {
  const [isMobile, setIsMobile] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => {
      setIsMobile(mq.matches)
      setReady(true)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return { isMobile, ready }
}

function SheetChrome({
  title,
  children,
  footer,
  swipeHint = false,
}: {
  title: string
  children: React.ReactNode
  footer: React.ReactNode
  swipeHint?: boolean
}) {
  return (
    <>
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex w-full justify-center pb-1 pt-3">
          <span className="h-1 w-10 rounded-full bg-black/15" aria-hidden />
        </div>
        <div className="flex w-full items-center justify-center border-b border-black/[0.06] px-4 pb-3.5 pt-1">
          <h2 className="max-w-[70%] truncate text-center text-[17px] font-semibold tracking-tight text-[#1C1C1E]">
            {title}
          </h2>
        </div>
      </div>

      <div
        {...(swipeHint ? { 'data-base-ui-swipe-ignore': '' } : {})}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      >
        {children}
      </div>

      <div
        className={cn(
          'apple-sheet-footer shrink-0 border-t border-black/[0.06] bg-[#F7F7F7]/95 px-5 pt-3',
          'pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl'
        )}
      >
        {footer}
      </div>
    </>
  )
}

export default function SlideSheet({
  open,
  onClose,
  title,
  width = 500,
  children,
  footer,
}: Props) {
  const { isMobile, ready } = useIsMobileSheet()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!ready) return null

  if (isMobile) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose()
        }}
        swipeDirection="down"
      >
        <Drawer.Portal>
          <Drawer.Backdrop
            className={cn(
              'apple-drawer-backdrop fixed inset-0 z-50 bg-black/30',
              'supports-backdrop-filter:backdrop-blur-[2px]'
            )}
          />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
            <Drawer.Popup
              className={cn(
                'apple-drawer-popup apple-sheet',
                'relative flex max-h-[min(92dvh,820px)] w-full flex-col overflow-hidden outline-none',
                'rounded-t-[28px] bg-[#F7F7F7]',
                'shadow-[0_-12px_40px_rgba(15,23,42,0.14)]'
              )}
            >
              <Drawer.Content className="flex max-h-[min(92dvh,820px)] flex-col outline-none">
                <Drawer.Title className="sr-only">{title}</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Desliza hacia abajo para cerrar.
                </Drawer.Description>
                <SheetChrome
                  title={title}
                  footer={footer}
                  swipeHint
                >
                  {children}
                </SheetChrome>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]',
          'transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          'motion-reduce:transition-none',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ ['--sheet-width' as string]: `${width}px` }}
        className={cn(
          'apple-sheet fixed z-50 flex flex-col bg-[#F7F7F7]',
          'left-1/2 top-[8vh] w-[min(calc(100%-2rem),var(--sheet-width))] max-h-[84vh]',
          '-translate-x-1/2 rounded-[28px]',
          'shadow-[0_24px_64px_rgba(15,23,42,0.18)]',
          'transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          'will-change-transform motion-reduce:transition-none',
          open
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-8 opacity-0'
        )}
      >
        <SheetChrome title={title} footer={footer}>
          {children}
        </SheetChrome>
      </div>
    </>
  )
}
