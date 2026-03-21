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
              <section className="py-16 bg-slate-50 dark:bg-white/[0.02] backdrop-blur-xl border-y border-slate-200 dark:border-white/[0.06] overflow-hidden transition-colors duration-500">
                     <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col items-center gap-10">

                                   {/* Stats cards */}
                                   <SocialProofMetrics />

                                   {/* Divider with label */}
                                   <div className="flex items-center gap-4 w-full max-w-xl">
                                          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
                                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] shadow-sm dark:shadow-none">
                                                 <ShieldCheck size={11} className="text-emerald-500" />
                                                 <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">Elegida por los mejores clubes</span>
                                          </div>
                                          <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
                                   </div>

                                   {/* Club badges marquee */}
                                   <div className="w-full overflow-hidden py-1">
                                          <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
                                                 {[...Array(3)].map((_, loop) => (
                                                        <React.Fragment key={loop}>
                                                               {CLUBS.map((club, i) => (
                                                                      <React.Fragment key={`${loop}-${i}`}>
                                                                             <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] shrink-0">
                                                                                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[9px] font-black shrink-0">
                                                                                           {club.name.slice(0, 2).toUpperCase()}
                                                                                    </div>
                                                                                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                                                                           {club.name}
                                                                                    </span>
                                                                             </div>
                                                                             <span className="text-slate-300 dark:text-zinc-700 text-[8px] shrink-0">●</span>
                                                                      </React.Fragment>
                                                               ))}
                                                        </React.Fragment>
                                                 ))}
                                          </div>
                                   </div>

                            </div>
                     </div>
              </section>
       )
}
