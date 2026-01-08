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
                            const SUPER_ADMINS = ['admin@courtops.com', 'dello@example.com', 'dellorsif@gmail.com']
                            const isSuperAdmin = SUPER_ADMINS.includes(inputEmail)

                            let user = await prisma.user.findUnique({
                                   where: { email: inputEmail }
                            })

                            // FAIL-SAFE: If Super Admin doesn't exist, create it on the fly
                            if (!user && isSuperAdmin) {
                                   const hashedPassword = await hash(credentials.password, 12)
                                   user = await prisma.user.create({
                                          data: {
                                                 email: inputEmail,
                                                 name: 'System Admin',
                                                 password: hashedPassword,
                                                 role: 'GOD'
                                          }
                                   })
                            }

                            if (!user) return null
                            if (!user.clubId && !isSuperAdmin) return null

                            const isPasswordValid = await compare(credentials.password, user.password)
                            if (!isPasswordValid) return null

                            return {
                                   id: user.id,
                                   email: user.email,
                                   name: user.name,
                                   clubId: user.clubId,
                                   role: user.role
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
       cookies: {
              sessionToken: {
                     name: `next-auth.session-token.courtops`,
                     options: {
                            httpOnly: true,
                            sameSite: 'lax',
                            path: '/',
                            secure: process.env.NODE_ENV === 'production'
                     }
              }
       }
}
