'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import FloatingTabBar from './FloatingTabBar'
import { MobileCreateProvider } from './MobileCreateContext'
import ProfileSheet from './ProfileSheet'
import { ProfileSheetProvider } from './ProfileSheetContext'

type MobileChromeProps = {
  user: { name?: string | null; email?: string | null }
  children: React.ReactNode
}

/** Hide tab bar on /houses/[id] detail (not list, not edit). */
function isHouseDetailPath(pathname: string) {
  return /^\/houses\/[^/]+$/.test(pathname)
}

export default function MobileChrome({ user, children }: MobileChromeProps) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const hideTabBar = isHouseDetailPath(pathname)

  return (
    <ProfileSheetProvider openProfile={() => setProfileOpen(true)}>
      <MobileCreateProvider>
        {children}
        {!hideTabBar ? <FloatingTabBar /> : null}
        <ProfileSheet
          open={profileOpen}
          onOpenChange={setProfileOpen}
          user={user}
        />
      </MobileCreateProvider>
    </ProfileSheetProvider>
  )
}
