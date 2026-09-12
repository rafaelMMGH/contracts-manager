'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'

export type MobileCreateIcon = ComponentType<{
  className?: string
  strokeWidth?: number
}>

export type MobileFabVariant = 'create' | 'map'

export type MobileCreateAction = {
  label: string
  icon: MobileCreateIcon
  open: () => void
  disabled?: boolean
  variant?: MobileFabVariant
}

type MobileCreateControls = {
  action: MobileCreateAction | null
  setAction: (action: MobileCreateAction | null) => void
}

const MobileCreateContext = createContext<MobileCreateControls | null>(null)

export function MobileCreateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [action, setActionState] = useState<MobileCreateAction | null>(null)
  const setAction = useCallback((next: MobileCreateAction | null) => {
    setActionState(next)
  }, [])
  const value = useMemo(
    () => ({ action, setAction }),
    [action, setAction]
  )

  return (
    <MobileCreateContext.Provider value={value}>
      {children}
    </MobileCreateContext.Provider>
  )
}

export function useMobileCreateAction() {
  return useContext(MobileCreateContext)?.action ?? null
}

type RegisterOptions = {
  disabled?: boolean
  variant?: MobileFabVariant
}

/** Register a FAB action while this page is mounted. */
export function useRegisterMobileCreate(
  label: string,
  icon: MobileCreateIcon,
  open: () => void,
  options?: RegisterOptions
) {
  const setAction = useContext(MobileCreateContext)?.setAction
  const openRef = useRef(open)
  openRef.current = open
  const disabled = options?.disabled ?? false
  const variant = options?.variant ?? 'create'

  useEffect(() => {
    if (!setAction) return

    setAction({
      label,
      icon,
      disabled,
      variant,
      open: () => openRef.current(),
    })

    return () => setAction(null)
  }, [setAction, label, icon, disabled, variant])
}
