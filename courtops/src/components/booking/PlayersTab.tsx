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
              <div className="flex flex-col gap-8 p-4 md:p-8 bg-slate-50/50 dark:bg-background/50 relative min-h-[600px]">
                     {/* PROGRESS BAR */}
                     <div className="bg-white dark:bg-card p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="flex justify-between items-end mb-4">
                                   <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground tracking-[0.2em] uppercase">{t('payment_progress')}</span>
                                   <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                          ${totalPaidAmount.toLocaleString()}
                                          <span className="text-sm text-slate-400 dark:text-muted-foreground ml-1">/ ${totalAmount.toLocaleString()}</span>
                                   </span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden p-1">
                                   <div
                                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/20 relative"
                                          style={{ width: `${progressPercent}%` }}
                                   >
                                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                                   </div>
                            </div>
                     </div>

                     {/* CONFIGURATION AND SUMMARY */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Summary Card */}
                            <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                                   <div>
                                          <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-2">{t('court_shared_kiosk')}</p>
                                          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                 ${(baseBookingPrice + sharedTotal).toLocaleString()}
                                          </div>
                                   </div>
                                   <div className="mt-6 flex gap-2">
                                          <button
                                                 onClick={() => handleReset()}
                                                 className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                          >
                                                 <RefreshCw className="w-3.5 h-3.5" />
                                                 {t('distribute_equally')}
                                          </button>
                                   </div>
                            </div>

                            {/* Player Control */}
                            <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center">
                                   <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{localPlayerCount}</span>
                                   <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-6">{t('players')}</p>

                                   <div className="flex items-center gap-3 w-full">
                                          <button
                                                 onClick={() => {
                                                        const newCount = Math.max(1, localPlayerCount - 1)
                                                        setLocalPlayerCount(newCount)
                                                        // Optional: auto-remove last player if desired, or let user click distribute
                                                        const newPlayers = players.slice(0, newCount)
                                                        setPlayers(newPlayers)
                                                 }}
                                                 className="flex-1 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
                                          >
                                                 <Minus className="w-5 h-5 text-slate-900 dark:text-white" />
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
                                                 className="flex-1 h-12 rounded-xl bg-slate-900 dark:bg-white border border-transparent flex items-center justify-center hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-none"
                                          >
                                                 <Plus className="w-5 h-5 text-white dark:text-black" />
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* PLAYERS LIST & SAVE */}
                     <div className="space-y-4 pb-20">
                            <div className="flex justify-between items-center px-2">
                                   <h3 className="text-[10px] font-bold text-slate-500 dark:text-muted-foreground uppercase tracking-widest">{t('player_details')}</h3>
                                   <button
                                          onClick={async () => {
                                                 const res = await onSave();
                                          }}
                                          className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase hover:text-blue-500 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg"
                                   >
                                          <Save className="w-3.5 h-3.5" /> {t('save_names')}
                                   </button>
                            </div>

                            <div className="space-y-4">
                                   {players.map((p, i) => {
                                          const extras = getExtrasForPlayer(p.name)

                                          return (
                                                 <div key={i} className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm transition-all hover:border-[var(--primary)]/50 dark:hover:border-[var(--primary)]/30 group">
                                                        <div className="p-5 flex items-center justify-between gap-4">
                                                               <div className="flex flex-col flex-1 min-w-0">
                                                                      <label className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">{t('player_name')}</label>
                                                                      <input
                                                                             value={p.name}
                                                                             onChange={(e) => {
                                                                                    const newP = [...players]
                                                                                    newP[i].name = e.target.value
                                                                                    setPlayers(newP)
                                                                             }}
                                                                             className="text-base font-bold text-slate-900 dark:text-white bg-transparent outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-muted-foreground/20 leading-none py-1 border-b-2 border-transparent focus:border-[var(--primary)] w-full"
                                                                             placeholder={t('enter_name')}
                                                                      />
                                                                      <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mt-2.5">
                                                                             ${p.amount.toLocaleString()}
                                                                      </span>
                                                               </div>

                                                               <div className="flex items-center gap-2 shrink-0">
                                                                      {p.isPaid ? (
                                                                             <div className="flex flex-col items-end">
                                                                                    <div className="h-10 px-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase">
                                                                                           <CheckCircle className="w-3.5 h-3.5" /> {t('paid')}
                                                                                    </div>
                                                                                    <span className="text-[9px] text-slate-400 dark:text-muted-foreground/60 mt-1.5 uppercase font-bold tracking-wider">{p.paymentMethod || 'CASH'}</span>
                                                                             </div>
                                                                      ) : (
                                                                             <div className="flex gap-2">
                                                                                    <button
                                                                                           onClick={() => handleChargeConfirm('CASH', p, i)}
                                                                                           className="h-10 w-10 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/20 transition-colors"
                                                                                           title={t('quick_cash_pay')}
                                                                                    >
                                                                                           <Wallet size={16} />
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => handleOpenPayment(i)}
                                                                                           className="h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-[0.95] transition-all"
                                                                                    >
                                                                                           {t('charge')}
                                                                                    </button>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>

                                                        {(sharedPerPlayer > 0 || extras.length > 0) && (
                                                               <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#18181b]/50 space-y-2.5">
                                                                      {sharedPerPlayer > 0 && (
                                                                             <div className="flex justify-between items-center text-[10px]">
                                                                                    <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground">
                                                                                           <Users className="w-3.5 h-3.5" />
                                                                                           <span className="font-bold uppercase tracking-wider">{t('shared_rental')}</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-slate-700 dark:text-slate-300">${sharedPerPlayer.toLocaleString()}</span>
                                                                             </div>
                                                                      )}
                                                                      {extras.length > 0 && (
                                                                             <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-white/5">
                                                                                    <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-muted-foreground">
                                                                                           <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                                                                                           <span className="text-[9px] font-bold uppercase tracking-wider">{t('individual_extras')}</span>
                                                                                    </div>
                                                                                    {extras.map((item, idx) => (
                                                                                           <div key={idx} className="flex justify-between text-[10px]">
                                                                                                  <span className="text-slate-500 dark:text-muted-foreground font-medium">{item.productName} (x{item.quantity})</span>
                                                                                                  <span className="text-slate-900 dark:text-white font-black">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                                           </div>
                                                                                    ))}
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        )}
                                                 </div>
                                          )
                                   })}

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
                                          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-muted-foreground hover:border-[var(--primary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest group"
                                   >
                                          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                          {t('add_player')}
                                   </button>
                            </div>

                            {/* PAYMENT MODAL OVERLAY */}
                            <AnimatePresence>
                                   {paymentModal.isOpen && paymentModal.player && (
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="absolute inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                                          >
                                                 <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="bg-white dark:bg-[#18181b] w-full max-w-sm border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
                                                 >
                                                        {processingPayment && (
                                                               <div className="absolute inset-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
                                                                      <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                                                               </div>
                                                        )}

                                                        <button
                                                               onClick={() => setPaymentModal({ isOpen: false, playerIndex: null, player: null })}
                                                               className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors"
                                                        >
                                                               <X size={20} />
                                                        </button>

                                                        <div className="text-center mb-8 mt-2">
                                                               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground mb-2">{t('charge_to')}</h3>
                                                               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{paymentModal.player.name}</h2>

                                                               <div className="inline-block px-6 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                                                      <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                                             ${paymentModal.player.amount.toLocaleString()}
                                                                      </span>
                                                               </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                               <button
                                                                      onClick={() => handleChargeConfirm('CASH')}
                                                                      className="bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-foreground p-4 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 group"
                                                               >
                                                                      <Wallet className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" size={24} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest">{t('cash')}</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('MERCADOPAGO')}
                                                                      className="bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-foreground p-4 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 group"
                                                               >
                                                                      <Smartphone className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" size={24} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest">{t('mercadopago')}</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('DEBIT')}
                                                                      className="bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-foreground p-4 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 group"
                                                               >
                                                                      <CreditCard className="text-slate-400 dark:text-slate-500 group-hover:text-purple-500 transition-colors" size={24} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest">{t('debit')}</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('CREDIT')}
                                                                      className="bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-foreground p-4 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95 group"
                                                               >
                                                                      <CreditCard className="text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" size={24} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest">{t('credit')}</span>
                                                               </button>
                                                        </div>
                                                 </motion.div>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </div>
              </div>
       )
}
