import { cn } from '@/lib/utils'
import type { MobileBadgeStatus } from './housePlaceholders'

type StatusBadgeProps = {
  status: MobileBadgeStatus
  variant?: 'default' | 'onImage'
  className?: string
  /** When set with por_vencer, label becomes "Vence en Xd" */
  expiresInDays?: number | null
}

const LABELS: Record<MobileBadgeStatus, string> = {
  disponible: 'Disponible',
  rentado: 'Rentado',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  mantenimiento: 'Mantenimiento',
}

const STYLES = {
  default: {
    disponible: 'bg-emerald-50 text-emerald-700',
    rentado: 'bg-yellow-50 text-yellow-800',
    por_vencer: 'bg-red-50 text-red-700',
    vencido: 'bg-red-50 text-red-800',
    mantenimiento: 'bg-blue-50 text-blue-900',
  },
  onImage: {
    disponible:
      'border-emerald-100/55 bg-emerald-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md',
    rentado:
      'border-yellow-100/50 bg-yellow-800/45 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md',
    por_vencer:
      'border-red-100/55 bg-red-800/55 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md',
    vencido:
      'border-red-100/55 bg-red-950/60 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md',
    mantenimiento:
      'border-sky-100/45 bg-blue-950/55 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md',
  },
} as const

export default function StatusBadge({
  status,
  variant = 'default',
  className,
  expiresInDays = null,
}: StatusBadgeProps) {
  const label =
    status === 'por_vencer' && expiresInDays != null
      ? `Vence en ${expiresInDays}d`
      : LABELS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium leading-none',
        variant === 'onImage'
          ? 'border px-3.5 py-2 text-[12.5px]'
          : 'px-2.5 py-1 text-[11px]',
        STYLES[variant][status],
        className
      )}
    >
      {label}
    </span>
  )
}
