'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
       Store,
       Search,
       Plus,
       User,
       X,
       Sparkles,
       ShoppingCart,
       Zap,
       ShieldCheck,
       Trash2
} from 'lucide-react'

import { useKiosk } from '@/hooks/useKiosk'
import { ProductGrid } from './kiosco/ProductGrid'
import { CartSidebar } from './kiosco/CartSidebar'
import { CheckoutOverlay } from './kiosco/CheckoutOverlay'
import { KioscoSuccessOverlay } from './kiosco/KioscoSuccessOverlay'
import { CreateProductModal } from './kiosco/CreateProductModal'

type Props = {
       isOpen: boolean
       onClose: () => void
}

export default function DesktopKiosco({ isOpen, onClose }: Props) {
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

       const [showCheckout, setShowCheckout] = useState(false)
       const [showSuccess, setShowSuccess] = useState(false)
       const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)

       const onFinalize = async (payments: any[]) => {
              const success = await handleFinalizeSale(payments)
              if (success) {
                     setShowSuccess(true)
                     setShowCheckout(false)
              }
       }

       if (!isOpen) return null

       return (
              <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-[100] flex bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-zinc-100 h-screen w-screen overflow-hidden antialiased selection:bg-emerald-500/30 selection:text-white"
              >
                     {/* Ambient Glows */}
                     <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1200px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

                     {/* --- MAIN CONTENT --- */}
                     <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 border-r border-slate-200 dark:border-white/5">
                            {/* Premium Header */}
                            <header className="p-6 pb-2 space-y-6 shrink-0 relative">
                                   <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-5">
                                                 <motion.div
                                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                                        className="bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 p-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 text-white dark:text-black"
                                                 >
                                                        <Store className="w-6 h-6 stroke-[2.5]" />
                                                 </motion.div>
                                                 <div>
                                                        <h1 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-2">
                                                               KIOSKO HUB
                                                               <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">v2.0</span>
                                                        </h1>
                                                        <div className="flex items-center gap-2 mt-2">
                                                               <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                                                                      <User size={12} className="text-slate-400" />
                                                                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                                                                             {selectedClient ? selectedClient.name : 'Venta General'}
                                                                      </span>
                                                                      {selectedClient?.membershipStatus === 'ACTIVE' && (
                                                                             <ShieldCheck size={12} className="text-emerald-500 ml-1" />
                                                                      )}
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                          <button
                                                 onClick={onClose}
                                                 className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm group"
                                          >
                                                 <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                          </button>
                                   </div>

                                   {/* Search & Actions Bar */}
                                   <div className="flex gap-4">
                                          <div className="flex-1 relative group">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-slate-400/70 text-slate-900 dark:text-white transition-all outline-none shadow-sm"
                                                        placeholder="Escanea o busca un producto..."
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                 />
                                          </div>

                                          <div className="relative group w-72">
                                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-teal-500 transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-teal-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500 placeholder-slate-400/70 text-slate-900 dark:text-white transition-all outline-none shadow-sm"
                                                        placeholder="Identificar Cliente..."
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={e => setClientSearch(e.target.value)}
                                                 />
                                                 <AnimatePresence>
                                                        {isClientDropdownOpen && clients.length > 0 && (
                                                               <motion.div
                                                                      initial={{ opacity: 0, y: 10 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      exit={{ opacity: 0, scale: 0.95 }}
                                                                      className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5"
                                                               >
                                                                      {clients.slice(0, 5).map(c => (
                                                                             <button
                                                                                    key={c.id}
                                                                                    onClick={() => {
                                                                                           setSelectedClient(c)
                                                                                           setClientSearch('')
                                                                                           setIsClientDropdownOpen(false)
                                                                                    }}
                                                                                    className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex justify-between items-center group/client transition-colors"
                                                                             >
                                                                                    <div>
                                                                                           <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 group-hover/client:text-emerald-500 transition-colors">{c.name}</p>
                                                                                           <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{c.phone}</p>
                                                                                    </div>
                                                                                    <Plus className="w-4 h-4 text-emerald-500 opacity-0 group-hover/client:opacity-100 transform translate-x-2 group-hover/client:translate-x-0 transition-all" />
                                                                             </button>
                                                                      ))}
                                                               </motion.div>
                                                        )}
                                                 </AnimatePresence>
                                          </div>
                                   </div>
                            </header>

                            {/* Filters */}
                            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                                   {categories.map(cat => (
                                          <button
                                                 key={cat}
                                                 onClick={() => setSelectedCategory(cat)}
                                                 className={cn(
                                                        "px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap uppercase tracking-[0.1em] border",
                                                        selectedCategory === cat
                                                               ? "bg-emerald-500 text-white dark:text-black border-emerald-400 shadow-lg shadow-emerald-500/25"
                                                               : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                 )}
                                          >
                                                 {cat}
                                          </button>
                                   ))}
                            </div>

                            {/* Product Grid Area */}
                            <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar scroll-smooth">
                                   <ProductGrid
                                          products={filteredProducts}
                                          loading={loading}
                                          selectedClient={selectedClient}
                                          onAddToCart={addToCart}
                                          onReloadProducts={refresh}
                                   />
                            </div>
                     </main>

                     {/* --- SIDEBAR PANEL (CART) --- */}
                     <aside className="w-[380px] lg:w-[420px] h-full flex flex-col relative z-20 bg-white dark:bg-[#030712] border-l border-slate-200 dark:border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center shrink-0">
                                   <div className="flex items-center gap-3">
                                          <div className="p-2 bg-emerald-500 rounded-lg text-white dark:text-black">
                                                 <ShoppingCart size={18} className="stroke-[2.5]" />
                                          </div>
                                          <div>
                                                 <h2 className="font-black text-lg tracking-tight leading-none text-slate-900 dark:text-white">CARRITO</h2>
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sessión activa</p>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                          {cart.length > 0 && (
                                                 <button
                                                        onClick={() => setCart([])}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Vaciar carrito"
                                                 >
                                                        <Trash2 size={18} />
                                                 </button>
                                          )}
                                   </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                   <CartSidebar
                                          cart={cart}
                                          onClose={onClose}
                                          onClearCart={() => setCart([])}
                                          onUpdateQuantity={updateQuantity}
                                          onCheckout={(isFastPay) => {
                                                 if (isFastPay) onFinalize([{ method: 'CASH', amount: cartTotal }])
                                                 else setShowCheckout(true)
                                          }}
                                   />
                            </div>

                            {/* Intelligent Upsell / Cross-selling Card */}
                            <AnimatePresence>
                                   {suggestedProduct && (
                                          <motion.div
                                                 initial={{ y: 100, opacity: 0 }}
                                                 animate={{ y: 0, opacity: 1 }}
                                                 exit={{ y: 100, opacity: 0 }}
                                                 className="absolute bottom-4 left-4 right-4 z-50"
                                          >
                                                 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] rounded-3xl overflow-hidden shadow-2xl">
                                                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-[23px] flex items-center justify-between gap-4">
                                                               <div className="flex items-center gap-3">
                                                                      <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-500">
                                                                             <Sparkles size={20} className="animate-pulse" />
                                                                      </div>
                                                                      <div>
                                                                             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">RECOMENDADO</p>
                                                                             <p className="text-sm font-bold truncate max-w-[140px]">{suggestedProduct.name}</p>
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-center gap-3">
                                                                      <span className="font-black text-sm">${suggestedProduct.price.toLocaleString()}</span>
                                                                      <button
                                                                             onClick={() => {
                                                                                    addToCart(suggestedProduct)
                                                                                    setSuggestedProduct(null)
                                                                             }}
                                                                             className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30"
                                                                      >
                                                                             <Plus size={18} />
                                                                      </button>
                                                                      <button onClick={() => setSuggestedProduct(null)} className="text-slate-400 p-2">
                                                                             <X size={16} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </motion.div>
                                   )}
                            </AnimatePresence>

                            {/* Extra Quick Actions Footer in Sidebar */}
                            <div className="p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/10">
                                   <div className="grid grid-cols-2 gap-2">
                                          <button
                                                 onClick={() => setIsCreateProductOpen(true)}
                                                 className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 py-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-emerald-500 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all"
                                          >
                                                 <Zap size={14} />
                                                 NUEVO PRODUCTO
                                          </button>
                                          <button
                                                 onClick={refresh}
                                                 className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 py-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-teal-500 border border-slate-200 dark:border-white/10 hover:border-teal-500/50 transition-all"
                                          >
                                                 REFRESCAR
                                          </button>
                                   </div>
                            </div>
                     </aside>

                     {/* Modals & Overlays */}
                     <AnimatePresence>
                            {showCheckout && (
                                   <CheckoutOverlay
                                          total={cartTotal}
                                          pendingToPay={cartTotal}
                                          selectedClient={selectedClient}
                                          onClose={() => setShowCheckout(false)}
                                          onFinalize={onFinalize}
                                          processing={processing}
                                          allowCredit={allowCredit}
                                   />
                            )}
                            {showSuccess && <KioscoSuccessOverlay onReset={() => setShowSuccess(false)} />}
                     </AnimatePresence>

                     <AnimatePresence>
                            {isCreateProductOpen && (
                                   <CreateProductModal
                                          onClose={() => setIsCreateProductOpen(false)}
                                          onSuccess={refresh}
                                   />
                            )}
                     </AnimatePresence>
              </motion.div>
       )
}
