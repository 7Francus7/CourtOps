'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ScanBarcode, CupSoda, Package, ArrowRight } from 'lucide-react'
import { CartItem } from './types'

interface CartSidebarProps {
       cart: CartItem[]
       onClose: () => void
       onClearCart: () => void
       onUpdateQuantity: (id: number, delta: number) => void
       onCheckout: (isFastPay?: boolean) => void
}

export function CartSidebar({ cart, onClose, onClearCart, onUpdateQuantity, onCheckout }: CartSidebarProps) {
       const total = cart.reduce((sum, item) => sum + (item.appliedPrice * item.quantity), 0)
       const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

       return (
              <aside className="w-full md:w-[480px] bg-white dark:bg-[#0f172a] flex flex-col shadow-2xl z-20 border-l border-slate-200 dark:border-white/10 h-full relative">
                     <div className="hidden md:flex p-6 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shrink-0">
                            <div>
                                   <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 font-bold mb-1">Punto de Venta</p>
                                   <div className="flex items-center gap-3">
                                          <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">MI CARRITO</h2>
                                          <AnimatePresence>
                                                 {cartCount > 0 && (
                                                        <motion.span
                                                               initial={{ scale: 0 }}
                                                               animate={{ scale: 1 }}
                                                               exit={{ scale: 0 }}
                                                               className="bg-emerald-500 text-white dark:text-black text-xs font-black px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                        >
                                                               {cartCount}
                                                        </motion.span>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </div>
                            <div className="flex gap-2">
                                   <button
                                          onClick={onClose}
                                          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-white/5"
                                          title="Cerrar Kiosco"
                                   >
                                          <X size={18} />
                                   </button>
                                   <button
                                          onClick={onClearCart}
                                          disabled={cart.length === 0}
                                          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 transition-all group disabled:opacity-30 disabled:hover:bg-slate-50 disabled:dark:hover:bg-white/5 disabled:hover:text-slate-400 disabled:dark:hover:text-zinc-500 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-white/5"
                                          title="Vaciar Carrito"
                                   >
                                          <Trash2 size={18} />
                                   </button>
                            </div>
                     </div>

                     {/* Cart Items List */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50 dark:bg-[#030712] custom-scrollbar relative">
                            {/* Inner ambient glow */}
                            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white dark:from-[#0f172a] to-transparent opacity-50 pointer-events-none" />

                            <AnimatePresence mode='popLayout'>
                                   {cart.length === 0 ? (
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 opacity-80"
                                          >
                                                 <ScanBarcode size={64} className="mb-6 stroke-1 text-slate-300 dark:text-zinc-700" />
                                                 <p className="text-sm font-bold uppercase tracking-widest text-center">Escanea productos<br />o selecciona del catálogo</p>
                                          </motion.div>
                                   ) : (
                                          cart.map(item => (
                                                 <motion.div
                                                        layout
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="bg-white dark:bg-white/5 rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors relative overflow-hidden group backdrop-blur-sm"
                                                 >
                                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-black/40 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 transition-colors">
                                                               {item.category.toLowerCase().includes('bebida') ? <CupSoda className="text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" size={24} /> : <Package className="text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" size={24} />}
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 z-10">
                                                               <div className="flex justify-between items-start gap-2">
                                                                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{item.name}</h4>
                                                                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-base bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 shadow-inner">${(item.appliedPrice * item.quantity).toLocaleString()}</span>
                                                               </div>

                                                               <div className="flex justify-between items-end mt-2">
                                                                      <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium tracking-wide">Unidad: ${item.appliedPrice.toLocaleString()}</p>
                                                                      <div className="flex items-center bg-slate-50 dark:bg-black/40 rounded-lg p-0.5 border border-slate-200 dark:border-white/10 shadow-inner">
                                                                             <button
                                                                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                                                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                                                             >
                                                                                    <span className="text-base font-bold">-</span>
                                                                             </button>
                                                                             <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                                                             <button
                                                                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                                                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                                                             >
                                                                                    <span className="text-base font-bold">+</span>
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </motion.div>
                                          ))
                                   )}
                            </AnimatePresence>
                     </div>

                     {/* Total & Action */}
                     <div className="p-6 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.5)] relative z-30 shrink-0 space-y-5">

                            <div className="space-y-2 relative">
                                   <div className="flex justify-between items-center text-sm">
                                          <span className="text-slate-500 dark:text-zinc-400 font-medium">Subtotal</span>
                                          <span className="text-slate-700 dark:text-zinc-300 font-medium">${total.toLocaleString('es-AR')}</span>
                                   </div>
                                   <div className="flex justify-between items-end">
                                          <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-500 uppercase pb-1.5 drop-shadow-sm">Total a Pagar</span>
                                          <div className="text-right">
                                                 <motion.span
                                                        key={total}
                                                        initial={{ scale: 1.2, color: "#10b981" }}
                                                        animate={{ scale: 1, color: "#34d399" }}
                                                        className="block text-4xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:drop-shadow-[0_0_20px_rgba(52,211,153,0.4)] tabular-nums"
                                                 >
                                                        ${total.toLocaleString('es-AR')}
                                                 </motion.span>
                                          </div>
                                   </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                   <button
                                          onClick={() => onCheckout(true)} // Pass true for fast pay, or handle differently
                                          disabled={cart.length === 0}
                                          className="flex-1 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold py-4 rounded-xl flex flex-col items-center justify-center transition-all active:scale-[0.98] group relative overflow-hidden backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/50"
                                          title="Cobro rápido en efectivo"
                                   >
                                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-100 to-transparent dark:from-emerald-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-0.5 transition-colors">Rápido</span>
                                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 group-hover:brightness-110 dark:group-hover:brightness-125 transition-all text-sm">
                                                 EFECTIVO
                                          </span>
                                   </button>

                                   <button
                                          onClick={() => onCheckout(false)}
                                          disabled={cart.length === 0}
                                          className="flex-[2] bg-emerald-500 hover:brightness-110 disabled:bg-slate-200 disabled:dark:bg-zinc-800 disabled:text-slate-400 disabled:dark:text-zinc-500 disabled:cursor-not-allowed text-white dark:text-black text-lg font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-between px-6 group transition-all transform active:scale-[0.98]"
                                   >
                                          <span className="uppercase tracking-wide">COBRAR</span>
                                          <div className="bg-black/10 rounded-lg p-1.5 group-hover:bg-black/20 transition-colors">
                                                 <ArrowRight className="text-white dark:text-black block w-5 h-5" />
                                          </div>
                                   </button>
                            </div>
                     </div>
              </aside>
       )
}
