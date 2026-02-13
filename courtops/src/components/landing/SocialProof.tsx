
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
                     // You can add subscriptionStatus filter here if needed, e.g.:
                     // subscriptionStatus: { not: 'CANCELLED' }
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
       ]

       return (
              <section className="py-12 bg-white dark:bg-black border-y border-slate-100 dark:border-white/5 overflow-hidden">
                     <div className="max-w-7xl mx-auto px-6 text-center">
                            <p className="text-slate-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                                   Confían en Nosotros
                            </p>

                            <div className="relative w-full max-w-5xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                                   <div className="flex gap-16 py-4 animate-infinite-scroll w-max hover:[animation-play-state:paused]">
                                          {[...CLUBS, ...CLUBS].map((club: any, i) => (
                                                 <div key={i} className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 font-bold text-xl select-none hover:text-slate-900 dark:hover:text-white transition-colors cursor-default grayscale hover:grayscale-0">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} alt={club.name} className="w-8 h-8 object-contain" />
                                                        ) : (
                                                               <span className="text-2xl">{club.logo || "🎾"}</span>
                                                        )}
                                                        {club.name}
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
