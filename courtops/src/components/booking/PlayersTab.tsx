'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Plus, Minus, RefreshCw, Save, ShoppingCart, Users, X, DollarSign, Wallet, CreditCard, Smartphone } from 'lucide-react'
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
              const newPlayers = Array.from({ length: newCount }).map((_, i) => {
                     const pName = players[i]?.name || (i === 0 ? 'Titular' : `Jugador ${i + 1}`)
                     const extras = getExtrasTotalForPlayer(pName)
                     return {
                            name: pName,
                            amount: basePricePerPlayer + sharedPerPlayer + extras,
                            isPaid: false,
                            paymentMethod: null
                     }
              })
              setPlayers(newPlayers)
       }

       useEffect(() => {
              if (players.length === 0) {
                     handleReset(4)
              }
       }, [])

       const totalPaidAmount = players.reduce((sum, p) => p.isPaid ? sum + p.amount : sum, 0)
       const progressPercent = Math.min((totalPaidAmount / totalAmount) * 100, 100)

       const handleOpenPayment = (index: number) => {
              // Ensure we save the split configuration first if it's new?
              // For now, allow charging directly. The action creates the player if missing.
              setPaymentModal({
                     isOpen: true,
                     playerIndex: index,
                     player: players[index]
              })
       }

       const handleChargeConfirm = async (method: string) => {
              if (!paymentModal.player) return

              setProcessingPayment(true)
              try {
                     const res = await chargePlayer(bookingId, paymentModal.player.name, paymentModal.player.amount, method)

                     if (res.success) {
                            toast.success(`${t('payment_registered')} ${paymentModal.player.name}`)

                            // Update local state
                            const newPlayers = [...players]
                            if (paymentModal.playerIndex !== null) {
                                   newPlayers[paymentModal.playerIndex] = {
                                          ...newPlayers[paymentModal.playerIndex],
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
              <div className="flex flex-col gap-8 p-4 md:p-8 bg-white dark:bg-background relative min-h-[600px]">
                     {/* PROGRESS BAR */}
                     <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black text-slate-700 dark:text-blue-400 tracking-[0.2em] uppercase">{t('payment_progress')}</span>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                   ${totalPaidAmount.toLocaleString()}
                                   <span className="text-slate-600 dark:text-muted-foreground ml-1">/ ${totalAmount.toLocaleString()}</span>
                            </span>
                     </div>
                     <div className="h-3 w-full bg-slate-200 dark:bg-muted/50 rounded-full overflow-hidden shadow-inner">
                            <div
                                   className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] rounded-full transition-all duration-700 ease-out"
                                   style={{ width: `${progressPercent}%` }}
                            ></div>
                     </div>

                     {/* CONFIGURATION CARD */}
                     <div className="bg-slate-50 dark:bg-card border-2 border-slate-200 dark:border-border rounded-3xl p-10 shadow-xl shadow-slate-900/5">
                            <h3 className="text-center text-[10px] font-black text-slate-700 dark:text-blue-400 uppercase tracking-[0.3em] mb-8">{t('configure_split')}</h3>

                            <div className="flex items-center justify-center gap-10 mb-10">
                                   <button
                                          onClick={() => setLocalPlayerCount(Math.max(1, localPlayerCount - 1))}
                                          className="w-16 h-16 rounded-full bg-white dark:bg-black border-2 border-slate-300 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-100 hover:border-slate-400 dark:hover:bg-muted/50 transition-all group shadow-lg active:scale-90"
                                   >
                                          <Minus className="text-slate-600 dark:text-muted-foreground/60 group-hover:text-slate-900 dark:group-hover:text-white" />
                                   </button>
                                   <div className="text-center">
                                          <span className="text-7xl font-black italic tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">{localPlayerCount}</span>
                                          <p className="text-[10px] uppercase font-black text-slate-600 dark:text-muted-foreground/60 tracking-[0.2em] mt-2">{t('players')}</p>
                                   </div>
                                   <button
                                          onClick={() => setLocalPlayerCount(localPlayerCount + 1)}
                                          className="w-16 h-16 rounded-full bg-white dark:bg-black border-2 border-slate-300 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-100 hover:border-slate-400 dark:hover:bg-muted/50 transition-all group shadow-lg active:scale-90"
                                   >
                                          <Plus className="text-slate-600 dark:text-muted-foreground/60 group-hover:text-slate-900 dark:group-hover:text-white" />
                                   </button>
                            </div>

                            <div className="bg-white dark:bg-muted/50 rounded-3xl p-8 text-center mb-8 relative overflow-hidden group border-2 border-slate-200 dark:border-transparent shadow-lg">
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-[var(--primary)]/5 dark:bg-blue-500/10 blur-xl rounded-full pointer-events-none"></div>
                                   <p className="text-[10px] font-black text-slate-600 dark:text-muted-foreground/60 uppercase tracking-widest relative z-10 mb-2">{t('court_shared_kiosk')}</p>
                                   <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">
                                          ${(basePricePerPlayer + sharedPerPlayer).toLocaleString()}
                                   </div>
                            </div>

                            <button
                                   onClick={() => handleReset()}
                                   className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-400 dark:hover:to-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center gap-3 transition-all active:scale-[0.97] uppercase tracking-widest text-xs"
                            >
                                   <RefreshCw className="w-4 h-4" />
                                   {t('recalculate_splits')}
                            </button>
                     </div>

                     {/* PLAYERS LIST & SAVE */}
                     <div className="space-y-4 pb-20">
                            <div className="flex justify-between items-center px-1">
                                   <h3 className="text-[10px] font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-widest">{t('player_details')}</h3>
                                   <button
                                          onClick={async () => {
                                                 const res = await onSave();
                                          }}
                                          className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                   >
                                          <Save className="w-3.5 h-3.5" /> {t('save_names')}
                                   </button>
                            </div>

                            <div className="space-y-4">
                                   {players.map((p, i) => {
                                          const extras = getExtrasForPlayer(p.name)

                                          return (
                                                 <div key={i} className="bg-white dark:bg-card rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-border shadow-lg shadow-slate-900/5 transition-all hover:border-blue-400/50 group">
                                                        <div className="p-6 flex items-center justify-between">
                                                               <div className="flex flex-col flex-1 mr-4">
                                                                      <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">{t('player_name')}</label>
                                                                      <input
                                                                             value={p.name}
                                                                             onChange={(e) => {
                                                                                    const newP = [...players]
                                                                                    newP[i].name = e.target.value
                                                                                    setPlayers(newP)
                                                                             }}
                                                                             className="text-base font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-zinc-700 outline-none py-1 transition-colors focus:border-blue-500 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-muted-foreground/40"
                                                                             placeholder={t('enter_name')}
                                                                      />
                                                                      <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none mt-3">
                                                                             ${p.amount.toLocaleString()}
                                                                      </span>
                                                               </div>
                                                               {p.isPaid ? (
                                                                      <div className="flex flex-col items-end">
                                                                             <div
                                                                                    className="h-12 px-5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-2 border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase shadow-sm"
                                                                             >
                                                                                    <CheckCircle className="w-4 h-4" /> {t('paid')}
                                                                             </div>
                                                                             <span className="text-[9px] text-slate-500 dark:text-muted-foreground mt-2 uppercase font-black tracking-widest">{p.paymentMethod || 'CASH'}</span>
                                                                      </div>
                                                               ) : (
                                                                      <button
                                                                             onClick={() => handleOpenPayment(i)}
                                                                             className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-[0.95] transition-all"
                                                                      >
                                                                             {t('charge')}
                                                                      </button>
                                                               )}
                                                        </div>

                                                        {(sharedPerPlayer > 0 || extras.length > 0) && (
                                                               <div className="px-6 pb-6 pt-4 border-t-2 border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/20 space-y-3">
                                                                      {sharedPerPlayer > 0 && (
                                                                             <div className="flex justify-between items-center text-[10px]">
                                                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-500">
                                                                                           <Users className="w-3.5 h-3.5" />
                                                                                           <span className="font-black uppercase tracking-widest">{t('shared_rental')}</span>
                                                                                    </div>
                                                                                    <span className="font-black text-slate-900 dark:text-white">${sharedPerPlayer.toLocaleString()}</span>
                                                                             </div>
                                                                      )}
                                                                      {extras.length > 0 && (
                                                                             <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-border/50">
                                                                                    <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-500">
                                                                                           <ShoppingCart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500/70" />
                                                                                           <span className="text-[9px] font-black uppercase tracking-widest">{t('individual_extras')}</span>
                                                                                    </div>
                                                                                    {extras.map((item, idx) => (
                                                                                           <div key={idx} className="flex justify-between text-[10px]">
                                                                                                  <span className="text-slate-500 dark:text-muted-foreground font-bold">{item.productName} (x{item.quantity})</span>
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
                            </div>

                            {/* PAYMENT MODAL OVERLAY */}
                            <AnimatePresence>
                                   {paymentModal.isOpen && paymentModal.player && (
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 rounded-3xl"
                                          >
                                                 <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="bg-white dark:bg-card w-full max-w-sm border border-slate-200 dark:border-border rounded-2xl shadow-2xl p-6 relative"
                                                 >
                                                        {processingPayment && (
                                                               <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                                                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                                               </div>
                                                        )}

                                                        <button
                                                               onClick={() => setPaymentModal({ isOpen: false, playerIndex: null, player: null })}
                                                               className="absolute top-4 right-4 text-slate-400 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground transition-colors"
                                                        >
                                                               <X size={20} />
                                                        </button>

                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-1">{t('charge_to')} {paymentModal.player.name}</h3>
                                                        <p className="text-slate-500 dark:text-muted-foreground/60 text-xs mb-6">{t('select_payment_method')}</p>

                                                        <div className="text-center mb-8">
                                                               <span className="text-4xl font-black text-slate-900 dark:text-foreground tracking-tighter">
                                                                      ${paymentModal.player.amount.toLocaleString()}
                                                               </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                               <button
                                                                      onClick={() => handleChargeConfirm('CASH')}
                                                                      className="bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-muted/80 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <Wallet className="text-emerald-500" />
                                                                      <span className="text-xs font-bold uppercase">{t('cash')}</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('MERCADOPAGO')}
                                                                      className="bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-muted/80 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <Smartphone className="text-blue-500" />
                                                                      <span className="text-xs font-bold uppercase">{t('mercadopago')}</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('DEBIT')}
                                                                      className="bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-muted/80 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <CreditCard className="text-purple-500" />
                                                                      <span className="text-xs font-bold uppercase">{t('debit')}</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('CREDIT')}
                                                                      className="bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-muted/80 border border-slate-200 dark:border-border text-slate-900 dark:text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <CreditCard className="text-orange-500" />
                                                                      <span className="text-xs font-bold uppercase">{t('credit')}</span>
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
