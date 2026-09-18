import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Resolves the authenticated user's DB id.
 * If the JWT still carries a stale id after a DB reseed, falls back to email lookup.
 */
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autenticado')

  const sessionId = session.user.id
  if (sessionId) {
    const byId = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true },
    })
    if (byId) return byId.id
  }

  const email = session.user.email
  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (byEmail) return byEmail.id
  }

  throw new Error('No autenticado')
}
