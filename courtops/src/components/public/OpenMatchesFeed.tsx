'use client'

import React, { useState } from 'react'
import { OpenMatch, joinOpenMatch } from '@/actions/open-matches'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Trophy, Calendar, Clock, Lock, ChevronRight, X, Loader2, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function OpenMatchesFeed({ matches }: { matches: OpenMatch[] }) {
       const [selectedMatch, setSelectedMatch] = useState<OpenMatch | null>(null)

       if (matches.length === 0) {
              return (
                     <div className="p-12 text-center bg-card/50 backdrop-blur-sm rounded-3xl border border-border dashed border-2 flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 animate-pulse">
                                   <Trophy className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-foreground font-black text-xl mb-2">No hay partidos abiertos</h3>
                            <p className="text-muted-foreground text-sm max-w-[250px]">Sé el primero en crear uno al reservar tu cancha y desafía a otros jugadores.</p>
                     </div>
              )
       }

       return (
              <>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matches.map(match => (
                                   <div key={match.id} className="group relative bg-card border border-border hover:border-primary/50 transition-all duration-300 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
                                          {/* Decorative Gradient Background */}
                                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                          {/* Header Section */}
                                          <div className="p-6 pb-4 relative z-10 flex justify-between items-start">
                                                 <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                                      {match.level || 'Nivel General'}
                                                               </span>
                                                               {match.gender && (
                                                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                                                                             {match.gender}
                                                                      </span>
                                                               )}
                                                        </div>
                                                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                               {match.courtName}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{match.surface || 'Sintético'}</p>
                                                 </div>
                                                 <div className="text-right bg-card/80 backdrop-blur rounded-xl p-2 border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                                                        <span className="block text-xl font-black text-foreground leading-none">${match.pricePerPlayer}</span>
                                                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">c/u</span>
                                                 </div>
                                          </div>

                                          {/* Time & Date Badge */}
                                          <div className="px-6 relative z-10">
                                                 <div className="flex items-center gap-4 py-4 border-y border-border/50 group-hover:border-primary/20 transition-colors">
                                                        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-2xl w-16 h-16 border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                               <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{format(match.startTime, 'MMM', { locale: es })}</span>
                                                               <span className="text-2xl font-black leading-none">{format(match.startTime, 'd')}</span>
                                                        </div>
                                                        <div>
                                                               <div className="flex items-center gap-2 text-base text-foreground font-black">
                                                                      <Clock className="w-4 h-4 text-primary" />
                                                                      {format(match.startTime, 'HH:mm')} hs
                                                               </div>
                                                               <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                                                                      <Calendar className="w-3 h-3" />
                                                                      Duración: 90 min
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Players Section */}
                                          <div className="p-6 relative z-10 flex-1 flex flex-col justify-end">
                                                 <div className="flex justify-between items-end mb-4">
                                                        <div>
                                                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Jugadores ({4 - match.missingPlayers}/4)</p>
                                                               <div className="flex -space-x-3">
                                                                      {/* Show actual player avatars/initials + placeholders */}
                                                                      {[...Array(4)].map((_, i) => {
                                                                             // Reconstruct visuals: First is implicitly Organizer if mapped
                                                                             // Logic adapted from previous:
                                                                             const playersList = match.players || []
                                                                             // Add placeholders to fill to 4
                                                                             // Player exists if i < (4 - match.missingPlayers)
                                                                             const hasPlayer = i < (4 - match.missingPlayers)
                                                                             const player = hasPlayer ? (playersList[i] || { name: 'Jugador' }) : null

                                                                             return (
                                                                                    <div
                                                                                           key={i}
                                                                                           className={cn(
                                                                                                  "w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold shadow-sm transition-all relative z-10 hover:scale-110 hover:z-20",
                                                                                                  hasPlayer
                                                                                                         ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                                                                                                         : "bg-muted text-muted-foreground/30 border-dashed"
                                                                                           )}
                                                                                           title={player?.name || 'Disponible'}
                                                                                    >
                                                                                           {hasPlayer ? <User size={12} /> : null}
                                                                                    </div>
                                                                             )
                                                                      })}
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               {match.missingPlayers > 0 ? (
                                                                      <span className="inline-block px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-500/20 animate-pulse">
                                                                             ¡Faltan {match.missingPlayers}!
                                                                      </span>
                                                               ) : (
                                                                      <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                                             Completo
                                                                      </span>
                                                               )}
                                                        </div>
                                                 </div>

                                                 <button
                                                        onClick={() => setSelectedMatch(match)}
                                                        disabled={match.missingPlayers === 0}
                                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group/btn"
                                                 >
                                                        {match.missingPlayers === 0 ? 'Partido Completo' : 'Unirse al Partido'}
                                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                 </button>
                                          </div>
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
                     toast.success('¡Te uniste al partido! Te esperamos.')
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
                                   <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]" onClick={onClose} />
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                          className="fixed inset-0 m-auto z-[70] w-full max-w-sm h-fit bg-card border border-border rounded-3xl p-6 shadow-2xl"
                                   >
                                          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                                                 <X size={20} />
                                          </button>

                                          <div className="mb-6">
                                                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                                        <Users size={24} />
                                                 </div>
                                                 <h2 className="text-xl font-black text-foreground mb-1">Unirse al Partido</h2>
                                                 <p className="text-muted-foreground text-sm font-medium">Completa tus datos para confirmar tu lugar.</p>
                                          </div>

                                          <div className="bg-muted/50 rounded-2xl p-5 mb-6 border border-border flex items-center justify-between">
                                                 <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Tu Parte</p>
                                                        <p className="text-3xl font-black text-primary">${match.pricePerPlayer}</p>
                                                 </div>
                                                 <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Horario</p>
                                                        <p className="text-foreground font-bold text-lg">{format(match.startTime, 'HH:mm')} hs</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{format(match.startTime, 'EEEE d', { locale: es })}</p>
                                                 </div>
                                          </div>

                                          <form onSubmit={handleSubmit} className="space-y-4">
                                                 <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre Completo</label>
                                                        <input
                                                               required
                                                               value={name}
                                                               onChange={e => setName(e.target.value)}
                                                               className="w-full bg-muted/30 border border-border rounded-xl p-3.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                                                               placeholder="Ej. Juan Pérez"
                                                        />
                                                 </div>
                                                 <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Teléfono</label>
                                                        <input
                                                               required
                                                               type="tel"
                                                               value={phone}
                                                               onChange={e => setPhone(e.target.value)}
                                                               className="w-full bg-muted/30 border border-border rounded-xl p-3.5 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                                                               placeholder="Ej. 11 1234 5678"
                                                        />
                                                 </div>

                                                 <button
                                                        disabled={loading}
                                                        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-xs tracking-widest rounded-xl mt-4 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
                                                 >
                                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Asistencia'}
                                                 </button>
                                          </form>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}
