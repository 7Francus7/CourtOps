'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Search, Plus, Minus, Trash, ShoppingCart, User, Users, ArrowRight } from 'lucide-react'

interface Product {
       id: number
       name: string
       price: number
       category: string
       stock: number
       imageUrl?: string | null
}

interface BookingItem {
       id: number
       product: Product | null
       quantity: number
       unitPrice: number
       playerName?: string | null
}

interface Props {
       products: Product[]
       items: BookingItem[]
       loading: boolean
       onAddItem: (productId: number, quantity: number, playerName?: string) => Promise<void>
       onRemoveItem: (itemId: number) => Promise<void>
       players: string[]
}

import { useLanguage } from '@/contexts/LanguageContext'

export function KioskTab({ products, items = [], loading, onAddItem, onRemoveItem, players = [] }: Props) {
       const { t } = useLanguage()
       const [searchTerm, setSearchTerm] = useState("")
       const [selectedPlayer, setSelectedPlayer] = useState<string>("") // Empty = General

       const filteredProducts = useMemo(() => {
              return products.filter(p =>
                     p.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
       }, [products, searchTerm])

       const handleAdd = (product: Product) => {
              onAddItem(product.id, 1, selectedPlayer || undefined)
       }

       const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

       return (
              <div className="flex-1 bg-slate-50/50 dark:bg-background/50 p-4 md:p-8 relative min-h-[600px] flex flex-col">
                     {/* SEARCH BAR */}
                     <div className="relative mb-8 group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
                                   <Search size={20} />
                            </div>
                            <input
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="w-full h-14 bg-white dark:bg-card text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-muted-foreground/50 rounded-2xl pl-14 pr-5 border border-slate-200 dark:border-white/10 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-300 text-sm font-bold outline-none shadow-sm group-hover:border-slate-300 dark:group-hover:border-white/20"
                                   placeholder={t('search_placeholder_kiosk')}
                                   type="text"
                            />
                     </div>

                     {/* PLAYER ASSIGNMENT */}
                     <div className="mb-8">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-4">{t('assign_consumption')}</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                   <button
                                          onClick={() => setSelectedPlayer("")}
                                          className={cn(
                                                 "flex flex-col items-center gap-3 min-w-[80px] group transition-all relative",
                                                 selectedPlayer === "" ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                                          )}
                                   >
                                          <div className={cn(
                                                 "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg border-2",
                                                 selectedPlayer === ""
                                                        ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[var(--primary)]/30"
                                                        : "bg-white dark:bg-card border-slate-100 dark:border-white/5 text-slate-400 dark:text-muted-foreground hover:border-slate-200 dark:hover:border-white/20"
                                          )}>
                                                 <Users size={24} />
                                          </div>
                                          <span className={cn(
                                                 "text-[9px] font-black text-center leading-tight tracking-widest uppercase py-1 px-2 rounded-full",
                                                 selectedPlayer === "" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-slate-500 dark:text-muted-foreground"
                                          )}>
                                                 {t('everyone')}
                                          </span>
                                   </button>
                                   {players.map((p, i) => (
                                          <button
                                                 key={i}
                                                 onClick={() => setSelectedPlayer(p)}
                                                 className={cn(
                                                        "flex flex-col items-center gap-3 min-w-[80px] group transition-all relative",
                                                        selectedPlayer === p ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                                                 )}
                                          >
                                                 <div className={cn(
                                                        "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg border-2",
                                                        selectedPlayer === p
                                                               ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-[var(--primary)]/30"
                                                               : "bg-white dark:bg-card border-slate-100 dark:border-white/5 text-slate-400 dark:text-muted-foreground hover:border-slate-200 dark:hover:border-white/20"
                                                 )}>
                                                        <User size={24} />
                                                 </div>
                                                 <span className={cn(
                                                        "text-[9px] font-black text-center leading-tight uppercase tracking-widest truncate max-w-full py-1 px-2 rounded-full",
                                                        selectedPlayer === p ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-slate-500 dark:text-muted-foreground"
                                                 )}>
                                                        {p.split(' ')[0]}
                                                 </span>
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* PRODUCTS GRID */}
                     <div className="mb-10 flex-1">
                            <div className="flex justify-between items-center mb-6">
                                   <div className="flex items-center gap-3">
                                          <div className="w-1 h-4 bg-[var(--primary)] rounded-full"></div>
                                          <h3 className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-[0.2em]">{t('products_available')}</h3>
                                   </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                                   {filteredProducts.map(product => (
                                          <button
                                                 key={product.id}
                                                 onClick={() => handleAdd(product)}
                                                 className="bg-white dark:bg-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-0.5 transition-all group border border-slate-200 dark:border-white/5 hover:border-[var(--primary)]/30 active:scale-[0.98]"
                                          >
                                                 <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className={cn(
                                                               "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-sm border",
                                                               product.category.toLowerCase().includes('bebida')
                                                                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500 border-blue-100 dark:border-blue-500/20"
                                                                      : "bg-orange-50 dark:bg-orange-500/10 text-orange-500 border-orange-100 dark:border-orange-500/20"
                                                        )}>
                                                               {product.category.toLowerCase().includes('bebida') ? '🥤' : '🎾'}
                                                        </div>
                                                        <div className="min-w-0 text-left">
                                                               <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{product.name}</p>
                                                               <p className="text-base font-black text-[var(--primary)] mt-0.5">${product.price.toLocaleString()}</p>
                                                        </div>
                                                 </div>
                                                 <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                                        <Plus size={16} />
                                                 </div>
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* CONSUMPTION SUMMARY */}
                     {items.length > 0 && (
                            <div className="bg-white dark:bg-card rounded-3xl p-6 border border-slate-200 dark:border-white/5 mt-auto shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                                   <div className="flex justify-between items-center mb-6 relative z-10">
                                          <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                                                        <ShoppingCart size={18} />
                                                 </div>
                                                 <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('current_consumptions')}</h3>
                                          </div>
                                          <span className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-black uppercase tracking-widest leading-none">
                                                 {items.length} {t('items_count')}
                                          </span>
                                   </div>

                                   <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2 mb-6 relative z-10">
                                          {items.map(item => (
                                                 <div key={item.id} className="flex justify-between items-center group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <div className="flex flex-col">
                                                               <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.product?.name} <span className="text-[var(--primary)] ml-1">x{item.quantity}</span></span>
                                                               <span className="text-[9px] text-slate-400 dark:text-muted-foreground uppercase font-bold tracking-widest">{item.playerName || t('general')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                               <span className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                               <button
                                                                      onClick={() => onRemoveItem(item.id)}
                                                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                               >
                                                                      <Trash size={14} />
                                                               </button>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>

                                   <div className="h-px bg-slate-100 dark:bg-white/5 w-full mb-4"></div>

                                   <div className="flex justify-between items-end relative z-10">
                                          <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-1">{t('kiosk_total')}</span>
                                          <span className="text-4xl font-black text-slate-900 dark:text-[var(--primary)] tracking-tighter leading-none">${totalAmount.toLocaleString()}</span>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
