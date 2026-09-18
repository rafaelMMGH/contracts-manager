import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        return token
      }

      if (!token.id && token.sub) {
        token.id = token.sub
      }

      // After a DB reseed the JWT can keep a deleted user id; rebind via email.
      if (token.id) {
        const byId = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        })
        if (byId) return token
      }

      if (token.email) {
        const byEmail = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        })
        if (byEmail) {
          token.id = byEmail.id
          token.sub = byEmail.id
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
      }
      return session
    },
  },
}
