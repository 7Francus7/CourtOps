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

export function PlayersTab({ bookingId, totalAmount, players, setPlayers, onSave, loading }: PlayersTabProps) {
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

       return (
              <div className="space-y-6">
                     {/* Control Bar */}
                     <div className="flex items-center justify-between bg-zinc-900/40 border border-white/5 p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                          <User size={14} />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">División de Gastos</span>
                            </div>

                            <div className="flex items-center gap-4">
                                   <span className="text-[10px] font-black text-white px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                          {players.length} Jugadores
                                   </span>
                                   <div className="flex items-center gap-1">
                                          <button
                                                 onClick={() => setPlayers(players.slice(0, -1))}
                                                 className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white transition-colors"
                                          >
                                                 <Minus size={14} />
                                          </button>
                                          <button
                                                 onClick={handleAddPlayer}
                                                 className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors"
                                          >
                                                 <Plus size={14} />
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* Compact Player Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <AnimatePresence>
                                   {players.map((player) => (
                                          <motion.div
                                                 layout
                                                 key={player.id}
                                                 className="group bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-white/10 transition-all"
                                          >
                                                 <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                                                               <span className="font-black text-xs">{player.name[0]}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                               <p className="text-xs font-bold text-white truncate">{player.name}</p>
                                                               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">${player.amount}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center gap-2">
                                                        {player.isPaid ? (
                                                               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/10">
                                                                      <CheckCircle size={10} />
                                                                      <span className="text-[8px] font-black uppercase">Pagado</span>
                                                               </div>
                                                        ) : (
                                                               <button
                                                                      onClick={() => setShowPaymentModal({ id: player.id, name: player.name, amount: player.amount })}
                                                                      className="px-3 py-1.5 bg-primary text-black rounded-lg text-[8px] font-black uppercase hover:brightness-110 transition-all"
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
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                   <div className="w-full max-w-sm bg-card border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                                          <div className="flex items-center justify-between mb-6">
                                                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Registrar Pago</h4>
                                                 <button onClick={() => setShowPaymentModal(null)} className="text-zinc-500 hover:text-white">
                                                        <X size={16} />
                                                 </button>
                                          </div>

                                          <div className="text-center mb-8">
                                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{showPaymentModal.name}</p>
                                                 <p className="text-3xl font-black text-white tracking-tighter">${showPaymentModal.amount}</p>
                                          </div>

                                          <div className="space-y-2">
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
                                                               className="w-full py-4 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-3"
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
