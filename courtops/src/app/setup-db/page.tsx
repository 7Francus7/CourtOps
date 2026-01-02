
import prisma from '@/lib/db'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
       try {
              const email = 'admin@courtops.com'
              const password = 'setup' // Password simple para entrar

              // 1. Check existing
              const existing = await prisma.user.findUnique({ where: { email } })
              if (existing) {
                     // Actualizar password porsiacaso
                     const hashedPassword = await hash(password, 10)
                     await prisma.user.update({
                            where: { email },
                            data: { password: hashedPassword }
                     })
                     return (
                            <div className="p-10 bg-green-900 text-white font-bold text-2xl">
                                   ✅ EL USUARIO YA EXISTÍA. <br />
                                   Se le reseteó la contraseña a: "setup" <br />
                                   Intenta entrar ahora.
                            </div>
                     )
              }

              // 2. Create New
              const hashedPassword = await hash(password, 10)

              const club = await prisma.club.create({
                     data: {
                            name: 'CourtOps Club Demo',
                            slug: 'courtops-demo-' + Date.now(),
                            logoUrl: 'https://placehold.co/100x100?text=CO',
                            users: {
                                   create: {
                                          email,
                                          name: 'Admin Rescue',
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

              return (
                     <div className="p-10 bg-blue-900 text-white font-bold text-2xl">
                            🚀 ÉXITO TOTAL <br />
                            Club creado: {club.name} <br />
                            Usuario creado: {email} <br />
                            Contraseña: {password} <br />
                            <br />
                            <a href="/login" className="underline text-yellow-300">IR AL LOGIN</a>
                     </div>
              )

       } catch (error: any) {
              return (
                     <div className="p-10 bg-red-900 text-white font-bold">
                            ❌ ERROR AL CREAR USUARIO: <br />
                            {error.message} <br />
                            <pre>{JSON.stringify(error, null, 2)}</pre>
                     </div>
              )
       }
}
