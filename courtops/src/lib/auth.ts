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

                            // 🚀 TOTAL EMERGENCY BYPASS (v3.2)
                            // Skip DB entirely for the main owner account if password matches
                            if (inputEmail === 'dellorsif@gmail.com' && credentials.password === '123456franco') {
                                   return {
                                          id: 'developer-override',
                                          email: 'dellorsif@gmail.com',
                                          name: 'Franco Develop (Emergency)',
                                          role: 'GOD',
                                          clubId: null
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
                                   console.error("Auth DB Error:", e)
                                   return null
                            }
                     }
              })
       ],
       callbacks: {
              async session({ session, token }) {
                     if (token) {
                            session.user.id = token.id as string
                            session.user.clubId = token.clubId as string
                            session.user.role = token.role as string
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
              strategy: "jwt"
       },
       secret: process.env.NEXTAUTH_SECRET || "lxoRcjQQrIBR5JSGWlNka/1LfH0JtrrxtIGDM/MTAN7o=",
}
