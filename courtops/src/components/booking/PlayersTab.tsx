import React, { useState } from 'react'
import { Plus, Minus, CheckCircle, RefreshCw, X, DollarSign, Wallet, Loader2, User, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { chargePlayer } from '@/actions/manageBooking'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface PlayersTabProps {
       bookingId: number
       totalAmount: number
       baseBookingPrice: number
       kioskItems: any[]
       players: any[]
       setPlayers: (players: any[]) => void
       onSave: () => void
       loading: boolean
}

export function PlayersTab({ bookingId, totalAmount, baseBookingPrice, kioskItems, players, setPlayers, onSave, loading }: PlayersTabProps) {
       const { t } = useLanguage()
       const [isCharging, setIsCharging] = useState(false)
       const [showPaymentModal, setShowPaymentModal] = useState<{ id: string, name: string, amount: number } | null>(null)

       const handleAddPlayer = () => {
              if (players.length >= 8) return
              const newPlayer = {
                     id: crypto.randomUUID(),
                     name: `Jugador ${players.length + 1}`,
                     isPaid: false,
                     amount: 0
              }
              setPlayers([...players, newPlayer])
       }

       const handleRecalculate = () => {
              const sharedKioskTotal = kioskItems
                     .filter(i => !i.playerName || i.playerName === 'General' || i.playerName === t('everyone'))
                     .reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0)

              const sharedTotal = baseBookingPrice + sharedKioskTotal
              const splitAmount = sharedTotal / Math.max(players.length, 1)

              const updatedPlayers = players.map(p => {
                     if (p.isPaid) return p;
                     const individualKioskTotal = kioskItems
                            .filter(i => i.playerName === p.name)
                            .reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0)

                     return { ...p, amount: Math.ceil(splitAmount + individualKioskTotal) }
              })
              setPlayers(updatedPlayers)
              toast.success("Gastos divididos correctamente")

              // Opcional: Auto-guardar
              // onSave()
       }

       return (
              <div className="space-y-6">
                     {/* Control Bar */}
                     <div className="flex items-center justify-between bg-[#F8F9FA] dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                          <User size={14} />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">División de Gastos</span>
                            </div>

                            <div className="flex items-center gap-4">
                                   <span className="text-[10px] font-black text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                                          {players.length} Jugadores
                                   </span>
                                   <div className="flex items-center gap-1">
                                          <button
                                                 onClick={handleRecalculate}
                                                 className="mr-2 px-3 sm:px-4 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-95 transition-all"
                                          >
                                                 <RefreshCw size={14} />
                                                 <span className="hidden sm:block">Dividir</span>
                                          </button>
                                          <button
                                                 onClick={() => setPlayers(players.slice(0, -1))}
                                                 className="w-10 h-10 rounded-xl bg-[#F8F9FA] dark:bg-zinc-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                                          >
                                                 <Minus size={14} />
                                          </button>
                                          <button
                                                 onClick={handleAddPlayer}
                                                 className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm shrink-0"
                                          >
                                                 <Plus size={14} />
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* Compact Player Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <AnimatePresence>
                                   {players.map((player, index) => (
                                          <motion.div
                                                 layout
                                                 key={player.id || `player-${index}`}
                                                 className="group bg-[#F8F9FA] dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-primary/20 transition-all"
                                          >
                                                 <div className="flex items-center gap-4 min-w-0 flex-1">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:text-primary transition-colors shrink-0">
                                                               <span className="font-black text-xs">{player.name ? player.name[0].toUpperCase() : '?'}</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pr-2">
                                                               <input
                                                                      type="text"
                                                                      value={player.name}
                                                                      onChange={(e) => {
                                                                             const newPlayers = [...players];
                                                                             newPlayers[index] = { ...newPlayers[index], name: e.target.value };
                                                                             setPlayers(newPlayers);
                                                                      }}
                                                                      onBlur={() => onSave()}
                                                                      className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full p-0 focus:ring-0 truncate placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                                                                      placeholder="Nombre del jugador"
                                                                      disabled={player.isPaid}
                                                               />
                                                               <p className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mt-0.5">${player.amount}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center gap-2">
                                                        {player.isPaid ? (
                                                               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 rounded-lg border border-emerald-100 dark:border-emerald-500/10">
                                                                      <CheckCircle size={10} />
                                                                      <span className="text-[8px] font-black uppercase">Pagado</span>
                                                               </div>
                                                        ) : (
                                                               <button
                                                                      onClick={() => setShowPaymentModal({ id: player.id, name: player.name, amount: player.amount })}
                                                                      className="px-3 py-1.5 bg-primary text-slate-900 rounded-lg text-[8px] font-black uppercase hover:brightness-110 active:scale-95 transition-all shadow-sm"
                                                               >
                                                                      Cobrar
                                                               </button>
                                                        )}
                                                 </div>
                                          </motion.div>
                                   ))}
                            </AnimatePresence>
                     </div>

                     {/* Payment Modal Minimal */}
                     {showPaymentModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm">
                                   <div className="w-full max-w-sm bg-[#F8F9FA] dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                                          <div className="flex items-center justify-between mb-8">
                                                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500">Registrar Pago</h4>
                                                 <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                        <X size={18} />
                                                 </button>
                                          </div>

                                          <div className="text-center mb-10">
                                                 <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-1">{showPaymentModal.name}</p>
                                                 <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">${showPaymentModal.amount}</p>
                                          </div>

                                          <div className="space-y-3">
                                                 {['CASH', 'TRANSFER', 'MP'].map(method => (
                                                        <button
                                                               key={method}
                                                               onClick={async () => {
                                                                      setIsCharging(true)
                                                                      const res = await chargePlayer(bookingId, showPaymentModal.name, showPaymentModal.amount, method)
                                                                      setIsCharging(false)
                                                                      if (res.success) {
                                                                             toast.success("Pago registrado")
                                                                             setShowPaymentModal(null)
                                                                             onSave()
                                                                      }
                                                               }}
                                                               className="w-full py-4 bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-3"
                                                        >
                                                               {method === 'CASH' && <Wallet size={12} />}
                                                               {method === 'MP' && <RefreshCw size={12} />}
                                                               {method}
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
