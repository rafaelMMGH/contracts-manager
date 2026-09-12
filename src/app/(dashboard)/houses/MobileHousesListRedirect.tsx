'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** On mobile viewports, the houses list lives on Inicio — redirect away from /houses. */
export default function MobileHousesListRedirect({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const redirectIfMobile = () => {
      if (mq.matches) router.replace('/')
    }
    redirectIfMobile()
    mq.addEventListener('change', redirectIfMobile)
    return () => mq.removeEventListener('change', redirectIfMobile)
  }, [router])

  return <div className="hidden md:block">{children}</div>
}
