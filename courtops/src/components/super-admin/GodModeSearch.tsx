
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
                     <div className="relative">
                            <input
                                   type="text"
                                   placeholder="Buscar club, usuario, email..."
                                   className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-green/50 placeholder-zinc-500"
                                   value={query}
                                   onChange={(e) => setQuery(e.target.value)}
                                   onFocus={() => query.length >= 3 && setIsOpen(true)}
                                   onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                            />
                            <svg
                                   className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500"
                                   fill="none"
                                   stroke="currentColor"
                                   viewBox="0 0 24 24"
                            >
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                     </div>

                     {isOpen && results && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5">
                                   {results.clubs.length > 0 && (
                                          <div className="p-2">
                                                 <h4 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-1">Clubes</h4>
                                                 {results.clubs.map((club: any) => (
                                                        <div key={club.id} className="px-2 py-2 hover:bg-white/5 rounded cursor-pointer group">
                                                               <div className="flex justify-between items-center">
                                                                      <div>
                                                                             <div className="font-bold text-sm text-white group-hover:text-brand-green">{club.name}</div>
                                                                             <div className="text-xs text-zinc-500">/{club.slug}</div>
                                                                      </div>
                                                                      <div className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                                                                             ID: {club.id.substring(0, 5)}...
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}

                                   {results.users.length > 0 && (
                                          <div className="p-2">
                                                 <h4 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-1">Usuarios</h4>
                                                 {results.users.map((user: any) => (
                                                        <div key={user.id} className="px-2 py-2 hover:bg-white/5 rounded cursor-pointer group">
                                                               <div className="flex justify-between items-center">
                                                                      <div>
                                                                             <div className="font-bold text-sm text-white group-hover:text-brand-blue">{user.email}</div>
                                                                             <div className="text-xs text-zinc-500">{user.name} • {user.role}</div>
                                                                      </div>
                                                                      {user.club && (
                                                                             <div className="text-[10px] text-zinc-600 text-right">
                                                                                    {user.club.name}
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}

                                   {results.clubs.length === 0 && results.users.length === 0 && (
                                          <div className="p-4 text-center text-sm text-zinc-500">
                                                 No se encontraron resultados.
                                          </div>
                                   )}
                            </div>
                     )}
              </div>
       )
}
