import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PlayerSplit {
       name: string
       amount: number
       isPaid: boolean
       paymentMethod?: string | null
}

interface Props {
       totalAmount: number
       players: PlayerSplit[]
       setPlayers: (players: PlayerSplit[]) => void
       onSave: () => Promise<void>
       loading: boolean
}

export function PlayersTab({ totalAmount, players, setPlayers, onSave, loading }: Props) {
       const [playerCount, setPlayerCount] = useState(4)
       const [localPlayers, setLocalPlayers] = useState<PlayerSplit[]>(players)

       // Sync local state when props change (initial load)
       useEffect(() => {
              if (players.length > 0) {
                     setLocalPlayers(players)
                     setPlayerCount(players.length)
              } else {
                     // Init default
                     handleAutoSplit(4)
              }
       }, [players.length]) // Only on length change or heavy refresh

       const handleAutoSplit = (count: number) => {
              setPlayerCount(count)
              const perPlayer = Math.ceil(totalAmount / count)

              // Preserve existing names if possible
              const newPlayers = Array.from({ length: count }).map((_, i) => ({
                     name: localPlayers[i]?.name || (i === 0 ? 'Titular' : `Jugador ${i + 1}`),
                     amount: perPlayer,
                     isPaid: localPlayers[i]?.isPaid || false,
                     paymentMethod: localPlayers[i]?.paymentMethod
              }))

              setLocalPlayers(newPlayers)
              setPlayers(newPlayers)
       }

       const updatePlayer = (index: number, updates: Partial<PlayerSplit>) => {
              const newPlayers = [...localPlayers]
              newPlayers[index] = { ...newPlayers[index], ...updates }
              setLocalPlayers(newPlayers)
              setPlayers(newPlayers)
       }

       const togglePaid = (index: number) => {
              const p = localPlayers[index]
              updatePlayer(index, {
                     isPaid: !p.isPaid,
                     paymentMethod: !p.isPaid ? 'CASH' : null // Default to cash on quick toggle
              })
       }

       return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">

                     {/* LEFT: Controls */}
                     <div className="space-y-6">
                            <div className="bg-gradient-to-br from-[#1A1D21] to-[#111418] border border-white/5 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden group">
                                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent opacity-50" />

                                   <h3 className="text-sm font-black text-brand-blue uppercase mb-6 tracking-[0.2em]">Configurar División</h3>

                                   <div className="flex items-center justify-center gap-6 mb-8">
                                          <button
                                                 onClick={() => handleAutoSplit(Math.max(1, playerCount - 1))}
                                                 className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-2xl font-bold transition-all active:scale-95 border border-white/5"
                                          >
                                                 -
                                          </button>
                                          <div className="flex flex-col">
                                                 <span className="text-5xl font-black text-white leading-none font-variant-numeric tabular-nums">{playerCount}</span>
                                                 <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-2">Jugadores</span>
                                          </div>
                                          <button
                                                 onClick={() => handleAutoSplit(playerCount + 1)}
                                                 className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-2xl font-bold transition-all active:scale-95 border border-white/5"
                                          >
                                                 +
                                          </button>
                                   </div>

                                   <div className="text-base text-white/40 mb-6 font-medium bg-black/20 py-3 rounded-xl mx-auto max-w-[200px] border border-white/5">
                                          <span className="text-xs uppercase font-bold mr-2 opacity-50">Sugerido:</span>
                                          <span className="text-white font-black text-lg">${Math.ceil(totalAmount / playerCount)}</span>
                                   </div>

                                   <button
                                          onClick={() => handleAutoSplit(playerCount)}
                                          className="w-full bg-brand-blue text-white font-black py-4 rounded-xl shadow-xl shadow-brand-blue/20 hover:bg-brand-blue-variant transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                   >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                                          Aplicar Reset
                                   </button>
                            </div>
                     </div>

                     {/* RIGHT: Player List */}
                     <div className="flex flex-col h-full bg-[#1A1D21]/50 border border-white/5 rounded-3xl overflow-hidden relative">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                   <h3 className="text-xs font-black text-white/50 uppercase tracking-widest">Detalle por Jugador</h3>
                                   <button
                                          onClick={onSave}
                                          disabled={loading}
                                          className="text-brand-green text-xs font-black uppercase hover:underline flex items-center gap-1"
                                   >
                                          {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                                   </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                   {localPlayers.map((p, i) => (
                                          <div key={i} className={cn(
                                                 "group p-4 rounded-2xl border transition-all relative overflow-hidden",
                                                 p.isPaid
                                                        ? "bg-brand-green/5 border-brand-green/20"
                                                        : "bg-white/5 border-white/5 hover:bg-white/[0.07]"
                                          )}>
                                                 {/* Status indicator stripe */}
                                                 <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                                                        p.isPaid ? "bg-brand-green" : "bg-white/10 group-hover:bg-brand-blue"
                                                 )} />

                                                 <div className="flex flex-col sm:flex-row gap-4 items-center pl-3">
                                                        {/* Name Input */}
                                                        <div className="flex flex-col flex-1 w-full">
                                                               <label className="text-[9px] font-bold text-white/20 uppercase mb-1 ml-1">Nombre</label>
                                                               <input
                                                                      value={p.name}
                                                                      onChange={(e) => updatePlayer(i, { name: e.target.value })}
                                                                      className="bg-transparent text-white font-bold text-lg outline-none placeholder:text-white/10 w-full"
                                                                      placeholder={`Jugador ${i + 1}`}
                                                               />
                                                        </div>

                                                        {/* Amount Input */}
                                                        <div className="flex flex-col w-24">
                                                               <label className="text-[9px] font-bold text-white/20 uppercase mb-1 ml-1">Monto</label>
                                                               <div className="flex items-center">
                                                                      <span className="text-white/30 text-sm font-bold mr-1">$</span>
                                                                      <input
                                                                             type="number"
                                                                             value={p.amount}
                                                                             onChange={(e) => updatePlayer(i, { amount: Number(e.target.value) })}
                                                                             className="bg-transparent text-white font-mono font-bold text-lg outline-none w-full appearance-none"
                                                                      />
                                                               </div>
                                                        </div>

                                                        {/* Pay Action */}
                                                        <div>
                                                               <button
                                                                      onClick={() => togglePaid(i)}
                                                                      className={cn(
                                                                             "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all min-w-[90px] flex items-center justify-center gap-2",
                                                                             p.isPaid
                                                                                    ? "bg-brand-green text-bg-dark shadow-lg shadow-brand-green/20 hover:bg-brand-green-variant"
                                                                                    : "bg-white/10 text-white/50 hover:bg-brand-blue hover:text-white hover:shadow-lg hover:shadow-brand-blue/20"
                                                                      )}
                                                               >
                                                                      {p.isPaid ? (
                                                                             <>
                                                                                    ✓ Pagado
                                                                             </>
                                                                      ) : (
                                                                             'Cobrar'
                                                                      )}
                                                               </button>
                                                        </div>
                                                 </div>
                                          </div>
                                   ))}
                            </div>
                     </div>
              </div>
       )
}
