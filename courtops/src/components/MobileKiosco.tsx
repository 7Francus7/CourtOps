'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
       Search,
       ShoppingCart,
       X,
       ChevronLeft,
       Plus,
       Minus,
       PackagePlus,
       Zap,
       User,
       CreditCard,
       Banknote,
       Sparkles,
       Trash2
} from 'lucide-react'
import { useKiosk } from '@/hooks/useKiosk'
import { KioscoSuccessOverlay } from './kiosco/KioscoSuccessOverlay'

type Props = {
       isOpen: boolean
       onClose: () => void
}

export default function MobileKiosco({ isOpen, onClose }: Props) {
       const {
              loading,
              cart,
              setCart,
              addToCart,
              updateQuantity,
              cartTotal,
              searchTerm,
              setSearchTerm,
              selectedCategory,
              setSelectedCategory,
              categories,
              filteredProducts,
              selectedClient,
              setSelectedClient,
              clientSearch,
              setClientSearch,
              clients,
              isClientDropdownOpen,
              setIsClientDropdownOpen,
              processing,
              handleFinalizeSale,
              allowCredit,
              suggestedProduct,
              setSuggestedProduct,
              refresh
       } = useKiosk()

       const [showCart, setShowCart] = useState(false)
       const [showSuccess, setShowSuccess] = useState(false)
       const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'TRANSFER' | 'ACCOUNT'>('CASH')

       const onFinalize = async () => {
              const success = await handleFinalizeSale([{ method: selectedMethod, amount: cartTotal }])
              if (success) {
                     setShowSuccess(true)
                     setShowCart(false)
              }
       }

       if (!isOpen) return null

       const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

       return (
              <motion.div
                     initial={{ x: '100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '100%' }}
                     transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                     className="fixed inset-0 z-[100] bg-slate-50 dark:bg-[#030712] flex flex-col h-screen w-screen overflow-hidden antialiased"
              >
                     {/* Mobile Header */}
                     <header className="shrink-0 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5 sticky top-0 z-40">
                            <div className="flex items-center gap-3">
                                   <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 dark:text-zinc-400">
                                          <ChevronLeft size={20} />
                                   </button>
                                   <div>
                                          <h1 className="font-black text-lg tracking-tight">KIOSKO</h1>
                                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Punto de Venta</p>
                                   </div>
                            </div>
                            <div className="flex items-center gap-2">
                                   {selectedClient && (
                                          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20" onClick={() => setSelectedClient(null)}>
                                                 <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[80px]">{selectedClient.name}</span>
                                                 <X size={10} className="text-emerald-500" />
                                          </div>
                                   )}
                                   <button onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 hover:text-emerald-500 transition-colors">
                                          <User size={20} />
                                   </button>
                            </div>
                     </header>

                     {/* Search & Categories */}
                     <div className="shrink-0 p-4 space-y-4">
                            <div className="relative group">
                                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-4 h-4" />
                                   <input
                                          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                          placeholder="Buscar producto..."
                                          type="text"
                                          value={searchTerm}
                                          onChange={e => setSearchTerm(e.target.value)}
                                   />
                            </div>

                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                   {categories.map(cat => (
                                          <button
                                                 key={cat}
                                                 onClick={() => setSelectedCategory(cat)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap uppercase tracking-wider",
                                                        selectedCategory === cat
                                                               ? "bg-emerald-500 text-white dark:text-black border-emerald-400 shadow-lg shadow-emerald-500/20"
                                                               : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                                                 )}
                                          >
                                                 {cat}
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* Product List */}
                     <main className="flex-1 overflow-y-auto px-4 pb-32">
                            {loading ? (
                                   <div className="h-full flex flex-col items-center justify-center opacity-50">
                                          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full mb-4" />
                                          <p className="text-xs font-bold uppercase tracking-widest">Cargando...</p>
                                   </div>
                            ) : (
                                   <div className="grid grid-cols-2 gap-3">
                                          {filteredProducts.map(p => {
                                                 const inCart = cart.find(i => i.id === p.id)
                                                 return (
                                                        <motion.div
                                                               key={p.id}
                                                               onClick={() => p.stock > 0 && addToCart(p)}
                                                               className={cn(
                                                                      "bg-white dark:bg-white/5 p-3 rounded-2xl border transition-all active:scale-95 flex flex-col gap-2 relative overflow-hidden",
                                                                      inCart ? "border-emerald-500 shadow-md bg-emerald-50/50 dark:bg-emerald-500/5" : "border-slate-200 dark:border-white/10 shadow-sm",
                                                                      p.stock === 0 && "opacity-40 grayscale"
                                                               )}
                                                        >
                                                               <div className="aspect-square bg-slate-50 dark:bg-black/40 rounded-xl flex items-center justify-center relative">
                                                                      <span className="text-3xl">{p.category.includes('Bebida') ? '🥤' : p.category.includes('Snack') ? '🍿' : '📦'}</span>
                                                                      {p.stock > 0 && (
                                                                             <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 bg-white/80 dark:bg-black/80 rounded-md border border-slate-200 dark:border-white/10">{p.stock}</span>
                                                                      )}
                                                               </div>
                                                               <div>
                                                                      <h3 className="text-xs font-bold line-clamp-1">{p.name}</h3>
                                                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">${p.price.toLocaleString()}</p>
                                                               </div>
                                                               {inCart && (
                                                                      <div className="absolute top-1 left-1 bg-emerald-500 text-white dark:text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                                                                             {inCart.quantity}
                                                                      </div>
                                                               )}
                                                        </motion.div>
                                                 )
                                          })}
                                   </div>
                            )}
                     </main>

                     {/* Float Action Button / Cart Bar */}
                     <AnimatePresence>
                            {cartCount > 0 && (
                                   <motion.div
                                          initial={{ y: 100 }}
                                          animate={{ y: 0 }}
                                          exit={{ y: 100 }}
                                          className="fixed bottom-6 left-4 right-4 z-50 pointer-events-none"
                                   >
                                          <button
                                                 onClick={() => setShowCart(true)}
                                                 className="w-full bg-emerald-500 text-white dark:text-black h-16 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-between px-6 pointer-events-auto active:scale-[0.98] transition-all"
                                          >
                                                 <div className="flex items-center gap-3">
                                                        <div className="bg-white/20 dark:bg-black/20 p-2 rounded-xl">
                                                               <ShoppingCart size={20} />
                                                        </div>
                                                        <div className="text-left leading-none">
                                                               <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Ver Carrito</p>
                                                               <p className="text-sm font-black">{cartCount} Productos</p>
                                                        </div>
                                                 </div>
                                                 <div className="text-right">
                                                        <p className="text-xl font-black tracking-tight">${cartTotal.toLocaleString()}</p>
                                                 </div>
                                          </button>
                                   </motion.div>
                            )}
                     </AnimatePresence>

                     {/* Cart Sheet (Mobile) */}
                     <AnimatePresence>
                            {showCart && (
                                   <div className="fixed inset-0 z-[110] flex flex-col justify-end">
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 onClick={() => setShowCart(false)}
                                                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                          />
                                          <motion.div
                                                 initial={{ y: '100%' }}
                                                 animate={{ y: 0 }}
                                                 exit={{ y: '100%' }}
                                                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                                 className="relative bg-white dark:bg-[#030712] rounded-t-3xl border-t border-slate-200 dark:border-white/10 p-6 pt-2 h-[80vh] flex flex-col"
                                          >
                                                 <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto my-4 shrink-0" />
                                                 <div className="flex items-center justify-between mb-6 shrink-0">
                                                        <h2 className="font-black text-xl tracking-tight">CARRITO</h2>
                                                        <button onClick={() => setCart([])} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                                                 </div>

                                                 <div className="flex-1 overflow-y-auto space-y-4 pb-12 pr-1 custom-scrollbar">
                                                        {cart.map(item => (
                                                               <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                                                      <div className="w-12 h-12 bg-white dark:bg-black/40 rounded-xl flex items-center justify-center text-xl shrink-0">
                                                                             {item.category.includes('Bebida') ? '🥤' : '🍿'}
                                                                      </div>
                                                                      <div className="flex-1 min-w-0">
                                                                             <p className="font-bold text-sm truncate">{item.name}</p>
                                                                             <p className="text-[10px] font-black text-emerald-500 mt-0.5">${item.appliedPrice.toLocaleString()}</p>
                                                                      </div>
                                                                      <div className="flex items-center gap-3 bg-white dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/5">
                                                                             <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:text-red-500"><Minus size={14} /></button>
                                                                             <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                                                                             <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:text-emerald-500"><Plus size={14} /></button>
                                                                      </div>
                                                               </div>
                                                        ))}

                                                        {suggestedProduct && (
                                                               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between gap-4">
                                                                      <div className="flex items-center gap-3">
                                                                             <Sparkles size={20} className="text-indigo-500" />
                                                                             <div className="min-w-0">
                                                                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Sugerido</p>
                                                                                    <p className="text-[11px] font-bold truncate max-w-[120px]">{suggestedProduct.name}</p>
                                                                             </div>
                                                                      </div>
                                                                      <button onClick={() => { addToCart(suggestedProduct); setSuggestedProduct(null); }} className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg shadow-indigo-500/20 whitespace-nowrap">AGREGAR POR ${suggestedProduct.price}</button>
                                                               </motion.div>
                                                        )}
                                                 </div>

                                                 <div className="shrink-0 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
                                                        <div className="flex gap-2">
                                                               <button onClick={() => setSelectedMethod('CASH')} className={cn("flex-1 p-3 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1.5 transition-all uppercase tracking-widest", selectedMethod === 'CASH' ? "bg-emerald-500 border-emerald-400 text-white dark:text-black" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400")}>
                                                                      <Banknote size={18} /> EFECTIVO
                                                               </button>
                                                               <button onClick={() => setSelectedMethod('TRANSFER')} className={cn("flex-1 p-3 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1.5 transition-all uppercase tracking-widest", selectedMethod === 'TRANSFER' ? "bg-emerald-500 border-emerald-400 text-white dark:text-black" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400")}>
                                                                      <CreditCard size={18} /> TRANSFERENCIA
                                                               </button>
                                                               {allowCredit && (
                                                                      <button disabled={!selectedClient} onClick={() => setSelectedMethod('ACCOUNT')} className={cn("flex-1 p-3 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1.5 transition-all uppercase tracking-widest", selectedMethod === 'ACCOUNT' ? "bg-emerald-500 border-emerald-400 text-white dark:text-black" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400", !selectedClient && "opacity-30")}>
                                                                             <Zap size={18} /> A CUENTA
                                                                      </button>
                                                               )}
                                                        </div>
                                                        <div className="flex items-center justify-between px-2">
                                                               <span className="text-sm font-bold text-slate-500">TOTAL</span>
                                                               <span className="text-2xl font-black">${cartTotal.toLocaleString()}</span>
                                                        </div>
                                                        <button
                                                               onClick={onFinalize}
                                                               disabled={processing}
                                                               className="w-full bg-emerald-500 text-white dark:text-black font-black text-lg py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                                        >
                                                               {processing ? <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" /> : 'FINALIZAR VENTA'}
                                                        </button>
                                                 </div>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>

                     {/* Success Overlay */}
                     {showSuccess && <KioscoSuccessOverlay onReset={() => { setShowSuccess(false); setCart([]); }} />}

                     {/* Client Dropdown Modal Layer */}
                     <AnimatePresence>
                            {isClientDropdownOpen && (
                                   <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsClientDropdownOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white dark:bg-[#030712] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden">
                                                 <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                                                        <h3 className="font-black text-sm tracking-widest uppercase">Identificar Cliente</h3>
                                                        <button onClick={() => setIsClientDropdownOpen(false)} className="p-1 hover:text-emerald-500"><X size={18} /></button>
                                                 </div>
                                                 <div className="p-4 space-y-4">
                                                        <div className="relative">
                                                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                               <input
                                                                      autoFocus
                                                                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                                                                      placeholder="DNI o Nombre..."
                                                                      value={clientSearch}
                                                                      onChange={e => setClientSearch(e.target.value)}
                                                               />
                                                        </div>
                                                        <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar">
                                                               {clients.map(c => (
                                                                      <button
                                                                             key={c.id}
                                                                             onClick={() => { setSelectedClient(c); setIsClientDropdownOpen(false); setClientSearch(''); }}
                                                                             className="w-full p-4 text-left border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 last:border-0 flex justify-between items-center active:bg-emerald-50 dark:active:bg-emerald-500/10 transition-colors"
                                                                      >
                                                                             <div>
                                                                                    <p className="font-bold text-sm">{c.name}</p>
                                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{c.phone}</p>
                                                                             </div>
                                                                             <Plus size={16} className="text-emerald-500" />
                                                                      </button>
                                                               ))}
                                                               {clientSearch.length >= 2 && clients.length === 0 && (
                                                                      <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
                                                               )}
                                                        </div>
                                                 </div>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </motion.div>
       )
}
