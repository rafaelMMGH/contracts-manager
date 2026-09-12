import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.MOBILE_JWT_SECRET!

export function signMobileToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: '30d' })
}

export function getMobileUserId(request: NextRequest): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = jwt.verify(auth.slice(7), SECRET) as { userId: string }
    return payload.userId
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export function notFound(message = 'No encontrado') {
  return NextResponse.json({ error: message }, { status: 404 })
}
