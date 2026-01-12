'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Banknote, Building2, CreditCard, User, Calculator, Minus, Plus, RefreshCw, Save, ShoppingCart } from 'lucide-react'

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
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">

                     {/* PROGRESS BAR */}
                     <div className="space-y-3">
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-blue-500">
                                   <span>Progreso de cobro</span>
                                   <span className="text-slate-400">${totalPaidAmount.toLocaleString()} / ${totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-[#161618] rounded-full overflow-hidden">
                                   <div
                                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                          style={{ width: `${progressPercent}%` }}
                                   />
                            </div>
                     </div>

                     {/* CONFIGURATION CARD */}
                     <div className="bg-[#161618] rounded-[28px] p-6 border border-[#27272a] flex flex-col items-center gap-6">
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Configurar División</h3>

                            <div className="flex items-center gap-8">
                                   <button
                                          onClick={() => {
                                                 const n = Math.max(1, localPlayerCount - 1)
                                                 setLocalPlayerCount(n)
                                          }}
                                          className="w-14 h-14 bg-[#0a0a0b] rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all text-slate-500 active:scale-90 shadow-lg border border-white/5"
                                   >
                                          <Minus className="w-6 h-6" />
                                   </button>
                                   <div className="flex flex-col items-center">
                                          <span className="text-6xl font-black italic tracking-tighter text-white">{localPlayerCount}</span>
                                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Jugadores</span>
                                   </div>
                                   <button
                                          onClick={() => {
                                                 const n = localPlayerCount + 1
                                                 setLocalPlayerCount(n)
                                          }}
                                          className="w-14 h-14 bg-[#0a0a0b] rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all text-blue-500 active:scale-90 shadow-lg border border-white/5"
                                   >
                                          <Plus className="w-6 h-6" />
                                   </button>
                            </div>

                            <div className="w-full bg-[#0a0a0b] py-4 rounded-2xl flex flex-col items-center border border-white/5">
                                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Cancha sugerido:</span>
                                   <span className="text-2xl font-black text-white italic tracking-tighter">${basePricePerPlayer.toLocaleString()}</span>
                            </div>

                            <button
                                   onClick={() => handleReset()}
                                   className="w-full h-14 bg-[#3b82f6] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/10"
                            >
                                   <RefreshCw className="w-4 h-4" /> RECALCULAR TODO
                            </button>
                     </div>

                     {/* PLAYER LIST */}
                     <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalle por Jugador</h3>
                                   <button
                                          onClick={async () => {
                                                 const res = await onSave();
                                          }}
                                          className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase"
                                   >
                                          <Save className="w-3.5 h-3.5" /> Guardar
                                   </button>
                            </div>
                            <div className="space-y-3">
                                   {players.map((p, i) => {
                                          const extras = getExtrasForPlayer(p.name)
                                          const extrasTotal = getExtrasTotalForPlayer(p.name)

                                          return (
                                                 <div key={i} className="bg-[#161618] rounded-2xl overflow-hidden border border-[#27272a] shadow-sm">
                                                        <div className="p-4 flex items-center justify-between">
                                                               <div className="flex flex-col">
                                                                      <input
                                                                             value={p.name}
                                                                             onChange={(e) => {
                                                                                    const newP = [...players]
                                                                                    newP[i].name = e.target.value
                                                                                    setPlayers(newP)
                                                                             }}
                                                                             className="text-[10px] font-black text-slate-500 bg-transparent border-none outline-none uppercase tracking-widest mb-1 w-32"
                                                                      />
                                                                      <span className="text-xl font-black italic tracking-tighter text-white">
                                                                             ${p.amount.toLocaleString()}
                                                                      </span>
                                                               </div>
                                                               {p.isPaid ? (
                                                                      <div className="h-10 px-4 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase">
                                                                             <CheckCircle className="w-4 h-4" /> PAGADO
                                                                      </div>
                                                               ) : (
                                                                      <button
                                                                             onClick={() => updatePlayerStatus(i, true)}
                                                                             className="h-10 px-6 bg-[#3b82f6] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                                                                      >
                                                                             COBRAR
                                                                      </button>
                                                               )}
                                                        </div>

                                                        {/* Individual Extras Breakdown */}
                                                        {extras.length > 0 && (
                                                               <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20">
                                                                      <div className="flex items-center gap-2 mb-2">
                                                                             <ShoppingCart className="w-3 h-3 text-blue-500" />
                                                                             <span className="text-[8px] font-black text-slate-500 uppercase">EXTRAS INDIVIDUALES</span>
                                                                      </div>
                                                                      <div className="space-y-1">
                                                                             {extras.map((item, idx) => (
                                                                                    <div key={idx} className="flex justify-between text-[10px]">
                                                                                           <span className="text-slate-400 font-bold">{item.productName} (x{item.quantity})</span>
                                                                                           <span className="text-white font-black">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                                    </div>
                                                                             ))}
                                                                             <div className="flex justify-between pt-1 mt-1 border-t border-white/5">
                                                                                    <span className="text-[9px] font-black text-blue-500/50">TOTAL EXTRA</span>
                                                                                    <span className="text-[10px] font-black text-blue-500">${extrasTotal.toLocaleString()}</span>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        )}
                                                 </div>
                                          )
                                   })}
                            </div>
                     </div>

                     {/* MANUAL AMOUNT */}
                     <div className="bg-[#161618] rounded-[28px] p-4 flex gap-3 border border-[#27272a]">
                            <div className="flex-1 bg-[#0a0a0b] rounded-2xl py-3 px-6 flex flex-col justify-center border border-white/5">
                                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Monto Manual</span>
                                   <div className="flex items-center gap-2">
                                          <span className="text-slate-400 font-bold">$</span>
                                          <input type="number" placeholder="0" className="bg-transparent text-xl font-black italic tracking-tighter text-white w-full outline-none" />
                                   </div>
                            </div>
                            <button className="px-6 h-auto bg-[#ccff00] text-black rounded-2xl font-black text-[10px] uppercase tracking-tighter leading-none flex items-center justify-center text-center shadow-lg shadow-[#ccff00]/10 active:scale-95 leading-4">
                                   COBRAR<br />RESTO
                            </button>
                     </div>

              </div>
       )
}
