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
                            password: { label: "Password", type: "password" }
                     },
                     async authorize(credentials) {
                            if (!credentials?.email || !credentials?.password) return null

                            const inputEmail = credentials.email.toLowerCase().trim()

                            // 🚀 EMERGENCY BYPASS (v3.3)
                            if (inputEmail === 'dellorsif@gmail.com' && credentials.password === '123456franco') {
                                   return {
                                          id: 'dev-override',
                                          email: 'dellorsif@gmail.com',
                                          name: 'Franco Admin',
                                          role: 'GOD',
                                          clubId: 'GOD_MODE_ACTIVE' // Use string to avoid null issues in some callbacks
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
