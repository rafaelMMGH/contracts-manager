'use client'

import { useState } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function BrandMark({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
        <Building2 className="size-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'text-[13px] font-semibold leading-none tracking-tight',
            inverted ? 'text-white' : 'text-text-primary'
          )}
        >
          Contratos
        </p>
        <p className={cn('mt-0.5 text-[10px]', inverted ? 'text-white/55' : 'text-text-muted')}>
          Bienes raíces
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Correo o contraseña incorrectos')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="grid min-h-[100dvh] bg-bg lg:grid-cols-[1.2fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/login-hero.jpg"
          alt="Contrato de arrendamiento sobre una mesa en un departamento iluminado"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-800/55 to-brand-500/30" />

        <div className="relative z-10 flex h-full min-h-[100dvh] flex-col justify-between p-10 xl:p-14">
          <BrandMark inverted />

          <div className="login-reveal max-w-md space-y-4">
            <h2 className="text-4xl font-semibold tracking-tight text-white text-balance xl:text-5xl">
              Claridad en cada arrendamiento
            </h2>
            <p className="max-w-[36ch] text-base leading-relaxed text-white/70">
              Contratos, inmuebles e inquilinos en un solo lugar, listos cuando los necesitas.
            </p>
          </div>

          <p className="text-xs text-white/40">Sistema de gestión de propiedades</p>
        </div>
      </aside>

      <main
        id="main-content"
        className="relative flex items-center justify-center px-6 py-12 sm:px-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(67,97,238,0.08),transparent_55%)]"
        />

        <div className="login-reveal relative w-full max-w-[380px]">
          <BrandMark className="mb-10 lg:hidden" />

          <div className="mb-8 space-y-2">
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-text-primary text-balance sm:text-[2rem]">
              Bienvenido de vuelta
            </h1>
            <p className="text-sm leading-relaxed text-slate-500">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                aria-invalid={error ? true : undefined}
                className="h-11 bg-white px-3.5 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                aria-invalid={error ? true : undefined}
                className="h-11 bg-white px-3.5 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full border-transparent bg-brand-500 text-white shadow-brand hover:bg-brand-600 hover:text-white active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  Iniciando sesión…
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[11px] text-slate-400">
            Acceso restringido. Solo usuarios autorizados.
          </p>
        </div>
      </main>
    </div>
  )
}
