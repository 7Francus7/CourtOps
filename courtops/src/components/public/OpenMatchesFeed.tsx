'use client'

import React, { useState } from 'react'
import { OpenMatch, joinOpenMatch } from '@/actions/open-matches'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Trophy, Calendar, Clock, Lock, ChevronRight, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function OpenMatchesFeed({ matches }: { matches: OpenMatch[] }) {
       const [selectedMatch, setSelectedMatch] = useState<OpenMatch | null>(null)

       if (matches.length === 0) {
              return (
                     <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                   <Trophy className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-white/80 font-bold mb-1">No hay partidos abiertos</h3>
                            <p className="text-xs text-white/40 max-w-[200px] mx-auto">Sé el primero en crear uno al reservar tu cancha.</p>
                     </div>
              )
       }

       return (
              <>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {matches.map(match => (
                                   <div key={match.id} className="group relative bg-[#18181b] border border-white/10 hover:border-primary/50 transition-all rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] flex flex-col">
                                          {/* Header */}
                                          <div className="p-4 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
                                                 <div>
                                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                               {match.level || 'Nivel General'}
                                                               {match.gender && <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-white/70 tracking-wide">{match.gender}</span>}
                                                        </h3>
                                                        <p className="text-xs text-white/40 mt-1 font-medium">{match.courtName} • {match.surface || 'Sintético'}</p>
                                                 </div>
                                                 <div className="text-right">
                                                        <span className="block text-lg font-black text-green-500">${match.pricePerPlayer}</span>
                                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">por jugador</span>
                                                 </div>
                                          </div>

                                          {/* Content */}
                                          <div className="p-4 flex-1">
                                                 <div className="flex items-center gap-4 mb-4">
                                                        <div className="flex flex-col items-center justify-center bg-green-500/10 rounded-xl w-14 h-14 border border-green-500/20">
                                                               <span className="text-[10px] font-bold text-green-500 uppercase">{format(match.startTime, 'MMM', { locale: es })}</span>
                                                               <span className="text-2xl font-black text-white">{format(match.startTime, 'd')}</span>
                                                        </div>
                                                        <div>
                                                               <div className="flex items-center gap-2 text-sm text-white/90 font-bold">
                                                                      <Clock className="w-4 h-4 text-green-500" />
                                                                      {format(match.startTime, 'HH:mm')} hs
                                                               </div>
                                                               <div className="flex items-center gap-2 text-xs text-white/50 mt-1 font-medium">
                                                                      <Calendar className="w-3 h-3" />
                                                                      90 minutos
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Players */}
                                                 <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Jugadores</p>
                                                               <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{match.missingPlayers} lugares libres</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                               {/* Always show 4 slots */}
                                                               {[...Array(4)].map((_, i) => {
                                                                      // Assuming player 0 is organizer if players array is empty? 
                                                                      // Wait, logic in getOpenMatches: `players` comes from BookingPlayer. Creator is not in `players` usually but I mapped it.
                                                                      // Actually my `getOpenMatches` sends `players: {name}`.
                                                                      // But I didn't verify if I include the creator.
                                                                      // Let's assume the mapped array includes everyone OR I need to fix `getOpenMatches` to include creator.
                                                                      // Step 115: `matches.players` map `BookingPlayer`.
                                                                      // `BookingPlayer` does NOT include creator currently in my schema logic (creator is `client`).
                                                                      // So I should show Creator + Players.

                                                                      const totalPlayers = [{ name: 'Organizador' }, ...match.players]
                                                                      const player = totalPlayers[i]

                                                                      return (
                                                                             <div key={i} className={`flex-1 h-2 rounded-full transition-all 
                                    ${player ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-white/10'}
                                `}
                                                                                    title={player?.name || 'Libre'}
                                                                             />
                                                                      )
                                                               })}
                                                        </div>
                                                        <p className="text-xs text-white/40 truncate">
                                                               {match.players.length === 0 ? 'Be the first challenger!' : `Vs ${match.players.map(p => p.name).join(', ')}`}
                                                        </p>
                                                 </div>
                                          </div>

                                          {/* Footer */}
                                          <button
                                                 onClick={() => setSelectedMatch(match)}
                                                 className="w-full py-4 bg-white/5 hover:bg-green-500 hover:text-[#09090b] text-white/60 font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 mt-2"
                                          >
                                                 Unirse al Partido <ChevronRight size={14} />
                                          </button>
                                   </div>
                            ))}
                     </div>

                     <JoinMatchModal
                            isOpen={!!selectedMatch}
                            onClose={() => setSelectedMatch(null)}
                            match={selectedMatch}
                     />
              </>
       )
}

function JoinMatchModal({ isOpen, onClose, match }: { isOpen: boolean, onClose: () => void, match: OpenMatch | null }) {
       const [name, setName] = useState('')
       const [phone, setPhone] = useState('')
       const [loading, setLoading] = useState(false)

       if (!match) return null

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              try {
                     await joinOpenMatch(match.id, name, phone)
                     toast.success('¡Te uniste al partido!')
                     onClose()
                     setName('')
                     setPhone('')
              } catch (error: any) {
                     toast.error(error.message)
              } finally {
                     setLoading(false)
              }
       }

       return (
              <AnimatePresence>
                     {isOpen && (
                            <>
                                   <motion.div
                                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                          onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                                   />
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                          className="fixed inset-0 m-auto z-[70] w-full max-w-sm h-fit bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-2xl"
                                   >
                                          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={20} /></button>

                                          <div className="mb-6">
                                                 <h2 className="text-xl font-bold text-white mb-1">Unirse al Partido</h2>
                                                 <p className="text-white/50 text-sm">Completa tus datos para reservar tu lugar.</p>
                                          </div>

                                          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5 flex items-center justify-between">
                                                 <div>
                                                        <p className="text-xs text-white/40 uppercase font-bold mb-1">Costo</p>
                                                        <p className="text-2xl font-black text-green-500">${match.pricePerPlayer}</p>
                                                 </div>
                                                 <div className="text-right">
                                                        <p className="text-xs text-white/40 uppercase font-bold mb-1">Horario</p>
                                                        <p className="text-white font-bold">{format(match.startTime, 'HH:mm')} hs</p>
                                                 </div>
                                          </div>

                                          <form onSubmit={handleSubmit} className="space-y-4">
                                                 <div>
                                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">Nombre</label>
                                                        <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 transition-colors" placeholder="Tu nombre" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">Teléfono</label>
                                                        <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500 transition-colors" placeholder="Tu celular" />
                                                 </div>

                                                 <button disabled={loading} className="w-full py-4 bg-green-500 text-[#09090b] font-bold rounded-xl mt-2 flex items-center justify-center gap-2 hover:bg-green-400 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        Confirmar Asistencia
                                                 </button>
                                          </form>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}
