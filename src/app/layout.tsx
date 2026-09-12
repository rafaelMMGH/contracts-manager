import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'
import { cn } from '@/lib/utils'

const lufga = localFont({
  src: [
    { path: '../fonts/lufga/LufgaRegular.woff', weight: '400', style: 'normal' },
    { path: '../fonts/lufga/LufgaMedium.woff', weight: '500', style: 'normal' },
    { path: '../fonts/lufga/LufgaSemiBold.woff', weight: '600', style: 'normal' },
    { path: '../fonts/lufga/LufgaBold.woff', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Contratos · Bienes raíces',
  description: 'Gestión de contratos de arrendamiento e inmuebles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={cn('font-sans', lufga.variable)}>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
