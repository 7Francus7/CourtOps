import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/db"
import { compare, hash } from "bcryptjs"

export const authOptions: NextAuthOptions = {
       providers: [
              CredentialsProvider({
                     name: "Sign in",
                     credentials: {
                            email: { label: "Email", type: "email", placeholder: "admin@club.com" },
                            password: { label: "Password", type: "password" },
                            impersonateToken: { label: "Impersonate Token", type: "text" }
                     },
                     async authorize(credentials) {
                            // 1. IMPERSONATION FLOW
                            if (credentials?.impersonateToken) {
                                   try {
                                          // Verify the token manually here since we are inside authorize
                                          // We expect a simple JSON string: { targetEmail: string, timestamp: number, signature: string }
                                          // Note: Real JWT verification would be better but requires importing libraries.
                                          // Let's rely on a simpler shared-secret HMAC approach if possible, or just parse the JSON and assume the action generated it securely?
                                          // NO. We MUST verify it.

                                          const data = JSON.parse(Buffer.from(credentials.impersonateToken, 'base64').toString())
                                          const { targetEmail, timestamp, signature } = data

                                          // Check expiry (1 minute)
                                          if (Date.now() - timestamp > 60000) return null

                                          // Verify Signature (Simple Hash for demo, robust enough if secret is strong)
                                          // In a real app we'd use 'crypto' or 'jose'. Assuming 'crypto' availability in Node environment.
                                          const { createHmac } = await import('crypto')
                                          const expectedSignature = createHmac('sha256', process.env.NEXTAUTH_SECRET || "lxoRcjQQrIBR5JSGWlNka/1LfH0JtrrxtIGDM/MTAN7o=")
                                                 .update(`${targetEmail}:${timestamp}`)
                                                 .digest('hex')

                                          if (signature !== expectedSignature) return null

                                          // Success - Find Target User
                                          const user = await prisma.user.findUnique({ where: { email: targetEmail } })
                                          if (!user) return null

                                          return {
                                                 id: user.id,
                                                 email: user.email,
                                                 name: user.name,
                                                 clubId: user.clubId,
                                                 role: user.role
                                          }
                                   } catch (e) {
                                          console.error("Impersonation failed:", e)
                                          return null
                                   }
                            }

                            // 2. NORMAL FLOW
                            if (!credentials?.email || !credentials?.password) return null
                            const inputEmail = credentials.email.toLowerCase().trim()

                            // 🚀 EMERGENCY BYPASS (v3.3) - MOVED TO ENV VARS FOR SECURITY
                            const masterEmail = process.env.MASTER_ADMIN_EMAIL
                            const masterPassword = process.env.MASTER_ADMIN_PASSWORD

                            if (masterEmail && masterPassword &&
                                   inputEmail === masterEmail &&
                                   credentials.password === masterPassword) {
                                   return {
                                          id: 'dev-override',
                                          email: masterEmail,
                                          name: 'Franco Admin',
                                          role: 'GOD',
                                          clubId: 'GOD_MODE_ACTIVE'
                                   }
                            }

                            try {
                                   const user = await prisma.user.findUnique({
                                          where: { email: inputEmail }
                                   })

                                   if (!user) return null
                                   const isPasswordValid = await compare(credentials.password, user.password)
                                   if (!isPasswordValid) return null

                                   return {
                                          id: user.id,
                                          email: user.email,
                                          name: user.name,
                                          clubId: user.clubId,
                                          role: user.role
                                   }
                            } catch (e) {
                                   return null
                            }
                     }
              })
       ],
       callbacks: {
              async session({ session, token }) {
                     try {
                            if (token && session.user) {
                                   session.user.id = (token.id as string) || ''
                                   session.user.clubId = (token.clubId as string) || ''
                                   session.user.role = (token.role as string) || 'USER'
                            }
                     } catch (e) {
                            console.error("Session callback error:", e)
                     }
                     return session
              },
              async jwt({ token, user }) {
                     if (user) {
                            token.id = user.id
                            token.clubId = (user as any).clubId
                            token.role = (user as any).role
                     }
                     return token
              }
       },
       pages: {
              signIn: '/login',
       },
       session: {
              strategy: "jwt",
              maxAge: 30 * 24 * 60 * 60, // 30 days
       },
       secret: process.env.NEXTAUTH_SECRET || "lxoRcjQQrIBR5JSGWlNka/1LfH0JtrrxtIGDM/MTAN7o=",
       debug: process.env.NODE_ENV === 'development',
}
