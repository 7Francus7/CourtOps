
import React from 'react'
import prisma from "@/lib/db"

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
              take: 10,
              orderBy: {
                     createdAt: 'desc'
              }
       })

       // Fallback to manual list if no real clubs (for dev/demo purposes)
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
              <section className="py-12 bg-white dark:bg-[#020408] border-y border-slate-100 dark:border-white/5 overflow-hidden relative">
                     {/* Subtle Background Glow for cohesion */}
                     <div className="absolute inset-0 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] pointer-events-none mix-blend-screen" />

                     <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
                            <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-[0.25em] mb-10 opacity-80">
                                   La plataforma elegida por clubes modernos
                            </p>

                            <div className="relative flex overflow-x-hidden group">
                                   {/* Gradients to fade out edges (matching dark theme) */}
                                   <div className="absolute top-0 bottom-0 left-0 w-32 z-10 bg-gradient-to-r from-white dark:from-[#020408] to-transparent pointer-events-none" />
                                   <div className="absolute top-0 bottom-0 right-0 w-32 z-10 bg-gradient-to-l from-white dark:from-[#020408] to-transparent pointer-events-none" />

                                   <div className="py-4 animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-28">
                                          {/* First Loop */}
                                          {CLUBS.map((club: any, i) => (
                                                 <div key={`club-${i}`} className="inline-flex items-center gap-4 text-slate-400/80 dark:text-zinc-600 font-black text-xl md:text-2xl uppercase tracking-tighter opacity-60 hover:opacity-100 hover:text-slate-900 dark:hover:text-emerald-50 text-shadow-sm transition-all duration-300 cursor-default grayscale filter md:blur-[1px] hover:blur-none hover:grayscale-0 hover:scale-110">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-10 h-10 md:w-12 md:h-12 object-contain filter drop-shadow-md" />
                                                        ) : (
                                                               <span className="text-3xl md:text-4xl filter grayscale drop-shadow-lg">{club.logo || "🎾"}</span>
                                                        )}
                                                        <span>{club.name}</span>
                                                 </div>
                                          ))}

                                          {/* Second Loop (Duplicate for seamless scroll) */}
                                          {CLUBS.map((club: any, i) => (
                                                 <div key={`club-dup-${i}`} className="inline-flex items-center gap-4 text-slate-400/80 dark:text-zinc-600 font-black text-xl md:text-2xl uppercase tracking-tighter opacity-60 hover:opacity-100 hover:text-slate-900 dark:hover:text-emerald-50 text-shadow-sm transition-all duration-300 cursor-default grayscale filter md:blur-[1px] hover:blur-none hover:grayscale-0 hover:scale-110">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-10 h-10 md:w-12 md:h-12 object-contain filter drop-shadow-md" />
                                                        ) : (
                                                               <span className="text-3xl md:text-4xl filter grayscale drop-shadow-lg">{club.logo || "🎾"}</span>
                                                        )}
                                                        <span>{club.name}</span>
                                                 </div>
                                          ))}

                                          {/* Third Loop (To be safe on ultra-wide screens) */}
                                          {CLUBS.map((club: any, i) => (
                                                 <div key={`club-dup2-${i}`} className="inline-flex items-center gap-4 text-slate-400/80 dark:text-zinc-600 font-black text-xl md:text-2xl uppercase tracking-tighter opacity-60 hover:opacity-100 hover:text-slate-900 dark:hover:text-emerald-50 text-shadow-sm transition-all duration-300 cursor-default grayscale filter md:blur-[1px] hover:blur-none hover:grayscale-0 hover:scale-110">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-10 h-10 md:w-12 md:h-12 object-contain filter drop-shadow-md" />
                                                        ) : (
                                                               <span className="text-3xl md:text-4xl filter grayscale drop-shadow-lg">{club.logo || "🎾"}</span>
                                                        )}
                                                        <span>{club.name}</span>
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
