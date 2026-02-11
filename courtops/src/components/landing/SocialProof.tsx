
'use client'

import React from 'react'

export default function SocialProof() {
       const CLUBS = [
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
                                   +50 Clubes Confían en Nosotros
                            </p>

                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                   {CLUBS.map((club, i) => (
                                          <div key={i} className="flex items-center gap-2 text-zinc-400 font-bold text-xl select-none hover:text-white hover:scale-105 transition-transform cursor-default">
                                                 <span className="text-2xl">{club.logo}</span>
                                                 {club.name}
                                          </div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
