'use client'

import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { GripVertical, ImagePlus, Loader2, Trash2, Star } from 'lucide-react'
import {
  MAX_CLIENT_UPLOAD_BYTES,
  MAX_HOUSE_IMAGES,
  type HouseImageItem,
} from '@/lib/houseImages'
import { cn } from '@/lib/utils'

export type { HouseImageItem }

type HouseImageGalleryProps = {
  initialImages?: HouseImageItem[]
  disabled?: boolean
}

const ACCEPT = 'image/jpeg,image/png,image/webp'

async function compressFile(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    initialQuality: 0.75,
  })
}

export default function HouseImageGallery({
  initialImages = [],
  disabled = false,
}: HouseImageGalleryProps) {
  const [images, setImages] = useState<HouseImageItem[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || disabled) return
    setError(null)

    const remaining = MAX_HOUSE_IMAGES - images.length
    if (remaining <= 0) {
      setError(`Máximo ${MAX_HOUSE_IMAGES} fotos`)
      return
    }

    const picked = Array.from(fileList).slice(0, remaining)
    setUploading(true)

    try {
      const uploaded: HouseImageItem[] = []
      for (const file of picked) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('Solo JPEG, PNG o WebP')
          continue
        }
        if (file.size > MAX_CLIENT_UPLOAD_BYTES) {
          setError('Cada foto debe pesar menos de 15 MB')
          continue
        }

        const compressed = await compressFile(file)
        const body = new FormData()
        body.append('file', compressed, compressed.name || 'photo.jpg')

        const res = await fetch('/api/houses/upload', {
          method: 'POST',
          body,
        })
        const data = (await res.json()) as {
          url?: string
          pathname?: string
          error?: string
        }
        if (!res.ok || !data.url || !data.pathname) {
          throw new Error(data.error || 'Error al subir')
        }
        uploaded.push({ url: data.url, pathname: data.pathname })
      }
      if (uploaded.length > 0) {
        setImages((prev) => [...prev, ...uploaded].slice(0, MAX_HOUSE_IMAGES))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir fotos')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function makeCover(index: number) {
    if (index === 0) return
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.unshift(item)
      return next
    })
  }

  function onDragStart(index: number) {
    setDragIndex(index)
  }

  function onDragOver(e: React.DragEvent, overIndex: number) {
    e.preventDefault()
    if (dragIndex == null || dragIndex === overIndex) return
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(dragIndex, 1)
      next.splice(overIndex, 0, item)
      return next
    })
    setDragIndex(overIndex)
  }

  function onDragEnd() {
    setDragIndex(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-[11px] font-medium tracking-wide text-[#64748b]">
          Fotos
          <span className="ml-1 font-normal text-[#94a3b8]">
            (opcional · portada = primera)
          </span>
        </label>
        <span className="text-[10px] tabular-nums text-[#94a3b8]">
          {images.length}/{MAX_HOUSE_IMAGES}
        </span>
      </div>

      <input
        type="hidden"
        name="imagesJson"
        value={JSON.stringify(
          images.map((img, i) => ({
            url: img.url,
            pathname: img.pathname,
            sortOrder: i,
          }))
        )}
      />

      {images.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={`${img.pathname}-${i}`}
              draggable={!disabled && !uploading}
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragEnd={onDragEnd}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-xl border border-black/[0.08] bg-[#f8fafc]',
                dragIndex === i && 'opacity-60 ring-2 ring-[#3f5c48]/40'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
              {i === 0 ? (
                <span className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
                  Portada
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-0.5 bg-gradient-to-t from-black/55 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="cursor-grab text-white/90 active:cursor-grabbing">
                  <GripVertical className="size-3.5" strokeWidth={2} />
                </span>
                <div className="flex gap-0.5">
                  {i !== 0 ? (
                    <button
                      type="button"
                      onClick={() => makeCover(i)}
                      className="rounded p-0.5 text-white/90 hover:bg-white/20"
                      aria-label="Usar como portada"
                      disabled={disabled}
                    >
                      <Star className="size-3.5" strokeWidth={2} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="rounded p-0.5 text-white/90 hover:bg-white/20"
                    aria-label="Quitar foto"
                    disabled={disabled}
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || uploading || images.length >= MAX_HOUSE_IMAGES}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#cbd5e1] bg-white px-3 py-2 text-[12px] font-medium text-[#475569] transition hover:border-[#3f5c48]/40 hover:text-[#3f5c48] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <ImagePlus className="size-3.5" strokeWidth={2} />
          )}
          {uploading ? 'Subiendo…' : 'Agregar fotos'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || uploading}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
