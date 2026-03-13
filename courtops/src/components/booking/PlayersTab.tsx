import React, { useState } from 'react'
import { Plus, Minus, CheckCircle, RefreshCw, X, Wallet, Loader2, User } from 'lucide-react'
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
       onRecalculate?: () => void
       loading: boolean
}

export function PlayersTab({ bookingId, totalAmount, baseBookingPrice, kioskItems, players, setPlayers, onSave, onRecalculate, loading }: PlayersTabProps) {
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

       const paidCount = players.filter(p => p.isPaid).length
       const totalPlayerAmount = players.reduce((acc: number, p: any) => acc + (p.amount || 0), 0)

       return (
              <div className="max-w-2xl mx-auto space-y-5">
                     {/* Header Bar */}
                     <div className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                          <User size={14} />
                                   </div>
                                   <div>
                                          <span className="text-[13px] font-semibold text-slate-800 dark:text-white">División de Gastos</span>
                                          {paidCount > 0 && (
                                                 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium ml-2">
                                                        {paidCount}/{players.length} pagaron
                                                 </span>
                                          )}
                                   </div>
                            </div>

                            <div className="flex items-center gap-2">
                                   <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.06]">
                                          {players.length} Jugadores
                                   </span>
                                   <button
                                          onClick={onRecalculate}
                                          className="h-8 px-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/15 flex items-center gap-1.5 text-[11px] font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-95 transition-all"
                                   >
                                          <RefreshCw size={12} />
                                          <span className="hidden sm:inline">Dividir</span>
                                   </button>
                                   <button
                                          onClick={() => players.length > 1 && setPlayers(players.slice(0, -1))}
                                          className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:text-slate-700 dark:hover:text-white transition-colors"
                                   >
                                          <Minus size={13} />
                                   </button>
                                   <button
                                          onClick={handleAddPlayer}
                                          className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
                                   >
                                          <Plus size={13} />
                                   </button>
                            </div>
                     </div>

                     {/* Player Cards */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <AnimatePresence>
                                   {players.map((player, index) => (
                                          <motion.div
                                                 layout
                                                 key={player.id || `player-${index}`}
                                                 initial={{ opacity: 0, scale: 0.95 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 exit={{ opacity: 0, scale: 0.95 }}
                                                 className={cn(
                                                        "group bg-white dark:bg-white/[0.02] border rounded-xl p-3.5 flex items-center justify-between transition-all",
                                                        player.isPaid
                                                               ? "border-emerald-200/60 dark:border-emerald-500/10 bg-emerald-50/30 dark:bg-emerald-500/[0.02]"
                                                               : "border-slate-200/60 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-white/[0.08]"
                                                 )}
                                          >
                                                 <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className={cn(
                                                               "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold",
                                                               player.isPaid
                                                                      ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10 transition-colors"
                                                        )}>
                                                               {player.isPaid ? <CheckCircle size={16} /> : (player.name ? player.name[0].toUpperCase() : '?')}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                               <input
                                                                      type="text"
                                                                      value={player.name}
                                                                      onChange={(e) => {
                                                                             const newPlayers = [...players]
                                                                             newPlayers[index] = { ...newPlayers[index], name: e.target.value }
                                                                             setPlayers(newPlayers)
                                                                      }}
                                                                      onBlur={() => onSave()}
                                                                      className={cn(
                                                                             "text-[13px] font-medium bg-transparent border-none outline-none w-full p-0 focus:ring-0 truncate",
                                                                             player.isPaid ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                                                                      )}
                                                                      placeholder="Nombre del jugador"
                                                                      disabled={player.isPaid}
                                                               />
                                                               <p className={cn(
                                                                      "text-[11px] font-medium mt-0.5",
                                                                      player.isPaid ? "text-emerald-500/70 dark:text-emerald-500/50" : "text-slate-400 dark:text-zinc-600"
                                                               )}>
                                                                      ${(player.amount || 0).toLocaleString()}
                                                               </p>
                                                        </div>
                                                 </div>

                                                 <div className="shrink-0 ml-2">
                                                        {player.isPaid ? (
                                                               <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">
                                                                      Pagado
                                                               </span>
                                                        ) : (
                                                               <button
                                                                      onClick={() => setShowPaymentModal({ id: player.id, name: player.name, amount: player.amount })}
                                                                      disabled={!player.amount || player.amount <= 0}
                                                                      className="text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                               >
                                                                      Cobrar
                                                               </button>
                                                        )}
                                                 </div>
                                          </motion.div>
                                   ))}
                            </AnimatePresence>
                     </div>

                     {/* Summary */}
                     {totalPlayerAmount > 0 && (
                            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                                   <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">Total asignado a jugadores</span>
                                   <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${totalPlayerAmount.toLocaleString()}</span>
                            </div>
                     )}

                     {/* Payment Modal */}
                     <AnimatePresence>
                            {showPaymentModal && (
                                   <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                          <motion.div
                                                 initial={{ scale: 0.95, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 exit={{ scale: 0.95, opacity: 0 }}
                                                 className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl"
                                          >
                                                 <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Registrar Pago</h4>
                                                        <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1">
                                                               <X size={16} />
                                                        </button>
                                                 </div>

                                                 <div className="text-center mb-8 py-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/[0.04]">
                                                        <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mb-1">{showPaymentModal.name}</p>
                                                        <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${showPaymentModal.amount.toLocaleString()}</p>
                                                 </div>

                                                 <div className="space-y-2">
                                                        {[
                                                               { method: 'CASH', label: 'Efectivo', icon: Wallet },
                                                               { method: 'TRANSFER', label: 'Transferencia', icon: RefreshCw },
                                                               { method: 'MP', label: 'MercadoPago', icon: RefreshCw },
                                                        ].map(({ method, label, icon: Icon }) => (
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
                                                                             } else {
                                                                                    toast.error("Error al registrar pago")
                                                                             }
                                                                      }}
                                                                      disabled={isCharging}
                                                                      className="w-full py-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl text-[12px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50"
                                                               >
                                                                      {isCharging ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
                                                                      {label}
                                                               </button>
                                                        ))}
                                                 </div>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </div>
       )
}
