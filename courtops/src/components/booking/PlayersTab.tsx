'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Plus, Minus, RefreshCw, Save, ShoppingCart } from 'lucide-react'

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
       baseBookingPrice?: number
       kioskItems?: any[]
}

export function PlayersTab({
       totalAmount,
       players = [],
       setPlayers,
       onSave,
       loading,
       baseBookingPrice = 0,
       kioskItems = []
}: Props) {
       const [localPlayerCount, setLocalPlayerCount] = useState(players.length || 4)

       // Calculate individual totals
       // 1. Split the base price (court)
       const basePricePerPlayer = Math.ceil(baseBookingPrice / localPlayerCount)

       // 2. Map items to players
       const getExtrasForPlayer = (playerName: string) => {
              return kioskItems.filter(item => item.playerName === playerName)
       }

       const getExtrasTotalForPlayer = (playerName: string) => {
              return getExtrasForPlayer(playerName).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
       }

       // Handle count changes / Auto-reset
       const handleReset = (countOverwrite?: number) => {
              const newCount = countOverwrite || localPlayerCount
              const perPlayerBase = Math.ceil(baseBookingPrice / newCount)

              const newPlayers = Array.from({ length: newCount }).map((_, i) => {
                     const pName = players[i]?.name || (i === 0 ? 'Titular' : `Jugador ${i + 1}`)
                     const extras = getExtrasTotalForPlayer(pName)
                     return {
                            name: pName,
                            amount: perPlayerBase + extras,
                            isPaid: false,
                            paymentMethod: null
                     }
              })
              setPlayers(newPlayers)
       }

       // Effect to initialize or update if counts mismatch
       useEffect(() => {
              if (players.length === 0) {
                     handleReset(4)
              }
       }, [])

       const totalPaidAmount = players.reduce((sum, p) => p.isPaid ? sum + p.amount : sum, 0)
       const progressPercent = Math.min((totalPaidAmount / totalAmount) * 100, 100)

       const updatePlayerStatus = (index: number, isPaid: boolean) => {
              const newPlayers = [...players]
              newPlayers[index] = { ...newPlayers[index], isPaid, paymentMethod: isPaid ? 'CASH' : null }
              setPlayers(newPlayers)
       }

       return (
              <div className="flex flex-col gap-6 p-6 bg-[#121214]">

                     {/* PROGRESS BAR */}
                     <div>
                            <div className="flex justify-between items-end mb-2">
                                   <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Progreso de cobro</span>
                                   <span className="text-xs font-bold text-white">${totalPaidAmount.toLocaleString()} <span className="text-zinc-500">/ ${totalAmount.toLocaleString()}</span></span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                   <div
                                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full transition-all duration-500"
                                          style={{ width: `${progressPercent}%` }}
                                   ></div>
                            </div>
                     </div>

                     {/* CONFIGURATION CARD */}
                     <div className="bg-[#18181B] border border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">Configurar División</h3>

                            <div className="flex items-center justify-center gap-8 mb-8">
                                   <button
                                          onClick={() => setLocalPlayerCount(Math.max(1, localPlayerCount - 1))}
                                          className="w-12 h-12 rounded-full bg-black border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors group"
                                   >
                                          <Minus className="text-zinc-400 group-hover:text-white" />
                                   </button>
                                   <div className="text-center">
                                          <span className="text-6xl font-bold italic text-white drop-shadow-sm">{localPlayerCount}</span>
                                          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">Jugadores</p>
                                   </div>
                                   <button
                                          onClick={() => setLocalPlayerCount(localPlayerCount + 1)}
                                          className="w-12 h-12 rounded-full bg-black border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors group"
                                   >
                                          <Plus className="text-zinc-400 group-hover:text-white" />
                                   </button>
                            </div>

                            <div className="bg-black rounded-lg p-5 text-center mb-6 relative overflow-hidden group">
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-blue-500/10 blur-xl rounded-full pointer-events-none"></div>
                                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider relative z-10">Cancha Sugerido</p>
                                   <div className="text-4xl font-bold text-white italic tracking-wide mt-1 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                          ${basePricePerPlayer.toLocaleString()}
                                   </div>
                            </div>

                            <button
                                   onClick={() => handleReset()}
                                   className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                   <RefreshCw className="w-5 h-5 animate-spin-slow" />
                                   RECALCULAR TODO
                            </button>
                     </div>

                     {/* PLAYERS LIST & SAVE */}
                     <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                   <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Detalle por Jugador</h3>
                                   <button
                                          onClick={async () => {
                                                 const res = await onSave();
                                          }}
                                          className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors"
                                   >
                                          <Save className="w-3.5 h-3.5" /> Guardar Cambios
                                   </button>
                            </div>

                            <div className="space-y-3">
                                   {players.map((p, i) => {
                                          const extras = getExtrasForPlayer(p.name)
                                          const extrasTotal = getExtrasTotalForPlayer(p.name)

                                          return (
                                                 <div key={i} className="bg-[#18181B] rounded-2xl overflow-hidden border border-zinc-800 shadow-sm transition-all hover:border-zinc-700">
                                                        <div className="p-4 flex items-center justify-between">
                                                               <div className="flex flex-col">
                                                                      <input
                                                                             value={p.name}
                                                                             onChange={(e) => {
                                                                                    const newP = [...players]
                                                                                    newP[i].name = e.target.value
                                                                                    setPlayers(newP)
                                                                             }}
                                                                             className="text-[10px] font-bold text-zinc-500 bg-transparent border-none outline-none uppercase tracking-widest mb-1 w-32 focus:text-blue-400 transition-colors"
                                                                      />
                                                                      <span className="text-xl font-bold italic tracking-tighter text-white">
                                                                             ${p.amount.toLocaleString()}
                                                                      </span>
                                                               </div>
                                                               {p.isPaid ? (
                                                                      <button
                                                                             onClick={() => updatePlayerStatus(i, false)}
                                                                             className="h-10 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase hover:bg-emerald-500/20 transition-colors"
                                                                      >
                                                                             <CheckCircle className="w-4 h-4" /> PAGADO
                                                                      </button>
                                                               ) : (
                                                                      <button
                                                                             onClick={() => updatePlayerStatus(i, true)}
                                                                             className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                                                                      >
                                                                             COBRAR
                                                                      </button>
                                                               )}
                                                        </div>

                                                        {/* Individual Extras Breakdown */}
                                                        {extras.length > 0 && (
                                                               <div className="px-4 pb-4 pt-2 border-t border-zinc-800 bg-black/20">
                                                                      <div className="flex items-center gap-2 mb-2">
                                                                             <ShoppingCart className="w-3 h-3 text-blue-500" />
                                                                             <span className="text-[8px] font-bold text-zinc-500 uppercase">EXTRAS INDIVIDUALES</span>
                                                                      </div>
                                                                      <div className="space-y-1">
                                                                             {extras.map((item, idx) => (
                                                                                    <div key={idx} className="flex justify-between text-[10px]">
                                                                                           <span className="text-zinc-400 font-medium">{item.productName} (x{item.quantity})</span>
                                                                                           <span className="text-white font-bold">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                                    </div>
                                                                             ))}
                                                                             <div className="flex justify-between pt-1 mt-1 border-t border-zinc-800">
                                                                                    <span className="text-[9px] font-bold text-blue-500/50">TOTAL EXTRA</span>
                                                                                    <span className="text-[10px] font-bold text-blue-500">${extrasTotal.toLocaleString()}</span>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        )}
                                                 </div>
                                          )
                                   })}
                            </div>
                     </div>
              </div>
       )
}
