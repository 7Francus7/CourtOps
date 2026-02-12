'use client'

import { signOut } from 'next-auth/react'
import GodModeSearch from './GodModeSearch'

export default function GodModeHeader() {
       return (
              <div className="border-b border-amber-500/20 bg-black/80 p-4 sticky top-0 z-50 backdrop-blur-xl shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
                     <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                            <h1 className="text-xl font-black text-amber-500 tracking-tighter flex-shrink-0 flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black text-base shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                          Ω
                                   </div>
                                   GOD MODE
                                   <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest ml-2 hidden md:inline border-l border-white/10 pl-2">Omni Control v3.5</span>
                            </h1>

                            <div className="flex-1 flex justify-center max-w-xl mx-auto">
                                   <GodModeSearch />
                            </div>

                            <button
                                   onClick={() => signOut({ callbackUrl: '/login' })}
                                   className="text-[10px] uppercase font-black text-amber-500/50 hover:text-amber-500 hover:bg-amber-500/10 px-4 py-2 border border-amber-500/20 rounded-lg transition-all flex items-center gap-1 flex-shrink-0 tracking-widest"
                            >
                                   Desconectarse
                            </button>
                     </div>
              </div>
       )
}

