
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
              <section className="py-10 bg-white dark:bg-black border-y border-slate-100 dark:border-white/5 overflow-hidden">
                     <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                            <p className="text-slate-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                                   La plataforma elegida por clubes modernos
                            </p>

                            <div className="relative flex overflow-x-hidden group">
                                   {/* Gradients to fade out edges */}
                                   <div className="absolute top-0 bottom-0 left-0 w-24 z-10 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none" />
                                   <div className="absolute top-0 bottom-0 right-0 w-24 z-10 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none" />

                                   <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-24">
                                          {/* First Loop */}
                                          {CLUBS.map((club: any, i) => (
                                                 <div key={`club-${i}`} className="inline-flex items-center gap-3 text-slate-400 dark:text-zinc-500 font-black text-xl md:text-2xl uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                                                        ) : (
                                                               <span className="text-2xl md:text-3xl filter grayscale">{club.logo || "🎾"}</span>
                                                        )}
                                                        <span>{club.name}</span>
                                                 </div>
                                          ))}

                                          {/* Second Loop (Duplicate for seamless scroll) */}
                                          {CLUBS.map((club: any, i) => (
                                                 <div key={`club-dup-${i}`} className="inline-flex items-center gap-3 text-slate-400 dark:text-zinc-500 font-black text-xl md:text-2xl uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                                                        ) : (
                                                               <span className="text-2xl md:text-3xl filter grayscale">{club.logo || "🎾"}</span>
                                                        )}
                                                        <span>{club.name}</span>
                                                 </div>
                                          ))}

                                          {/* Third Loop (To be safe on ultra-wide screens) */}
                                          {CLUBS.map((club: any, i) => (
                                                 <div key={`club-dup2-${i}`} className="inline-flex items-center gap-3 text-slate-400 dark:text-zinc-500 font-black text-xl md:text-2xl uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                                                        ) : (
                                                               <span className="text-2xl md:text-3xl filter grayscale">{club.logo || "🎾"}</span>
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
