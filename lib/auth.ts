import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter removed - not needed for credentials provider with JWT strategy
  // adapter: PrismaAdapter(prisma) as any,
  debug: process.env.NODE_ENV === 'development', // Enable debug logging
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] ========== AUTHORIZE START ==========')
        console.log('[AUTH] Email:', credentials?.email)
        console.log('[AUTH] Password length:', credentials?.password?.length)

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] ❌ Missing email or password')
          return null
        }

        try {
          // Development bypass for testing
          if (
            process.env.NODE_ENV === 'development' &&
            credentials.email === 'admin@example.com' &&
            credentials.password === 'admin'
          ) {
            console.log('[AUTH] Dev bypass attempted')
            const adminUser = await prisma.user.findUnique({
              where: { email: 'admin@example.com' },
            })
            if (adminUser) {
              console.log('[AUTH] Dev bypass successful')
              return {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
              }
            }
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          console.log('[AUTH] User found:', user ? 'Yes' : 'No')

          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('[AUTH] Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('[AUTH] Invalid password')
            return null
          }

          console.log('[AUTH] ✅ Login successful for:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.log('[AUTH] ❌ EXCEPTION:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
