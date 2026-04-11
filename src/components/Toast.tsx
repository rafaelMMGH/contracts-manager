'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ToastData {
  id: string
  message: string
  type: 'success' | 'error'
}

// Fire-and-forget helper — call from any client component
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<ToastData>('app:toast', {
      detail: { id: crypto.randomUUID(), message, type },
    })
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)

  // Slide in on mount, slide out before removal
  useEffect(() => {
    const inId = requestAnimationFrame(() => setVisible(true))
    const outId = setTimeout(() => {
      setVisible(false)
      setTimeout(onRemove, 220)
    }, 3000)
    return () => {
      cancelAnimationFrame(inId)
      clearTimeout(outId)
    }
  }, [onRemove])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3 rounded-xl min-w-[260px] max-w-sm bg-white',
        'transition-[opacity,transform] duration-200',
        isSuccess ? 'border border-emerald-200' : 'border border-red-200',
      ].join(' ')}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
        transitionTimingFunction: 'cubic-bezier(0.2,0,0,1)',
        boxShadow: '0 4px 16px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.08)',
      }}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircleIcon className="h-[18px] w-[18px] text-emerald-600 shrink-0 mt-px" style={{ strokeWidth: 2 }} />
      ) : (
        <XCircleIcon className="h-[18px] w-[18px] text-red-500 shrink-0 mt-px" style={{ strokeWidth: 2 }} />
      )}
      <p className="text-sm text-slate-700 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onRemove, 220) }}
        className="shrink-0 text-slate-300 hover:text-slate-500 transition-[color] duration-150 mt-px"
        aria-label="Cerrar notificación"
      >
        <XMarkIcon className="h-3.5 w-3.5" style={{ strokeWidth: 2 }} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const [mounted, setMounted] = useState(false)
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => { setMounted(true) }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<ToastData>
      setToasts(prev => [...prev, detail])
    }
    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [])

  if (!mounted || toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>,
    document.body
  )
}
