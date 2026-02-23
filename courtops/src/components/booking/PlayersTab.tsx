'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Plus, Minus, RefreshCw, Save, ShoppingCart, Users, X, DollarSign, Wallet, CreditCard, Smartphone, Loader2 } from 'lucide-react'
import { chargePlayer } from '@/actions/manageBooking'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface PlayerSplit {
       name: string
       amount: number
       isPaid: boolean
       paymentMethod?: string | null
}

interface Props {
       bookingId: number
       totalAmount: number
       players: PlayerSplit[]
       setPlayers: (players: PlayerSplit[]) => void
       onSave: () => Promise<void>
       loading: boolean
       baseBookingPrice?: number
       kioskItems?: any[]
}

export function PlayersTab({
       bookingId,
       totalAmount,
       players = [],
       setPlayers,
       onSave,
       loading,
       baseBookingPrice = 0,
       kioskItems = []
}: Props) {
       const { t } = useLanguage()
       const [localPlayerCount, setLocalPlayerCount] = useState(players.length || 4)
       const [processingPayment, setProcessingPayment] = useState(false)

       // Payment Modal State
       const [paymentModal, setPaymentModal] = useState<{
              isOpen: boolean
              playerIndex: number | null
              player: PlayerSplit | null
       }>({
              isOpen: false,
              playerIndex: null,
              player: null
       })

       // Calculate individual totals
       const basePricePerPlayer = Math.ceil(baseBookingPrice / localPlayerCount)
       const sharedItems = kioskItems.filter(item => !item.playerName)
       const sharedTotal = sharedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
       const sharedPerPlayer = Math.ceil(sharedTotal / localPlayerCount)

       const getExtrasForPlayer = (playerName: string) => {
              return kioskItems.filter(item => item.playerName === playerName)
       }

       const getExtrasTotalForPlayer = (playerName: string) => {
              return getExtrasForPlayer(playerName).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
       }

       const handleReset = (countOverwrite?: number) => {
              const newCount = countOverwrite || localPlayerCount

              // Recalculate per-player costs based on current total shared costs/count
              const currentBasePerPlayer = Math.ceil(baseBookingPrice / newCount)
              const currentSharedPerPlayer = Math.ceil(sharedTotal / newCount)

              const newPlayers = Array.from({ length: newCount }).map((_, i) => {
                     const existingPlayer = players[i]
                     const pName = existingPlayer?.name || (i === 0 ? 'Titular' : `Jugador ${i + 1}`)
                     const extras = getExtrasTotalForPlayer(pName)

                     return {
                            name: pName,
                            amount: currentBasePerPlayer + currentSharedPerPlayer + extras,
                            isPaid: existingPlayer?.isPaid || false,
                            paymentMethod: existingPlayer?.paymentMethod || null
                     }
              })
              setPlayers(newPlayers)
       }

       useEffect(() => {
              // Initial setup if empty
              if (players.length === 0) {
                     handleReset(4)
              }
       }, [])

       const totalPaidAmount = players.reduce((sum, p) => p.isPaid ? sum + p.amount : sum, 0)
       const progressPercent = Math.min((totalPaidAmount / totalAmount) * 100, 100)

       const handleOpenPayment = (index: number) => {
              setPaymentModal({
                     isOpen: true,
                     playerIndex: index,
                     player: players[index]
              })
       }

       const handleChargeConfirm = async (method: string, playerOverride?: PlayerSplit, indexOverride?: number) => {
              const targetPlayer = playerOverride || paymentModal.player
              const targetIndex = indexOverride ?? paymentModal.playerIndex

              if (!targetPlayer) return

              setProcessingPayment(true)
              try {
                     const res = await chargePlayer(bookingId, targetPlayer.name, targetPlayer.amount, method)

                     if (res.success) {
                            toast.success(`${t('payment_registered')} ${targetPlayer.name}`)

                            // Update local state
                            const newPlayers = [...players]
                            if (targetIndex !== null) {
                                   newPlayers[targetIndex] = {
                                          ...newPlayers[targetIndex],
                                          isPaid: true,
                                          paymentMethod: method
                                   }
                                   setPlayers(newPlayers)
                            }
                            setPaymentModal({ isOpen: false, playerIndex: null, player: null })
                     } else {
                            toast.error(res.error || t('error_processing_payment'))
                     }
              } catch (error) {
                     toast.error(t('connection_error'))
              } finally {
                     setProcessingPayment(false)
              }
       }

       return (
              <div className="flex flex-col gap-8 p-4 md:p-8 bg-zinc-950/50 relative min-h-[600px]">
                     {/* PROGRESS BAR */}
                     <div className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="flex justify-between items-end mb-6 relative z-10">
                                   <div className="space-y-1">
                                          <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">{t('payment_progress')}</span>
                                          <h3 className="text-white font-black text-2xl tracking-tight leading-none uppercase">Pagos por jugador</h3>
                                   </div>
                                   <div className="flex items-end gap-2">
                                          <span className="text-3xl font-black text-white tracking-tighter shadow-sm">
                                                 ${totalPaidAmount.toLocaleString()}
                                          </span>
                                          <span className="text-xs font-black text-zinc-500 mb-1.5 uppercase tracking-widest">/ ${totalAmount.toLocaleString()}</span>
                                   </div>
                            </div>
                            <div className="h-6 w-full bg-black/40 rounded-full overflow-hidden p-1.5 border border-white/5 relative">
                                   <div
                                          className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.2)] relative"
                                          style={{ width: `${progressPercent}%` }}
                                   >
                                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                                   </div>
                            </div>
                     </div>

                     {/* CONFIGURATION AND SUMMARY */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Summary Card */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                                   <div>
                                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-3">{t('court_shared_kiosk')}</p>
                                          <div className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                                                 ${(baseBookingPrice + sharedTotal).toLocaleString()}
                                          </div>
                                   </div>
                                   <div className="mt-8">
                                          <button
                                                 onClick={() => handleReset()}
                                                 className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all flex items-center justify-center gap-3 border border-white/10 active:scale-95"
                                          >
                                                 <RefreshCw className="w-4 h-4 text-primary" />
                                                 {t('distribute_equally')}
                                          </button>
                                   </div>
                            </div>

                            {/* Player Control */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group flex flex-col justify-center items-center">
                                   <div className="flex items-center gap-8 mb-6">
                                          <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{localPlayerCount}</div>
                                          <div className="flex flex-col">
                                                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{t('players')}</span>
                                                 <span className="text-white font-black text-sm uppercase">Seleccionados</span>
                                          </div>
                                   </div>

                                   <div className="flex items-center gap-4 w-full">
                                          <button
                                                 onClick={() => {
                                                        const newCount = Math.max(1, localPlayerCount - 1)
                                                        setLocalPlayerCount(newCount)
                                                        const newPlayers = players.slice(0, newCount)
                                                        setPlayers(newPlayers)
                                                 }}
                                                 className="flex-1 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-90"
                                          >
                                                 <Minus className="w-6 h-6 text-white" />
                                          </button>
                                          <button
                                                 onClick={() => {
                                                        const newCount = localPlayerCount + 1
                                                        setLocalPlayerCount(newCount)
                                                        const newPlayers = [...players, {
                                                               name: `Jugador ${newCount}`,
                                                               amount: 0,
                                                               isPaid: false,
                                                               paymentMethod: null
                                                        }]
                                                        setPlayers(newPlayers)
                                                 }}
                                                 className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all active:scale-90 shadow-xl shadow-primary/20"
                                          >
                                                 <Plus className="w-6 h-6" />
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* PLAYERS LIST & SAVE */}
                     <div className="space-y-6 pb-20">
                            <div className="flex justify-between items-center px-4">
                                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">{t('player_details')}</h3>
                                   <button
                                          onClick={() => onSave()}
                                          disabled={loading}
                                          className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:brightness-110 transition-all bg-primary/10 px-6 py-2.5 rounded-xl border border-primary/20 disabled:opacity-50"
                                   >
                                          <Save size={14} /> {t('save_names')}
                                   </button>
                            </div>

                            <div className="space-y-6">
                                   {players.map((p, i) => {
                                          const extras = getExtrasForPlayer(p.name)

                                          return (
                                                 <div key={i} className="bg-zinc-900/30 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all hover:border-primary/50 group relative">
                                                        <div className="p-8 flex items-center justify-between gap-6 relative z-10">
                                                               <div className="flex flex-col flex-1 min-w-0">
                                                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-3 block">{t('player_name')}</label>
                                                                      <div className="flex items-center gap-4">
                                                                             <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-2xl border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                                                                                    {p.name.charAt(0).toUpperCase()}
                                                                             </div>
                                                                             <input
                                                                                    value={p.name}
                                                                                    onChange={(e) => {
                                                                                           const newP = [...players]
                                                                                           newP[i].name = e.target.value
                                                                                           setPlayers(newP)
                                                                                    }}
                                                                                    className="text-3xl font-black text-white bg-transparent outline-none transition-all placeholder:text-zinc-800 leading-none w-full border-b-2 border-transparent focus:border-primary/30 py-2"
                                                                                    placeholder={t('enter_name')}
                                                                             />
                                                                      </div>
                                                                      <div className="flex items-baseline gap-2 mt-6">
                                                                             <span className="text-5xl font-black text-white tracking-tighter leading-none">${p.amount.toLocaleString()}</span>
                                                                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{t('total_to_pay')}</span>
                                                                      </div>
                                                               </div>

                                                               <div className="flex items-center gap-3 shrink-0">
                                                                      {p.isPaid ? (
                                                                             <div className="flex flex-col items-end gap-2">
                                                                                    <div className="h-16 px-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-[1.5rem] flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/5">
                                                                                           <CheckCircle className="w-5 h-5" /> {t('paid')}
                                                                                    </div>
                                                                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest opacity-50">{p.paymentMethod || 'CASH'}</span>
                                                                             </div>
                                                                      ) : (
                                                                             <div className="flex gap-4">
                                                                                    <button
                                                                                           onClick={() => handleChargeConfirm('CASH', p, i)}
                                                                                           className="h-16 w-16 flex items-center justify-center bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-500 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all active:scale-90"
                                                                                           title={t('quick_cash_pay')}
                                                                                    >
                                                                                           <DollarSign size={28} />
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => handleOpenPayment(i)}
                                                                                           className="h-16 px-10 bg-white text-black hover:bg-zinc-200 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-2xl flex-shrink-0"
                                                                                    >
                                                                                           {t('charge')}
                                                                                    </button>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>

                                                        {(sharedPerPlayer > 0 || extras.length > 0) && (
                                                               <div className="px-8 pb-10 pt-6 border-t border-white/5 bg-black/20 space-y-4">
                                                                      {sharedPerPlayer > 0 && (
                                                                             <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                                                                  <Users size={16} />
                                                                                           </div>
                                                                                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('shared_rental')}</span>
                                                                                    </div>
                                                                                    <span className="text-sm font-black text-white">${sharedPerPlayer.toLocaleString()}</span>
                                                                             </div>
                                                                      )}

                                                                      {extras.length > 0 && (
                                                                             <div className="space-y-3">
                                                                                    <div className="flex items-center gap-3 mb-2 px-1">
                                                                                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                                                                  <ShoppingCart size={16} />
                                                                                           </div>
                                                                                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('individual_extras')}</span>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-1 gap-2">
                                                                                           {extras.map((item, idx) => (
                                                                                                  <div key={idx} className="flex justify-between items-center bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                                                                                                         <span className="text-xs font-bold text-zinc-500">{item.productName} <span className="text-primary/70 ml-2">x{item.quantity}</span></span>
                                                                                                         <span className="text-xs font-black text-white">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                                                  </div>
                                                                                           ))}
                                                                                    </div>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        )}
                                                 </div>
                                          )
                                   })}
                            </div>

                            {/* Manual Add Player Button */}
                            <button
                                   onClick={() => {
                                          const newCount = localPlayerCount + 1
                                          setLocalPlayerCount(newCount)
                                          const newPlayers = [...players, {
                                                 name: `Jugador ${newCount}`,
                                                 amount: 0,
                                                 isPaid: false,
                                                 paymentMethod: null
                                          }]
                                          setPlayers(newPlayers)
                                   }}
                                   className="w-full py-10 rounded-[2.5rem] border-2 border-dashed border-white/5 text-zinc-500 hover:border-primary/50 hover:text-primary transition-all flex flex-col items-center justify-center gap-4 bg-zinc-900/20 group overflow-hidden relative"
                            >
                                   <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                   <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-primary border border-white/5 transition-colors relative z-10">
                                          <Plus size={32} />
                                   </div>
                                   <span className="text-xs font-black uppercase tracking-[0.4em] relative z-10">{t('add_player')}</span>
                            </button>
                     </div>

                     {/* PAYMENT MODAL OVERLAY */}
                     <AnimatePresence>
                            {paymentModal.isOpen && paymentModal.player && (
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                                   >
                                          <motion.div
                                                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                                 animate={{ scale: 1, opacity: 1, y: 0 }}
                                                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                                 className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary"></div>

                                                 {processingPayment && (
                                                        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex items-center justify-center">
                                                               <Loader2 className="animate-spin w-12 h-12 text-primary" />
                                                        </div>
                                                 )}

                                                 <button
                                                        onClick={() => setPaymentModal({ isOpen: false, playerIndex: null, player: null })}
                                                        className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                                 >
                                                        <X size={20} />
                                                 </button>

                                                 <div className="text-center mb-12">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4 block">{t('charge_to')}</span>
                                                        <h2 className="text-4xl font-black text-white mb-8 tracking-tight">{paymentModal.player.name}</h2>

                                                        <div className="inline-block p-1 bg-white/5 rounded-[2rem] border border-white/5">
                                                               <div className="px-10 py-6 bg-zinc-900 rounded-[1.8rem] border border-white/10 shadow-inner">
                                                                      <span className="text-6xl font-black text-white tracking-tighter">
                                                                             ${paymentModal.player.amount.toLocaleString()}
                                                                      </span>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                               onClick={() => handleChargeConfirm('CASH')}
                                                               className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white p-8 rounded-3xl flex flex-col items-center gap-4 transition-all active:scale-95 group relative overflow-hidden"
                                                        >
                                                               <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                                               <Wallet className="text-zinc-600 group-hover:text-emerald-500 transition-colors relative z-10" size={32} />
                                                               <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10 group-hover:text-white">{t('cash')}</span>
                                                        </button>
                                                        <button
                                                               onClick={() => handleChargeConfirm('MERCADOPAGO')}
                                                               className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white p-8 rounded-3xl flex flex-col items-center gap-4 transition-all active:scale-95 group relative overflow-hidden"
                                                        >
                                                               <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                                               <Smartphone className="text-zinc-600 group-hover:text-blue-500 transition-colors relative z-10" size={32} />
                                                               <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10 group-hover:text-white">{t('mercadopago')}</span>
                                                        </button>
                                                        <button
                                                               onClick={() => handleChargeConfirm('DEBIT')}
                                                               className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white p-8 rounded-3xl flex flex-col items-center gap-4 transition-all active:scale-95 group relative overflow-hidden"
                                                        >
                                                               <div className="absolute top-0 left-0 w-full h-full bg-purple-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                                               <CreditCard className="text-zinc-600 group-hover:text-purple-500 transition-colors relative z-10" size={32} />
                                                               <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10 group-hover:text-white">{t('debit')}</span>
                                                        </button>
                                                        <button
                                                               onClick={() => handleChargeConfirm('CREDIT')}
                                                               className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white p-8 rounded-3xl flex flex-col items-center gap-4 transition-all active:scale-95 group relative overflow-hidden"
                                                        >
                                                               <div className="absolute top-0 left-0 w-full h-full bg-orange-500/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                                               <CreditCard className="text-zinc-600 group-hover:text-orange-500 transition-colors relative z-10" size={32} />
                                                               <span className="text-[10px] font-black uppercase tracking-[0.3em] relative z-10 group-hover:text-white">{t('credit')}</span>
                                                        </button>
                                                 </div>
                                          </motion.div>
                                   </motion.div>
                            )}
                     </AnimatePresence>
              </div>
       )
}
