'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Banknote, Building2, CreditCard, User, Calculator } from 'lucide-react'

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
                     updatePlayer(index, { isPaid: false, paymentMethod: null })
              } else {
                     updatePlayer(index, { isPaid: true, paymentMethod: method })
              }
       }

       const pendingAmount = localPlayers.reduce((sum, p) => p.isPaid ? sum : sum + p.amount, 0)

       return (
              <div className="flex flex-col h-full bg-[#0a0a0b] text-white">

                     {/* TOTAL SECTION - Responsive Header */}
                     <div className="pt-8 pb-10 text-center bg-gradient-to-b from-[#3b82f6]/10 to-transparent shrink-0 rounded-[40px] mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black italic">SPLIT</div>
                            </div>
                            <p className="relative z-10 text-slate-500 text-xs font-black tracking-[0.3em] uppercase mb-3">Monto Total a Dividir</p>
                            <h1 className="relative z-10 text-[#39FF14] tracking-tighter text-5xl md:text-7xl font-black italic drop-shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                                   ${totalAmount.toLocaleString()}
                            </h1>
                     </div>

                     {/* PLAYERS GRID/LIST - Responsive Columns */}
                     <div className="px-1 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-6 pb-40 flex-1 overflow-y-auto custom-scrollbar">
                            {localPlayers.map((p, i) => (
                                   <div key={i} className={cn(
                                          "group bg-[#161618] rounded-[32px] p-6 border border-[#27272a] shadow-xl transition-all hover:border-[#3b82f6]/40",
                                          p.isPaid && "bg-[#161618]/50 border-emerald-500/20"
                                   )}>
                                          <div className="flex justify-between items-start mb-6">
                                                 <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                               "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-colors",
                                                               p.isPaid ? "bg-emerald-500 text-white" : "bg-[#3b82f6]/10 text-[#3b82f6]"
                                                        )}>
                                                               J{i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                               <input
                                                                      value={p.name}
                                                                      onChange={(e) => updatePlayer(i, { name: e.target.value })}
                                                                      className="bg-transparent text-white font-black text-lg outline-none w-full placeholder:text-slate-700"
                                                                      placeholder="Nombre jugador..."
                                                               />
                                                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                                      {p.isPaid ? '✓ Pago Confirmado' : 'Esperando Pago'}
                                                               </p>
                                                        </div>
                                                 </div>
                                                 <div className="flex flex-col items-end shrink-0">
                                                        <span className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-widest">Monto</span>
                                                        <div className="bg-[#0a0a0b] border border-[#27272a] rounded-xl flex items-center px-3 py-2 shadow-inner focus-within:border-[#3b82f6]/50 transition-colors">
                                                               <span className="text-sm font-black text-slate-600 mr-2">$</span>
                                                               <input
                                                                      type="number"
                                                                      value={p.amount}
                                                                      onChange={(e) => updatePlayer(i, { amount: Number(e.target.value) })}
                                                                      className="w-20 bg-transparent text-right font-black text-[#3b82f6] text-lg focus:outline-none"
                                                               />
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Payment Methods Selector */}
                                          <div className="grid grid-cols-3 gap-2">
                                                 {[
                                                        { id: 'CASH', icon: Banknote, label: 'Efectivo' },
                                                        { id: 'TRANSFER', icon: Building2, label: 'Transf.' },
                                                        { id: 'CARD', icon: CreditCard, label: 'Tarjeta' }
                                                 ].map((method) => (
                                                        <button
                                                               key={method.id}
                                                               onClick={() => togglePaymentMethod(i, method.id)}
                                                               className={cn(
                                                                      "py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-tighter transition-all border shadow-sm",
                                                                      p.isPaid && p.paymentMethod === method.id
                                                                             ? "bg-[#3b82f6] text-white border-[#3b82f6] scale-105"
                                                                             : "bg-[#0a0a0b] text-slate-500 border-white/5 hover:border-[#3b82f6]/30 hover:text-slate-300"
                                                               )}
                                                        >
                                                               <method.icon className="w-5 h-5 mb-0.5" />
                                                               {method.label}
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>
                            ))}
                     </div>

                     {/* STICKY FOOTER - Modern/Responsive Float */}
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-2xl z-30">
                            <div className="bg-[#161618] border border-[#27272a] rounded-[32px] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col sm:flex-row items-center gap-4">
                                   <div className="flex-1 flex items-center gap-4 px-2">
                                          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                                 <Calculator className="text-amber-500 w-6 h-6" />
                                          </div>
                                          <div>
                                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo por liquidar</p>
                                                 <span className="text-3xl font-black text-[#39FF14] tracking-tighter">${pendingAmount.toLocaleString()}</span>
                                          </div>
                                   </div>
                                   <button
                                          onClick={onSave}
                                          disabled={loading}
                                          className="w-full sm:w-auto h-full px-10 py-5 bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-lg rounded-[24px] shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                   >
                                          {loading ? 'GUARDANDO...' : (
                                                 <><CheckCircle className="w-6 h-6" /> LIQUIDAR COBRO</>
                                          )}
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
