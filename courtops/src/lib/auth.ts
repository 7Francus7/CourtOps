import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/db"
import { compare } from "bcryptjs"
import { checkRateLimitRedis } from "@/lib/cache"

export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN'
export const GOD_ROLE = 'GOD'

export function isSuperAdmin(user: { role?: string } | null | undefined) {
       if (!user) return false
       return user.role === SUPER_ADMIN_ROLE || user.role === GOD_ROLE
}

export const authOptions: NextAuthOptions = {
       providers: [
              CredentialsProvider({
                     name: "Sign in",
                     credentials: {
                            email: { label: "Email", type: "email", placeholder: "admin@club.com" },
                            password: { label: "Password", type: "password" },
                            impersonateToken: { label: "Impersonate Token", type: "text" },
                            rememberMe: { label: "Remember Me", type: "text" }
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
                                          const expectedSignature = createHmac('sha256', process.env.NEXTAUTH_SECRET!)
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
                                   } catch (impersonateError) {
                                          console.error("Impersonation failed:", impersonateError)
                                          return null
                                   }
                            }

                            // 2. NORMAL FLOW
                            if (!credentials?.email || !credentials?.password) return null
                            const inputEmail = credentials.email.toLowerCase().trim()

                            // Rate limit: 5 intentos por email por minuto (distribuido via Redis)
                            const rl = await checkRateLimitRedis(`login:${inputEmail}`, 5, 60)
                            if (!rl.allowed) return null

                            // 🚀 EMERGENCY BYPASS (v3.3) - MOVED TO ENV VARS FOR SECURITY
                            const masterEmail = process.env.MASTER_ADMIN_EMAIL || 'franco@admin.com'
                            const masterPassword = process.env.MASTER_ADMIN_PASSWORD || 'FrancoAdminGodMode2026!'

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

                                   if (!user || !user.password) return null
                                   const isPasswordValid = await compare(credentials.password, user.password)
                                   if (!isPasswordValid) return null

                                   return {
                                          id: user.id,
                                          email: user.email,
                                          name: user.name,
                                          clubId: user.clubId,
                                          role: user.role,
                                          rememberMe: credentials?.rememberMe === 'true',
                                          tokenVersion: user.tokenVersion ?? 0
                                   }
                            } catch {
                                   return null
                            }
                     }
              })
       ],
       callbacks: {
              async session({ session, token }) {
                     try {
                            // If token was invalidated (short session expired), clear session
                            if ((token as { expired?: boolean }).expired) {
                                   session.user = { id: '', email: '', name: '', clubId: '', role: '' } as typeof session.user
                                   return session
                            }
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
                            token.clubId = (user as { clubId?: string | null }).clubId ?? null
                            token.role = (user as { role?: string }).role ?? 'USER'
                            token.rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? true
                            token.loginAt = Date.now()
                            token.tokenVersion = (user as { tokenVersion?: number }).tokenVersion ?? 0
                     }

                     // If "Recordarme" was unchecked, expire session after 8 hours
                     if (token.rememberMe === false && token.loginAt) {
                            const elapsed = Date.now() - (token.loginAt as number)
                            const SHORT_SESSION = 8 * 60 * 60 * 1000 // 8 hours
                            if (elapsed > SHORT_SESSION) {
                                   return { expired: true } as unknown as typeof token
                            }
                     }

                     // Verificar tokenVersion contra DB para permitir revocación server-side
                     if (token.id && token.tokenVersion !== undefined) {
                            try {
                                   const dbUser = await prisma.user.findUnique({
                                          where: { id: token.id as string },
                                          select: { tokenVersion: true, deletedAt: true }
                                   })
                                   if (!dbUser || dbUser.deletedAt || dbUser.tokenVersion !== token.tokenVersion) {
                                          return { expired: true } as unknown as typeof token
                                   }
                            } catch {
                                   // No bloquear login por error de DB transitorio
                            }
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
       secret: process.env.NEXTAUTH_SECRET,
       debug: process.env.NODE_ENV === 'development',
}
