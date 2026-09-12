'use client'

import { createContext, useContext } from 'react'

type ProfileSheetControls = {
  openProfile: () => void
}

const ProfileSheetContext = createContext<ProfileSheetControls | null>(null)

export function ProfileSheetProvider({
  children,
  openProfile,
}: {
  children: React.ReactNode
  openProfile: () => void
}) {
  return (
    <ProfileSheetContext.Provider value={{ openProfile }}>
      {children}
    </ProfileSheetContext.Provider>
  )
}

export function useProfileSheet() {
  const ctx = useContext(ProfileSheetContext)
  if (!ctx) {
    throw new Error('useProfileSheet must be used within ProfileSheetProvider')
  }
  return ctx
}

/** Safe for pages outside provider — no-ops if missing. */
export function useOptionalProfileSheet() {
  return useContext(ProfileSheetContext)
}
