'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Plus, Minus, RefreshCw, Save, ShoppingCart, Users, X, DollarSign, Wallet, CreditCard, Smartphone } from 'lucide-react'
import { chargePlayer } from '@/actions/manageBooking'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
                            toast.success(`Cobro registrado a ${paymentModal.player.name}`)

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
                            toast.error(res.error || 'Error al procesar cobro')
                     }
              } catch (error) {
                     toast.error('Error de conexión')
              } finally {
                     setProcessingPayment(false)
              }
       }

       return (
              <div className="flex flex-col gap-6 p-6 bg-background relative min-h-[500px]">
                     {/* PROGRESS BAR */}
                     <div>
                            <div className="flex justify-between items-end mb-2">
                                   <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Progreso de cobro</span>
                                   <span className="text-xs font-bold text-white">${totalPaidAmount.toLocaleString()} <span className="text-muted-foreground">/ ${totalAmount.toLocaleString()}</span></span>
                            </div>
                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                   <div
                                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full transition-all duration-500"
                                          style={{ width: `${progressPercent}%` }}
                                   ></div>
                            </div>
                     </div>

                     {/* CONFIGURATION CARD */}
                     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">Configurar División</h3>

                            <div className="flex items-center justify-center gap-8 mb-8">
                                   <button
                                          onClick={() => setLocalPlayerCount(Math.max(1, localPlayerCount - 1))}
                                          className="w-12 h-12 rounded-full bg-black border border-zinc-800 flex items-center justify-center hover:bg-muted/50 transition-colors group"
                                   >
                                          <Minus className="text-muted-foreground/60 group-hover:text-white" />
                                   </button>
                                   <div className="text-center">
                                          <span className="text-6xl font-bold italic text-white drop-shadow-sm">{localPlayerCount}</span>
                                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mt-1">Jugadores</p>
                                   </div>
                                   <button
                                          onClick={() => setLocalPlayerCount(localPlayerCount + 1)}
                                          className="w-12 h-12 rounded-full bg-black border border-zinc-800 flex items-center justify-center hover:bg-muted/50 transition-colors group"
                                   >
                                          <Plus className="text-muted-foreground/60 group-hover:text-white" />
                                   </button>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-5 text-center mb-6 relative overflow-hidden group">
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-blue-500/10 blur-xl rounded-full pointer-events-none"></div>
                                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider relative z-10">Cancha + Kiosco Compartido</p>
                                   <div className="text-4xl font-bold text-white italic tracking-wide mt-1 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                          ${(basePricePerPlayer + sharedPerPlayer).toLocaleString()}
                                   </div>
                            </div>

                            <button
                                   onClick={() => handleReset()}
                                   className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                   <RefreshCw className="w-5 h-5 animate-spin-slow" />
                                   RECALCULAR DIVISIONES
                            </button>
                     </div>

                     {/* PLAYERS LIST & SAVE */}
                     <div className="space-y-4 pb-20">
                            <div className="flex justify-between items-center px-1">
                                   <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detalle por Jugador</h3>
                                   <button
                                          onClick={async () => {
                                                 const res = await onSave();
                                          }}
                                          className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors"
                                   >
                                          <Save className="w-3.5 h-3.5" /> Guardar Nombres
                                   </button>
                            </div>

                            <div className="space-y-3">
                                   {players.map((p, i) => {
                                          const extras = getExtrasForPlayer(p.name)

                                          return (
                                                 <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm transition-all hover:border-primary/30">
                                                        <div className="p-4 flex items-center justify-between">
                                                               <div className="flex flex-col">
                                                                      <input
                                                                             value={p.name}
                                                                             onChange={(e) => {
                                                                                    const newP = [...players]
                                                                                    newP[i].name = e.target.value
                                                                                    setPlayers(newP)
                                                                             }}
                                                                             className="text-[10px] font-bold text-muted-foreground bg-transparent border-none outline-none uppercase tracking-widest mb-1 w-32 focus:text-blue-400 transition-colors"
                                                                      />
                                                                      <span className="text-xl font-bold italic tracking-tighter text-white">
                                                                             ${p.amount.toLocaleString()}
                                                                      </span>
                                                               </div>
                                                               {p.isPaid ? (
                                                                      <div className="flex flex-col items-end">
                                                                             <button
                                                                                    disabled
                                                                                    className="h-10 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase cursor-default"
                                                                             >
                                                                                    <CheckCircle className="w-4 h-4" /> PAGADO
                                                                             </button>
                                                                             <span className="text-[9px] text-muted-foreground mt-1 uppercase font-bold">{p.paymentMethod || 'CASH'}</span>
                                                                      </div>
                                                               ) : (
                                                                      <button
                                                                             onClick={() => handleOpenPayment(i)}
                                                                             className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                                                                      >
                                                                             COBRAR
                                                                      </button>
                                                               )}
                                                        </div>

                                                        {(sharedPerPlayer > 0 || extras.length > 0) && (
                                                               <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20 space-y-2">
                                                                      {sharedPerPlayer > 0 && (
                                                                             <div className="flex justify-between items-center text-[10px] opacity-70">
                                                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                                           <Users className="w-3 h-3" />
                                                                                           <span className="font-bold">COMPARTIDO</span>
                                                                                    </div>
                                                                                    <span className="font-bold text-white">${sharedPerPlayer.toLocaleString()}</span>
                                                                             </div>
                                                                      )}
                                                                      {extras.length > 0 && (
                                                                             <div className="space-y-1 pt-1 border-t border-border/50">
                                                                                    <div className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                                                                                           <ShoppingCart className="w-3 h-3 text-blue-500" />
                                                                                           <span className="text-[8px] font-bold uppercase">EXTRAS INDIVIDUALES</span>
                                                                                    </div>
                                                                                    {extras.map((item, idx) => (
                                                                                           <div key={idx} className="flex justify-between text-[10px]">
                                                                                                  <span className="text-muted-foreground/60 font-medium">{item.productName} (x{item.quantity})</span>
                                                                                                  <span className="text-white font-bold">${(item.unitPrice * item.quantity).toLocaleString()}</span>
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
                                                 className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 rounded-3xl"
                                          >
                                                 <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="bg-card w-full max-w-sm border border-border rounded-2xl shadow-2xl p-6 relative"
                                                 >
                                                        {processingPayment && (
                                                               <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                                                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                                               </div>
                                                        )}

                                                        <button
                                                               onClick={() => setPaymentModal({ isOpen: false, playerIndex: null, player: null })}
                                                               className="absolute top-4 right-4 text-muted-foreground hover:text-white"
                                                        >
                                                               <X size={20} />
                                                        </button>

                                                        <h3 className="text-lg font-bold text-white mb-1">Cobrar a {paymentModal.player.name}</h3>
                                                        <p className="text-muted-foreground/60 text-xs mb-6">Selecciona el método de pago para registrar el cobro.</p>

                                                        <div className="text-center mb-8">
                                                               <span className="text-4xl font-black text-white tracking-tighter">
                                                                      ${paymentModal.player.amount.toLocaleString()}
                                                               </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                               <button
                                                                      onClick={() => handleChargeConfirm('CASH')}
                                                                      className="bg-muted hover:bg-muted/80 border border-border text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <Wallet className="text-emerald-500" />
                                                                      <span className="text-xs font-bold uppercase">Efectivo</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('MERCADOPAGO')}
                                                                      className="bg-muted hover:bg-muted/80 border border-border text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <Smartphone className="text-blue-500" />
                                                                      <span className="text-xs font-bold uppercase">Mercado Pago</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('DEBIT')}
                                                                      className="bg-muted hover:bg-muted/80 border border-border text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <CreditCard className="text-purple-500" />
                                                                      <span className="text-xs font-bold uppercase">Débito</span>
                                                               </button>
                                                               <button
                                                                      onClick={() => handleChargeConfirm('CREDIT')}
                                                                      className="bg-muted hover:bg-muted/80 border border-border text-foreground p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                                                               >
                                                                      <CreditCard className="text-orange-500" />
                                                                      <span className="text-xs font-bold uppercase">Crédito</span>
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
