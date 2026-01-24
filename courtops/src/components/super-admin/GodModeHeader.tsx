'use client'

import { signOut } from 'next-auth/react'
import GodModeSearch from './GodModeSearch'

export default function GodModeHeader() {
       return (
              <div className="border-b border-red-900/30 bg-red-900/10 p-4 sticky top-0 z-50 backdrop-blur-md">
                     <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                            <h1 className="text-xl font-bold text-red-500 tracking-wider flex-shrink-0">
                                   ⚡ GOD MODE
                                   <span className="text-white/40 text-sm font-normal ml-2 hidden md:inline">Panel Global</span>
                            </h1>

                            <div className="flex-1 flex justify-center max-w-xl mx-auto">
                                   <GodModeSearch />
                            </div>

                            <button
                                   onClick={() => signOut({ callbackUrl: '/login' })}
                                   className="text-xs text-white/50 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                                   ← Salir
                            </button>
                     </div>
              </div>
       )
}

