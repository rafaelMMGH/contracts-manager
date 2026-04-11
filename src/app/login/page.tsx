'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8fafc' }}>

      {/* ── Left decorative panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 px-12 py-14 border-r border-slate-200"
        style={{ backgroundColor: '#f1f5f9' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, #065f46, #047857)',
              boxShadow: '0 4px 14px rgba(6,95,70,0.25)',
            }}
          >
            <span
              className="text-white text-base leading-none select-none"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 700 }}
            >
              C
            </span>
          </div>
          <div>
            <p
              className="text-slate-900 text-sm tracking-[0.08em] uppercase leading-none"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600 }}
            >
              Contratos
            </p>
            <p className="text-slate-400 text-[10px] tracking-[0.14em] uppercase mt-0.5 font-light">
              Manager
            </p>
          </div>
        </div>

        {/* Quote */}
        <div className="space-y-5">
          <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#065f46' }} />
          <blockquote>
            <p
              className="text-[22px] leading-[1.55] text-slate-600"
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Gestiona tus contratos de arrendamiento con claridad y confianza.
            </p>
          </blockquote>
          <p className="text-xs text-slate-400 tracking-wide uppercase font-light">
            Sistema de gestión de propiedades
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Inmuebles', value: '—' },
            { label: 'Contratos', value: '—' },
            { label: 'Inquilinos', value: '—' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-3 py-3 bg-white border border-slate-200"
            >
              <p
                className="text-lg leading-none text-slate-900"
                style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700 }}
              >
                {s.value}
              </p>
              <p className="text-[10px] text-slate-400 tracking-[0.10em] uppercase mt-1.5 font-light">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, #065f46, #047857)',
                boxShadow: '0 4px 14px rgba(6,95,70,0.25)',
              }}
            >
              <span
                className="text-white text-base leading-none select-none"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 700 }}
              >
                C
              </span>
            </div>
            <p
              className="text-slate-900 text-sm tracking-[0.08em] uppercase"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600 }}
            >
              Contratos Manager
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-[30px] leading-[1.2] text-slate-900"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600 }}
            >
              Bienvenido de vuelta
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-light">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-medium tracking-[0.10em] uppercase text-slate-500"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="form-input w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 bg-white border border-slate-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-medium tracking-[0.10em] uppercase text-slate-500"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="form-input w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 bg-white border border-slate-200"
              />
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-100" />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Iniciando sesión…
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-300 mt-8 tracking-wide">
            Acceso restringido · Solo usuarios autorizados
          </p>
        </div>
      </div>
    </div>
  )
}
