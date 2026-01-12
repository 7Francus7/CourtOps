'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Banknote, Building2, CreditCard, User } from 'lucide-react'

// Custom colors from snippets
// primary: #0d59f2
// neon-green: #39FF14

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
       const [localPlayers, setLocalPlayers] = useState<PlayerSplit[]>(players)

       // Init with 4 players if empty
       useEffect(() => {
              if (localPlayers.length === 0) {
                     const count = 4
                     const perPlayer = Math.ceil(totalAmount / count)
                     const newPlayers = Array.from({ length: count }).map((_, i) => ({
                            name: `Jugador ${i + 1}`,
                            amount: perPlayer,
                            isPaid: false,
                            paymentMethod: null
                     }))
                     setLocalPlayers(newPlayers)
                     setPlayers(newPlayers)
              }
       }, [])

       const updatePlayer = (index: number, updates: Partial<PlayerSplit>) => {
              const newPlayers = [...localPlayers]
              newPlayers[index] = { ...newPlayers[index], ...updates }
              setLocalPlayers(newPlayers)
              setPlayers(newPlayers)
       }

       const togglePaymentMethod = (index: number, method: string) => {
              const p = localPlayers[index]
              if (p.paymentMethod === method && p.isPaid) {
                     // Toggle off
                     updatePlayer(index, { isPaid: false, paymentMethod: null })
              } else {
                     // Toggle on (switch method)
                     updatePlayer(index, { isPaid: true, paymentMethod: method })
              }
       }

       const pendingAmount = localPlayers.reduce((sum, p) => p.isPaid ? sum : sum + p.amount, 0) // or Total - paid?
       // Actually pending is sum of amounts of unpaid players. Or strictly Total - Paid. 
       // If users edit amounts, the sum might drift from Total. For now display sum of UNPAID players.

       return (
              <div className="flex flex-col h-full bg-[#0a0a0b] text-white">
                     {/* TOTAL SECTION */}
                     <div className="pt-6 pb-8 text-center bg-gradient-to-b from-[#0d59f2]/20 to-transparent shrink-0 rounded-b-3xl mb-4">
                            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">TOTAL A COBRAR</p>
                            <h1 className="text-[#39FF14] tracking-tight text-[42px] font-extrabold leading-tight px-4">${totalAmount.toLocaleString()}</h1>
                     </div>

                     {/* PLAYERS LIST */}
                     <div className="px-4 space-y-4 pb-32 flex-1 overflow-y-auto custom-scrollbar">
                            {localPlayers.map((p, i) => (
                                   <div key={i} className="bg-[#1c2536] rounded-xl p-4 border border-slate-800 shadow-sm">
                                          <div className="flex justify-between items-start mb-4">
                                                 <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-[#0d59f2]/20 flex items-center justify-center text-[#0d59f2] font-bold shrink-0">
                                                               J{i + 1}
                                                        </div>
                                                        <div>
                                                               <input
                                                                      value={p.name}
                                                                      onChange={(e) => updatePlayer(i, { name: e.target.value })}
                                                                      className="bg-transparent text-white font-bold outline-none w-full"
                                                               />
                                                               {/* <p className="text-slate-500 text-xs">Propio: $2500 · Común: $500</p> */}
                                                        </div>
                                                 </div>
                                                 <div className="flex flex-col items-end">
                                                        <span className="text-xs text-gray-400 mb-1 uppercase font-semibold">Monto</span>
                                                        <div className="w-24 bg-[#0a0a0b] border border-gray-700 rounded-lg flex items-center px-1">
                                                               <span className="text-xs text-slate-500 ml-1">$</span>
                                                               <input
                                                                      type="number"
                                                                      value={p.amount}
                                                                      onChange={(e) => updatePlayer(i, { amount: Number(e.target.value) })}
                                                                      className="w-full bg-transparent text-right font-bold text-[#0d59f2] focus:outline-none py-1 pr-1"
                                                               />
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Payment Methods Selector */}
                                          <div className="flex gap-2">
                                                 <button
                                                        onClick={() => togglePaymentMethod(i, 'CASH')}
                                                        className={cn(
                                                               "flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all border",
                                                               p.isPaid && p.paymentMethod === 'CASH'
                                                                      ? "bg-[#0d59f2] text-white border-[#0d59f2]"
                                                                      : "bg-[#0a0a0b] text-gray-400 border-gray-800 hover:bg-[#111]"
                                                        )}
                                                 >
                                                        <Banknote className="w-4 h-4" /> Efectivo
                                                 </button>
                                                 <button
                                                        onClick={() => togglePaymentMethod(i, 'TRANSFER')}
                                                        className={cn(
                                                               "flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all border",
                                                               p.isPaid && p.paymentMethod === 'TRANSFER'
                                                                      ? "bg-[#0d59f2] text-white border-[#0d59f2]"
                                                                      : "bg-[#0a0a0b] text-gray-400 border-gray-800 hover:bg-[#111]"
                                                        )}
                                                 >
                                                        <Building2 className="w-4 h-4" /> Transf.
                                                 </button>
                                                 <button
                                                        onClick={() => togglePaymentMethod(i, 'CARD')}
                                                        className={cn(
                                                               "flex-1 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all border",
                                                               p.isPaid && p.paymentMethod === 'CARD'
                                                                      ? "bg-[#0d59f2] text-white border-[#0d59f2]"
                                                                      : "bg-[#0a0a0b] text-gray-400 border-gray-800 hover:bg-[#111]"
                                                        )}
                                                 >
                                                        <CreditCard className="w-4 h-4" /> Tarjeta
                                                 </button>
                                          </div>
                                   </div>
                            ))}
                     </div>

                     {/* STICKY FOOTER ACTION */}
                     <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0a0a0b] border-t border-gray-800 space-y-3 z-20">
                            <div className="flex justify-between items-center px-2">
                                   <span className="text-sm font-medium text-gray-400">Pendiente por cobrar:</span>
                                   <span className="text-lg font-bold text-[#39FF14]">${pendingAmount.toLocaleString()}</span>
                            </div>
                            <button
                                   onClick={onSave}
                                   className="w-full bg-[#0d59f2] hover:bg-[#0d59f2]/90 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
                            >
                                   <CheckCircle className="w-5 h-5" />
                                   Confirmar Cobro Múltiple
                            </button>
                     </div>
              </div>
       )
}
