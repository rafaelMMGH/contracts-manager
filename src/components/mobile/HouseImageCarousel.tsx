'use client'

import { useRef, useState, type UIEvent } from 'react'
import Image from 'next/image'
import { ViewTransition } from 'react'
import { cn } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import type { MobileBadgeStatus } from './housePlaceholders'

type HouseImageCarouselProps = {
  images: string[]
  alt: string
  badgeStatus: MobileBadgeStatus
  expiresInDays: number | null
  className?: string
  priority?: boolean
  /** Full-bleed hero for detail — match list 16/10 so the shared morph doesn’t stretch */
  fullBleed?: boolean
  /** Shared-element name — wraps media only so badges/dots stay out of the morph */
  shareName?: string
}

export default function HouseImageCarousel({
  images,
  alt,
  badgeStatus,
  expiresInDays,
  className,
  priority = false,
  fullBleed = false,
  shareName,
}: HouseImageCarouselProps) {
  const slides = images.length > 0 ? images : []
  const [index, setIndex] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)

  function onScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.clientWidth <= 0) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    setIndex(Math.max(0, Math.min(next, slides.length - 1)))
  }

  function goTo(i: number) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  if (slides.length === 0) return null

  const media = (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className={cn(
        'flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden',
        'scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      )}
      aria-label="Galería del inmueble"
    >
      {slides.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="relative h-full w-full shrink-0 snap-center"
        >
          <Image
            src={src}
            alt={i === 0 ? alt : `${alt} — foto ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            priority={priority && i === 0}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        /* Keep 16/10 on detail so list→detail morph only changes radius/size, not aspect */
        fullBleed ? 'aspect-[16/10] rounded-none' : 'aspect-[16/10] rounded-[2rem]',
        className
      )}
    >
      {shareName ? (
        <ViewTransition
          name={shareName}
          share="morph"
          default="none"
        >
          <div className="absolute inset-0">{media}</div>
        </ViewTransition>
      ) : (
        media
      )}

      <StatusBadge
        status={badgeStatus}
        variant="onImage"
        expiresInDays={expiresInDays}
        className={cn(
          'pointer-events-none absolute left-4 z-10',
          fullBleed
            ? 'top-[calc(4.25rem+env(safe-area-inset-top,0px))]'
            : 'top-4'
        )}
      />

      {slides.length > 1 ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 z-10 flex justify-center gap-1.5',
            fullBleed ? 'bottom-14' : 'bottom-3'
          )}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'pointer-events-auto size-1.5 rounded-full transition-[width,background-color] duration-200',
                i === index
                  ? 'w-4 bg-white'
                  : 'bg-white/55 hover:bg-white/80'
              )}
              aria-label={`Ir a foto ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
