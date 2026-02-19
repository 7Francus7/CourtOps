
'use client'

import { useState, useEffect } from 'react'
import { searchGodMode } from '@/actions/super-admin'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GodModeSearch() {
       const [query, setQuery] = useState('')
       const [results, setResults] = useState<any>(null)
       const [isOpen, setIsOpen] = useState(false)
       const router = useRouter()

       useEffect(() => {
              const timer = setTimeout(async () => {
                     if (query.length >= 3) {
                            const res = await searchGodMode(query)
                            if (res.success) {
                                   setResults(res.results)
                                   setIsOpen(true)
                            }
                     } else {
                            setResults(null)
                            setIsOpen(false)
                     }
              }, 500)

              return () => clearTimeout(timer)
       }, [query])

       return (
              <div className="relative w-full max-w-md">
                     <div className="relative group">
                            <input
                                   type="text"
                                   placeholder="Buscar club, usuario o email..."
                                   className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-emerald-500/10 placeholder-slate-400 dark:placeholder-zinc-500 transition-all shadow-sm"
                                   value={query}
                                   onChange={(e) => setQuery(e.target.value)}
                                   onFocus={() => query.length >= 3 && setIsOpen(true)}
                                   onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                            />
                            <svg
                                   className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-zinc-500 group-focus-within:text-emerald-500 transition-colors"
                                   fill="none"
                                   stroke="currentColor"
                                   viewBox="0 0 24 24"
                            >
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {query.length > 0 && query.length < 3 && (
                                   <div className="absolute right-3 top-3.5 text-[8px] font-black uppercase text-slate-300 dark:text-zinc-600 tracking-tighter">
                                          Min 3
                                   </div>
                            )}
                     </div>

                     {isOpen && results && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                                   {results.clubs.length > 0 && (
                                          <div className="p-2">
                                                 <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase px-3 py-2 tracking-widest">Clubes Asociados</h4>
                                                 {results.clubs.map((club: any) => (
                                                        <div key={club.id} className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer group transition-colors">
                                                               <div className="flex justify-between items-center">
                                                                      <div>
                                                                             <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{club.name}</div>
                                                                             <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">/{club.slug}</div>
                                                                      </div>
                                                                      <div className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-zinc-400 font-mono">
                                                                             #{club.id.substring(0, 5)}
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}

                                   {results.users.length > 0 && (
                                          <div className="p-2">
                                                 <h4 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase px-3 py-2 tracking-widest">Personal de Staff</h4>
                                                 {results.users.map((user: any) => (
                                                        <div key={user.id} className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer group transition-colors">
                                                               <div className="flex justify-between items-center">
                                                                      <div>
                                                                             <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">{user.email}</div>
                                                                             <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tighter">{user.name} • <span className="text-emerald-500">{user.role}</span></div>
                                                                      </div>
                                                                      {user.club && (
                                                                             <div className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase text-right max-w-[80px] truncate">
                                                                                    {user.club.name}
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}

                                   {results.clubs.length === 0 && results.users.length === 0 && (
                                          <div className="p-6 text-center">
                                                 <div className="text-xs font-bold text-slate-400 dark:text-zinc-500">No se encontraron resultados para "{query}"</div>
                                          </div>
                                   )}
                            </div>
                     )}
              </div>
       )
}
