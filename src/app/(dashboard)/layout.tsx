import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import ToastContainer from '@/components/Toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-6 md:p-10">{children}</div>
      </main>
      <ToastContainer />
    </div>
  )
}
