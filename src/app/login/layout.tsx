import { GeistSans } from 'geist/font/sans'
import { Newsreader } from 'next/font/google'
import { cn } from '@/lib/utils'

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-login-serif',
  display: 'swap',
  adjustFontFallback: false,
})

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        GeistSans.className,
        GeistSans.variable,
        newsreader.variable,
        'min-h-[100dvh] antialiased'
      )}
    >
      {children}
    </div>
  )
}
