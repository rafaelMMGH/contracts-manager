import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import TopHeader from '@/components/TopHeader'
import MobileChrome from '@/components/mobile/MobileChrome'
import MobileScrollContent from '@/components/mobile/MobileScrollContent'
import { Toaster } from 'sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <MobileChrome user={session.user}>
      <div className="flex h-[100dvh] overflow-hidden bg-bg">
        <div className="hidden h-full md:flex">
          <Sidebar user={session.user} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="hidden md:block">
            <TopHeader user={session.user} />
          </div>
          <main
            id="main-content"
            className="workspace-mesh flex-1 overflow-y-auto scroll-smooth [scrollbar-gutter:stable]"
          >
            <MobileScrollContent user={session.user}>
              {children}
            </MobileScrollContent>
          </main>
        </div>
        <Toaster richColors position="top-center" expand={false} closeButton />
      </div>
    </MobileChrome>
  )
}
