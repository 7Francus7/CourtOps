'use client'

import { signOut } from 'next-auth/react'
import GodModeSearch from './GodModeSearch'

export default function GodModeHeader() {
       return (
              <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 py-3">
                     <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 shrink-0">
                                   <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                                          Ω
                                   </div>
                                   <div className="flex flex-col">
                                          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                                 GOD<span className="text-emerald-600 dark:text-emerald-500">MODE</span>
                                          </span>
                                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-zinc-500">Omni Control v3.8</span>
                                   </div>
                            </div>

                            <div className="flex-1 flex justify-center max-w-xl mx-auto">
                                   <GodModeSearch />
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                   <button
                                          onClick={() => signOut({ callbackUrl: '/login' })}
                                          className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                                   >
                                          Cerrar Sesión
                                   </button>
                                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                                          AD
                                   </div>
                            </div>
                     </div>
              </header>
       )
}

