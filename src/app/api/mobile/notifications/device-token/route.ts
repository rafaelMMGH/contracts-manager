import { NextRequest, NextResponse } from 'next/server'
import { getMobileUserId, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const userId = getMobileUserId(request)
  if (!userId) return unauthorized()

  const { token } = await request.json()
  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId },
    create: { userId, token },
  })

  return NextResponse.json({ ok: true })
}
