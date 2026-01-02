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
                            console.log("Authorize called with:", credentials?.email)
                            return null
                     }

                            // --- EMERGENCY SETUP / RESCUE MODE ---
                            // Si no hay usuario y se usa el password 'setup', creamos todo automáticamente.
                            if(credentials.email === 'admin@courtops.com' && credentials.password === 'setup') {
                     try {
                            const existingUser = await prisma.user.findUnique({ where: { email: 'admin@courtops.com' } })
                                          
                                          if(!existingUser) {
                                   console.log("🚨 SETUP MODE ACTIVATED: Creating default data...")
                                   const hashedPassword = await hash('securepassword123', 10)

                                   const newClub = await prisma.club.create({
                                          data: {
                                                 name: 'CourtOps Club Demo',
                                                 slug: 'courtops-demo-rescue',
                                                 logoUrl: 'https://placehold.co/100x100?text=CO',
                                                 users: {
                                                        create: {
                                                               email: 'admin@courtops.com',
                                                               name: 'Admin Demo',
                                                               password: hashedPassword,
                                                               role: 'OWNER'
                                                        }
                                                 },
                                                 courts: {
                                                        create: [
                                                               { name: 'Cancha 1', surface: 'Cesped', isIndoor: true, sortOrder: 1 },
                                                               { name: 'Cancha 2', surface: 'Cesped', isIndoor: true, sortOrder: 2 }
                                                        ]
                                                 },
                                                 cashRegisters: {
                                                        create: { status: 'OPEN', startAmount: 0 }
                                                 }
                                          }
                                   })

                                   // Return the newly created user to login immediately
                                   const newUser = await prisma.user.findUnique({ where: { email: 'admin@courtops.com' } })
                                   if (newUser) {
                                          return {
                                                 id: newUser.id,
                                                 email: newUser.email,
                                                 name: newUser.name,
                                                 clubId: newUser.clubId,
                                                 role: newUser.role
                                          }
                                   }
                            }
                     } catch(error) {
                            console.error("Rescue setup failed:", error)
                            // Continue to normal login attempt if fail (which will likely fail too)
                     }
              }
                            // -------------------------------------

                            const user = await prisma.user.findUnique({
                     where: {
                            email: credentials.email
                     }
              })

                            const SUPER_ADMINS = ['admin@courtops.com', 'dello@example.com', 'dellorsif@gmail.com']

                            if(!user) {
              return null
       }

                            const isSuperAdmin = SUPER_ADMINS.includes(user.email)

                            if(!user.clubId && !isSuperAdmin) { // User MUST belong to a club, unless Super Admin
              return null
                            }

// Check password (Assuming hashed in DB, which we will ensure in seed)
// For existing seed without hash, we might need a fallback or re-seed.
// The current seed has 'securepassword123' as plain text string in 'password' field 
// because we didn't use bcrypt in seed yet.
// TO FIX: We will update seed or simple check for now if it doesn't match hash format?
// Let's assume we will re-run seed with hashing or manual update.
// For MVP speed now: direct string compare allowed IF not hashed? 
// No, let's do it right. I will re-seed.

const isPasswordValid = await compare(credentials.password, user.password)

if (!isPasswordValid) {
       return null
}

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
              console.log("Session callback:", session.user.email, session.user.clubId)
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
       signIn: '/login', // Custom login page
       },
session: {
       strategy: "jwt"
},
secret: "lxoRcjQQrIBR5JSGWlNka/1LfH0JtrrxtIGDM/MTAN7o=",
       debug: true,
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

console.log("AUTH OPTIONS LOADED. Secret length:", process.env.NEXTAUTH_SECRET?.length)
