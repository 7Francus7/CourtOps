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
              <div className="flex-1 bg-[#F8FAFC] dark:bg-zinc-950/50 p-4 md:p-8 relative min-h-[600px] flex flex-col gap-10">
                     {/* SEARCH BAR */}
                     <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-primary transition-colors pointer-events-none">
                                   <Search size={24} />
                            </div>
                            <input
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="w-full h-16 bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-white/5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-700 rounded-3xl pl-16 pr-6 focus:border-primary/50 focus:ring-8 focus:ring-primary/10 transition-all text-lg font-black outline-none shadow-xl dark:shadow-2xl"
                                   placeholder={t('search_placeholder_kiosk')}
                                   type="text"
                            />
                     </div>

                     {/* PLAYER ASSIGNMENT */}
                     <div>
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 px-2">{t('assign_consumption')}</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                                   <button
                                          onClick={() => {
                                                 // Haptics.light()
                                                 setSelectedPlayer("")
                                          }}
                                          className={cn(
                                                 "flex flex-col items-center gap-4 min-w-[100px] group transition-all relative",
                                                 selectedPlayer === "" ? "scale-105" : "opacity-40 hover:opacity-100"
                                          )}
                                   >
                                          <div className={cn(
                                                 "h-20 w-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 border-2",
                                                 selectedPlayer === ""
                                                        ? "bg-primary border-primary text-primary-foreground shadow-lg dark:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
                                                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-white/10 shadow-sm"
                                          )}>
                                                 <Users size={32} />
                                          </div>
                                          <span className={cn(
                                                 "text-[10px] font-black tracking-[0.2em] uppercase transition-colors",
                                                 selectedPlayer === "" ? "text-white" : "text-zinc-500"
                                          )}>
                                                 {t('everyone')}
                                          </span>
                                          {selectedPlayer === "" && (
                                                 <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-4 border-white dark:border-zinc-950"></div>
                                          )}
                                   </button>
                                   {players.map((p, i) => (
                                          <button
                                                 key={i}
                                                 onClick={() => {
                                                        // Haptics.light()
                                                        setSelectedPlayer(p)
                                                 }}
                                                 className={cn(
                                                        "flex flex-col items-center gap-4 min-w-[100px] group transition-all relative",
                                                        selectedPlayer === p ? "scale-105" : "opacity-40 hover:opacity-100"
                                                 )}
                                          >
                                                 <div className={cn(
                                                        "h-20 w-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 border-2",
                                                        selectedPlayer === p
                                                               ? "bg-primary border-primary text-primary-foreground shadow-lg dark:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
                                                               : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-white/10 shadow-sm"
                                                 )}>
                                                        <User size={32} />
                                                 </div>
                                                 <span className={cn(
                                                        "text-[10px] font-black tracking-[0.2em] uppercase truncate max-w-full transition-colors px-2",
                                                        selectedPlayer === p ? "text-white" : "text-zinc-500"
                                                 )}>
                                                        {p.split(' ')[0]}
                                                 </span>
                                                 {selectedPlayer === p && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-4 border-white dark:border-zinc-950"></div>
                                                 )}
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* PRODUCTS GRID */}
                     <div className="flex-1">
                            <div className="flex items-center gap-4 mb-8 px-2">
                                   <div className="w-12 h-px bg-white/5"></div>
                                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">{t('products_available')}</h3>
                                   <div className="flex-1 h-px bg-white/5"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4 pb-10">
                                   {filteredProducts.map(product => (
                                          <button
                                                 key={product.id}
                                                 onClick={() => {
                                                        // Haptics.light()
                                                        handleAdd(product)
                                                 }}
                                                 className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer hover:shadow-primary/5 dark:hover:bg-zinc-900 transition-all group border border-slate-200 dark:border-white/5 hover:border-primary shadow-xl dark:shadow-2xl relative overflow-hidden active:scale-[0.98]"
                                          >
                                                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

                                                 <div className="flex items-center gap-6 relative z-10">
                                                        <div className={cn(
                                                               "h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110",
                                                               product.category.toLowerCase().includes('bebida')
                                                                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                                        )}>
                                                               {product.category.toLowerCase().includes('bebida') ? '🥤' : '🎾'}
                                                        </div>
                                                        <div className="text-left">
                                                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{product.name}</p>
                                                               <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tighter">${product.price.toLocaleString()}</p>
                                                        </div>
                                                 </div>
                                                 <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all relative z-10 shadow-sm">
                                                        <Plus size={24} />
                                                 </div>
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* CONSUMPTION SUMMARY */}
                     {items.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border-t-4 border-primary rounded-t-[3rem] p-10 -mx-8 -mb-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                                   <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none"></div>

                                   <div className="flex justify-between items-center mb-8 relative z-10">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary shadow-inner border border-slate-200 dark:border-transparent">
                                                        <ShoppingCart size={20} />
                                                 </div>
                                                 <div className="space-y-1">
                                                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{t('current_consumptions')}</h3>
                                                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest leading-none">{items.length} {t('items_count')}</p>
                                                 </div>
                                          </div>
                                          <button
                                                 onClick={() => {/* Finalize step */ }}
                                                 className="bg-primary text-primary-foreground dark:bg-white dark:text-black h-12 px-6 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:brightness-110 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                          >
                                                 {t('continue')} <ArrowRight size={16} />
                                          </button>
                                   </div>

                                   <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-4 mb-8 relative z-10">
                                          {items.map(item => (
                                                 <div key={item.id} className="flex justify-between items-center group p-5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5 shadow-sm">
                                                        <div className="flex flex-col gap-1">
                                                               <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.product?.name} <span className="text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded text-[10px]">x{item.quantity}</span></span>
                                                               <div className="flex items-center gap-2">
                                                                      <User size={10} className="text-zinc-600" />
                                                                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{item.playerName || t('general')}</span>
                                                               </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                               <button
                                                                      onClick={() => {
                                                                             // Haptics.heavy()
                                                                             onRemoveItem(item.id)
                                                                      }}
                                                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
                                                               >
                                                                      <Trash size={18} />
                                                               </button>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>

                                   <div className="flex justify-between items-end relative z-10 border-t border-slate-200 dark:border-white/10 pt-8">
                                          <div className="space-y-1">
                                                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">{t('kiosk_total')}</span>
                                                 <p className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest">Incluye IVA y cargos de servicio</p>
                                          </div>
                                          <div className="text-right">
                                                 <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none drop-shadow-2xl block">
                                                        ${totalAmount.toLocaleString()}
                                                 </span>
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
