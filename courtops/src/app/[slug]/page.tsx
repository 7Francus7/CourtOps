import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import PublicBookingInterface from '@/components/public/PublicBookingInterface'
import { Metadata } from 'next'

type Props = {
       params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
       const { slug } = await params
       const club = await prisma.club.findUnique({
              where: { slug },
              select: { name: true }
       })

       return {
              title: `Reservar en ${club?.name || 'CourtOps'}`,
              description: `Sistema de reservas online de ${club?.name}. Encontrá tu cancha y jugá.`,
       }
}

export default async function PublicClubPage({ params }: Props) {
       const { slug } = await params

       // 1. Fetch Club by Slug
       const club = await prisma.club.findUnique({
              where: { slug: slug },
              include: {
                     courts: {
                            orderBy: { sortOrder: 'asc' }
                     },
                     priceRules: true
              }
       })

       // 2. Handle 404
       if (!club) {
              notFound()
       }

       // 3. Render Public Interface
       return (
              <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden font-sans selection:bg-primary selection:text-black">
                     {/* Background Ambient Effects */}
                     <div className="absolute inset-0 z-0">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                     </div>

                     <div className="relative z-10 w-full max-w-md h-[100dvh] md:h-auto md:min-h-[600px] md:max-h-[90vh] md:aspect-[9/19] md:rounded-[3rem] md:border-[8px] md:border-zinc-900 md:shadow-2xl overflow-hidden bg-black md:ring-1 md:ring-white/10 flex flex-col">
                            <PublicBookingInterface club={club} />
                     </div>
              </div>
       )
}
