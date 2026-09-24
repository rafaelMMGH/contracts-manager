import { randomUUID } from 'crypto'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getMobileUserId } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import {
  ALLOWED_IMAGE_MIME,
  MAX_UPLOAD_BYTES,
  blobPathForUser,
} from '@/lib/houseImages'

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const mobileId = getMobileUserId(request)
  if (mobileId) {
    const exists = await prisma.user.findUnique({
      where: { id: mobileId },
      select: { id: true },
    })
    return exists?.id ?? null
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  if (session.user.id) {
    const byId = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    })
    if (byId) return byId.id
  }

  if (session.user.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (byEmail) return byEmail.id
  }

  return null
}

function extForMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Almacenamiento de imágenes no configurado' },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Formulario inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  }

  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return NextResponse.json(
      { error: 'Formato no permitido (JPEG, PNG o WebP)' },
      { status: 400 }
    )
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'La imagen supera el límite de 3 MB' },
      { status: 400 }
    )
  }

  const ext = extForMime(file.type)
  const pathname = blobPathForUser(userId, `${randomUUID()}.${ext}`)

  try {
    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (err) {
    console.error('Blob upload failed', err)
    return NextResponse.json(
      { error: 'No se pudo subir la imagen' },
      { status: 500 }
    )
  }
}
