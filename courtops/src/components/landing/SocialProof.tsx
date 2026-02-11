
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
              <section className="py-12 bg-black border-y border-white/5 overflow-hidden">
                     <div className="max-w-7xl mx-auto px-6 text-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                                   Confían en Nosotros
                            </p>

                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                   {CLUBS.map((club: any, i) => (
                                          <div key={i} className="flex items-center gap-2 text-zinc-400 font-bold text-xl select-none hover:text-white hover:scale-105 transition-transform cursor-default">
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
              </section>
       )
}
