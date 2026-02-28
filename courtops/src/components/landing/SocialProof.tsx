
import React from 'react'
import prisma from "@/lib/db"
import { ShieldCheck, Zap, Star } from 'lucide-react'

export default async function SocialProof() {
       // Fetch real clubs from DB
       const realClubs = await prisma.club.findMany({
              select: {
                     name: true,
                     logoUrl: true
              },
              where: {
                     deletedAt: null
              },
              take: 12,
              orderBy: {
                     createdAt: 'desc'
              }
       })

       // Fallback to manual list if no real clubs
       const CLUBS = realClubs.length > 0 ? realClubs : [
              { name: "Padel Center", logo: "🏆" },
              { name: "Club La Red", logo: "🎾" },
              { name: "Top Court", logo: "⚡" },
              { name: "Smash Padel", logo: "🔥" },
              { name: "Ace Club", logo: "💎" },
              { name: "Volea Pro", logo: "🚀" },
              { name: "Set Point", logo: "🎯" },
       ]

       return (
              <section className="py-12 bg-white dark:bg-black border-y border-slate-200 dark:border-white/5 overflow-hidden relative">
                     {/* Background Elements */}
                     <div className="absolute inset-0 bg-emerald-500/[0.005] pointer-events-none" />

                     <div className="max-w-7xl mx-auto px-4 relative z-10">
                            <div className="flex flex-col items-center mb-10 space-y-3">
                                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 shadow-lg">
                                          <ShieldCheck size={10} className="text-emerald-500" />
                                          PLATAFORMA VERIFICADA
                                   </div>
                                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-600">
                                          Iimpulsando los complejos más importantes
                                   </p>
                            </div>

                            <div className="relative flex overflow-x-hidden group">
                                   {/* Cinematic Gradients */}
                                   <div className="absolute top-0 bottom-0 left-0 w-32 z-10 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none" />
                                   <div className="absolute top-0 bottom-0 right-0 w-32 z-10 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none" />

                                   <div className="py-6 animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-24">
                                          {[...Array(3)].map((_, loopIdx) => (
                                                 <React.Fragment key={loopIdx}>
                                                        {CLUBS.map((club: any, i) => (
                                                               <div
                                                                      key={`${loopIdx}-${i}`}
                                                                      className="inline-flex items-center gap-4 group/item transition-all duration-700 cursor-default"
                                                               >
                                                                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center p-2.5 grayscale group-hover/item:grayscale-0 group-hover/item:border-emerald-500/50 group-hover/item:scale-105 transition-all">
                                                                             {club.logoUrl ? (
                                                                                    <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain" />
                                                                             ) : (
                                                                                    <span className="text-2xl filter drop-shadow-lg">{club.logo || "🎾"}</span>
                                                                             )}
                                                                      </div>
                                                                      <div className="flex flex-col">
                                                                             <span className="text-lg font-black text-slate-300 dark:text-zinc-700 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors uppercase tracking-tighter italic">
                                                                                    {club.name}
                                                                             </span>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </React.Fragment>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
