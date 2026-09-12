'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Hydration guard for portal
  useEffect(() => { setMounted(true) }, [])

  // Two-state animation machine: visible controls DOM presence, animating controls CSS state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsAnimating(true))
      )
      return () => cancelAnimationFrame(id)
    } else {
      setIsAnimating(false)
      const t = setTimeout(() => setIsVisible(false), 210)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!mounted || !isVisible) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-150"
        style={{ opacity: isAnimating ? 1 : 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — full screen on mobile, centered card on sm+ */}
      <div
        className="relative flex flex-col bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl overflow-hidden"
        style={{
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          transition: 'opacity 200ms cubic-bezier(0.2,0,0,1), transform 200ms cubic-bezier(0.2,0,0,1)',
          boxShadow: isAnimating
            ? '0 24px 64px rgba(15,23,42,0.14), 0 8px 24px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)'
            : 'none',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-text-primary text-balance">
            {title}
          </h2>
          {/* 40×40px hit area (w-10 h-10) — min requirement */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400
              hover:text-slate-700 hover:bg-slate-100
              active:scale-95
              transition-[color,background-color,transform] duration-150"
            style={{ transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)' }}
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-4 w-4" style={{ strokeWidth: 2 }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
