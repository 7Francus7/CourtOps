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
              <aside className="w-full md:w-[480px] bg-[#121214] flex flex-col shadow-2xl z-20 border-l border-white/5 h-full">
                     <div className="hidden md:flex p-6 items-center justify-between border-b border-white/5 bg-[#121214] shrink-0">
                            <div>
                                   <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Punto de Venta</p>
                                   <div className="flex items-center gap-3">
                                          <h2 className="text-2xl font-black italic tracking-tighter text-white">MI CARRITO</h2>
                                          <AnimatePresence>
                                                 {cartCount > 0 && (
                                                        <motion.span
                                                               initial={{ scale: 0 }}
                                                               animate={{ scale: 1 }}
                                                               exit={{ scale: 0 }}
                                                               className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-blue-600/40"
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
                                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-zinc-500"
                                          title="Cerrar Kiosco"
                                   >
                                          <X size={18} />
                                   </button>
                                   <button
                                          onClick={onClearCart}
                                          disabled={cart.length === 0}
                                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all group disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-zinc-500 text-zinc-500"
                                          title="Vaciar Carrito"
                                   >
                                          <Trash2 size={18} />
                                   </button>
                            </div>
                     </div>

                     {/* Cart Items List */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#121214] custom-scrollbar">
                            <AnimatePresence mode='popLayout'>
                                   {cart.length === 0 ? (
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50"
                                          >
                                                 <ScanBarcode size={64} className="mb-6 stroke-1" />
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
                                                        className="bg-[#18181B] rounded-2xl p-4 flex gap-4 shadow-sm border border-white/5 group hover:border-white/10 transition-colors relative overflow-hidden"
                                                 >
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                        <div className="w-16 h-16 rounded-xl bg-[#121214] flex items-center justify-center shrink-0 border border-white/5">
                                                               {item.category.toLowerCase().includes('bebida') ? <CupSoda className="text-zinc-500" size={24} /> : <Package className="text-zinc-500" size={24} />}
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                                               <div className="flex justify-between items-start gap-2">
                                                                      <h4 className="font-bold text-gray-200 text-sm line-clamp-2 leading-snug">{item.name}</h4>
                                                                      <span className="font-bold text-white text-base bg-white/5 px-2 py-0.5 rounded-lg">${item.appliedPrice * item.quantity}</span>
                                                               </div>

                                                               <div className="flex justify-between items-end mt-2">
                                                                      <p className="text-[11px] text-zinc-500 font-medium">Unidad: ${item.appliedPrice}</p>
                                                                      <div className="flex items-center bg-[#121214] rounded-lg p-0.5 border border-white/5">
                                                                             <button
                                                                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all"
                                                                             >
                                                                                    <span className="text-base font-bold">-</span>
                                                                             </button>
                                                                             <span className="w-8 text-center text-sm font-bold font-mono text-white">{item.quantity}</span>
                                                                             <button
                                                                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all"
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
                     <div className="p-6 bg-[#18181B] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-30 shrink-0 space-y-4">

                            <div className="space-y-2">
                                   <div className="flex justify-between items-center text-sm">
                                          <span className="text-zinc-500 font-medium">Subtotal</span>
                                          <span className="font-mono text-zinc-400 font-medium">${total.toLocaleString('es-AR')}</span>
                                   </div>
                                   <div className="flex justify-between items-end">
                                          <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase pb-1">Total a Pagar</span>
                                          <div className="text-right">
                                                 <motion.span
                                                        key={total}
                                                        initial={{ scale: 1.2, color: "#fff" }}
                                                        animate={{ scale: 1, color: "#D4FF00" }}
                                                        className="block text-4xl font-black text-[#D4FF00] drop-shadow-[0_0_15px_rgba(212,255,0,0.3)] tabular-nums"
                                                 >
                                                        ${total.toLocaleString('es-AR')}
                                                 </motion.span>
                                          </div>
                                   </div>
                            </div>

                            <div className="flex gap-3">
                                   <button
                                          onClick={() => onCheckout(true)} // Pass true for fast pay, or handle differently
                                          disabled={cart.length === 0}
                                          className="flex-1 bg-[#27272a] hover:bg-[#3f3f46] text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold py-4 rounded-xl shadow-lg border border-white/5 flex flex-col items-center justify-center transition-all active:scale-[0.98] group"
                                          title="Cobro rápido en efectivo"
                                   >
                                          <span className="text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 mb-0.5">Rápido</span>
                                          <span className="flex items-center gap-1.5 text-emerald-500 group-hover:text-emerald-400">
                                                 <span className="material-icons text-base">payments</span>
                                                 EFECTIVO
                                          </span>
                                   </button>

                                   <button
                                          onClick={() => onCheckout(false)}
                                          disabled={cart.length === 0}
                                          className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-between px-6 group transition-all transform active:scale-[0.98]"
                                   >
                                          <span>COBRAR</span>
                                          <div className="bg-white/20 rounded-lg p-1.5 group-hover:bg-white/30 transition-colors">
                                                 <ArrowRight className="text-white block w-5 h-5" />
                                          </div>
                                   </button>
                            </div>
                     </div>
              </aside>
       )
}
