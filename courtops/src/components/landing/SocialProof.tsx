import React from 'react'
import prisma from "@/lib/db"
import { ShieldCheck } from 'lucide-react'
import SocialProofMetrics from './SocialProofMetrics'

export default async function SocialProof() {
       // Fetch real clubs
       const realClubs = await prisma.club.findMany({
              select: { name: true },
              where: { deletedAt: null },
              take: 10,
              orderBy: { createdAt: 'desc' }
       })

       const CLUBS = realClubs.length > 0 ? realClubs : [
              { name: "Padel Center" },
              { name: "Club La Red" },
              { name: "Top Court" },
              { name: "Smash Padel" },
              { name: "Ace Club" },
              { name: "Volea Pro" },
       ]

       return (
              <section className="py-12 bg-white dark:bg-zinc-950 border-y border-zinc-100 dark:border-white/5 overflow-hidden transition-colors duration-700">
                     <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col items-center gap-8">
                                   {/* Animated Counter Stats */}
                                   <SocialProofMetrics />

                                   <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600">
                                          <ShieldCheck size={14} />
                                          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Plataforma elegida por complejos líderes</span>
                                   </div>

                                   <div className="w-full relative">
                                          {/* Fade edges */}
                                          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10" />
                                          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10" />

                                          <div className="flex items-center justify-center gap-16 md:gap-24 opacity-30 grayscale hover:opacity-100 dark:hover:opacity-60 transition-all duration-500 overflow-hidden">
                                                 <div className="flex items-center gap-16 md:gap-24 animate-marquee whitespace-nowrap">
                                                        {[...Array(2)].map((_, loop) => (
                                                               <React.Fragment key={loop}>
                                                                      {CLUBS.map((club, i) => (
                                                                             <span key={`${loop}-${i}`} className="text-lg font-bold tracking-tighter text-zinc-900 dark:text-white uppercase italic opacity-80">{club.name}</span>
                                                                      ))}
                                                               </React.Fragment>
                                                        ))}
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
