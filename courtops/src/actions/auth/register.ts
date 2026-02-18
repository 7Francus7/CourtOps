'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function registerClub(formData: FormData) {
       try {
              const clubName = formData.get('clubName') as string
              const email = formData.get('email') as string
              const password = formData.get('password') as string
              const userName = formData.get('userName') as string
              const plan = formData.get('plan') as string // 'FREE_TRIAL', 'BASIC', 'PRO'

              if (!clubName || !email || !password || !userName) {
                     return { success: false, error: 'Faltan campos requeridos.' }
              }

              // 1. Check existing Email
              const existingUser = await prisma.user.findUnique({ where: { email } })
              if (existingUser) {
                     return { success: false, error: 'El email ya está registrado.' }
              }

              // 2. Format Slug
              const slug = clubName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Math.floor(Math.random() * 1000)

              // 3. Determine Plan Details
              let subscriptionStatus = 'TRIAL'
              let nextBillingDate = new Date()
              nextBillingDate.setDate(nextBillingDate.getDate() + 7) // 7 days trial default except paid immediately?

              // For now, all start as TRIAL, upgrading later. Or if they pick paid, we set trial anyway to let them test first.
              // The prompt says: "gratis por 7 dias y otros dos con distintas opciones"
              // So all start with a 7-day trial of the chosen tier, or just a free trial tier.
              // Let's assume they choose a tier, and get 7 days free on that tier or a generic trial.

              // 4. Create Club & User Transaction
              const hashedPassword = await bcrypt.hash(password, 12)

              await prisma.$transaction(async (tx) => {
                     // Create Club
                     const club = await tx.club.create({
                            data: {
                                   name: clubName,
                                   slug: slug,
                                   plan: plan,
                                   subscriptionStatus: 'TRIAL',
                                   nextBillingDate: nextBillingDate,
                                   // Default Settings
                                   openTime: '08:00',
                                   closeTime: '23:00',
                                   slotDuration: 90,
                                   themeColor: '#10b981', // Emerald
                            }
                     })

                     // Create Admin User
                     await tx.user.create({
                            data: {
                                   name: userName,
                                   email: email,
                                   password: hashedPassword,
                                   role: 'ADMIN',
                                   clubId: club.id
                            }
                     })

                     // Optional: Create Default Courts?
                     await tx.court.createMany({
                            data: [
                                   { name: 'Cancha 1', clubId: club.id, sortOrder: 0, surface: 'Sintético' },
                                   { name: 'Cancha 2', clubId: club.id, sortOrder: 1, surface: 'Sintético' }
                            ]
                     })
              })

              // Send Welcome Email (async, don't block response)
              import('@/lib/email').then(({ sendWelcomeEmail }) => {
                     sendWelcomeEmail(email, userName, clubName).catch(err => console.error('Failed to send welcome email in background', err));
              });

              return { success: true }
       } catch (error: any) {
              console.error("Registration Error:", error)
              return { success: false, error: 'Error al crear la cuenta. Intente nuevamente.' }
       }
}
