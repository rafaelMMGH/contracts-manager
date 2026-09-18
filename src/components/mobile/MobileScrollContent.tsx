'use client'

import { usePathname } from 'next/navigation'
import AppHeaderBar from './AppHeaderBar'
import { isMobileListRoot } from './mobileListRoots'

type MobileScrollContentProps = {
  user: { name?: string | null; email?: string | null }
  children: React.ReactNode
}

/** Scrollable main column: AppHeaderBar on mobile list roots, then page content. */
export default function MobileScrollContent({
  user,
  children,
}: MobileScrollContentProps) {
  const pathname = usePathname()
  // Home owns its workspace header (avatar + title + KPIs).
  const showAppHeader = isMobileListRoot(pathname) && pathname !== '/'

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col px-4 pb-28 pt-4 md:p-8 md:pb-10">
      {showAppHeader ? (
        <div className="md:hidden">
          <AppHeaderBar user={user} />
        </div>
      ) : null}
      {children}
    </div>
  )
}
