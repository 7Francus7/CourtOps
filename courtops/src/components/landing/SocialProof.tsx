import React from 'react'
import prisma from "@/lib/db"
import { ShieldCheck, Zap, Star, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

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
              <section className="py-16 bg-white dark:bg-[#02040A] border-y border-slate-200 dark:border-white/5 overflow-hidden relative transition-colors duration-1000">
                     <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                                   {/* Branding Trust */}
                                   <div className="flex flex-col gap-4 max-w-sm text-center md:text-left">
                                          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/5 dark:bg-white/5 border border-slate-950/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] w-fit mx-auto md:mx-0">
                                                 <ShieldCheck size={14} fill="currentColor" className="opacity-20" />
                                                 Red de Elite
                                          </div>
                                          <h3 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic leading-none">
                                                 Impulsando <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600">Complejos Líderes.</span>
                                          </h3>
                                   </div>

                                   {/* Marquee Container */}
                                   <div className="flex-1 relative overflow-hidden group py-10">
                                          {/* Cinematic Shadow Fades */}
                                          <div className="absolute top-0 bottom-0 left-0 w-40 z-10 bg-gradient-to-r from-white dark:from-[#02040A] to-transparent pointer-events-none" />
                                          <div className="absolute top-0 bottom-0 right-0 w-40 z-10 bg-gradient-to-l from-white dark:from-[#02040A] to-transparent pointer-events-none" />

                                          <div className="animate-marquee whitespace-nowrap flex items-center gap-24">
                                                 {[...Array(3)].map((_, loopIdx) => (
                                                        <React.Fragment key={loopIdx}>
                                                               {CLUBS.map((club: any, i) => (
                                                                      <div
                                                                             key={`${loopIdx}-${i}`}
                                                                             className="inline-flex items-center gap-6 group/item transition-all duration-700 cursor-default"
                                                                      >
                                                                             <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-3 grayscale opacity-40 group-hover/item:grayscale-0 group-hover/item:opacity-100 group-hover/item:border-emerald-500/50 group-hover/item:scale-110 group-hover/item:shadow-2xl transition-all duration-500">
                                                                                    {club.logoUrl ? (
                                                                                           <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain" />
                                                                                    ) : (
                                                                                           <span className="text-3xl filter drop-shadow-xl">{club.logo || "🎾"}</span>
                                                                                    )}
                                                                             </div>
                                                                             <span className="text-xl font-black text-slate-200 dark:text-zinc-800 group-hover/item:text-slate-950 dark:group-hover/item:text-white transition-colors uppercase tracking-tight italic">
                                                                                    {club.name}
                                                                             </span>
                                                                      </div>
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
