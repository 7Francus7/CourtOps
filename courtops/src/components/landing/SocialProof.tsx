import React from 'react'
import prisma from "@/lib/db"
import { ShieldCheck } from 'lucide-react'

export default async function SocialProof() {
       // Fetch real clubs
       const realClubs = await prisma.club.findMany({
              select: { name: true, logoUrl: true },
              where: { deletedAt: null },
              take: 10,
              orderBy: { createdAt: 'desc' }
       })

       const CLUBS = realClubs.length > 0 ? realClubs : [
              { name: "Padel Center", logoUrl: null },
              { name: "Club La Red", logoUrl: null },
              { name: "Top Court", logoUrl: null },
              { name: "Smash Padel", logoUrl: null },
              { name: "Ace Club", logoUrl: null },
              { name: "Volea Pro", logoUrl: null },
       ] as { name: string, logoUrl: string | null }[]

       return (
              <section className="py-12 bg-white dark:bg-[#050505] border-y border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-700">
                     <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col items-center gap-8">
                                   <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600">
                                          <ShieldCheck size={14} />
                                          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Plataforma elegida por complejos líderes</span>
                                   </div>

                                   <div className="w-full relative">
                                          {/* Fade edges */}
                                          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10" />
                                          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10" />

                                          <div className="flex items-center justify-center gap-16 md:gap-24 opacity-30 grayscale hover:opacity-100 dark:hover:opacity-60 transition-all duration-500 overflow-hidden">
                                                 <div className="flex items-center gap-16 md:gap-24 animate-marquee whitespace-nowrap">
                                                        {[...Array(2)].map((_, loop) => (
                                                               <React.Fragment key={loop}>
                                                                      {CLUBS.map((club, i) => (
                                                                             <div key={`${loop}-${i}`} className="flex items-center gap-3">
                                                                                    {club.logoUrl ? (
                                                                                           <img src={club.logoUrl} alt={club.name} className="h-8 w-auto object-contain" />
                                                                                    ) : (
                                                                                           <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                                                                                                  {club.name.charAt(0)}
                                                                                           </div>
                                                                                    )}
                                                                                    <span className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white uppercase italic opacity-80">{club.name}</span>
                                                                             </div>
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
