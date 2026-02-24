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
              <div className="flex-1 bg-transparent p-4 md:p-8 relative min-h-[600px] flex flex-col gap-10">
                     {/* SEARCH BAR */}
                     <div className="relative group max-w-2xl mx-auto w-full">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-primary transition-colors pointer-events-none">
                                   <Search size={22} />
                            </div>
                            <input
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="w-full h-16 bg-card/40 backdrop-blur-xl border border-border/50 text-white placeholder-zinc-700 rounded-3xl pl-16 pr-6 focus:border-primary/50 focus:ring-8 focus:ring-primary/10 transition-all text-lg font-black outline-none shadow-2xl"
                                   placeholder={t('search_placeholder_kiosk')}
                                   type="text"
                            />
                     </div>

                     {/* PLAYER ASSIGNMENT */}
                     <div className="max-w-4xl mx-auto w-full">
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 px-4">{t('assign_consumption')}</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-4">
                                   <button
                                          onClick={() => setSelectedPlayer("")}
                                          className={cn(
                                                 "flex flex-col items-center gap-4 min-w-[100px] group transition-all relative",
                                                 selectedPlayer === "" ? "scale-105" : "opacity-40 hover:opacity-100"
                                          )}
                                   >
                                          <div className={cn(
                                                 "h-20 w-20 rounded-3xl flex items-center justify-center transition-all duration-500 border-2",
                                                 selectedPlayer === ""
                                                        ? "bg-primary border-primary text-primary-foreground shadow-2xl"
                                                        : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20 shadow-lg"
                                          )}>
                                                 <Users size={32} />
                                          </div>
                                          <span className={cn(
                                                 "text-[10px] font-black tracking-[0.2em] uppercase transition-colors",
                                                 selectedPlayer === "" ? "text-white" : "text-zinc-600"
                                          )}>
                                                 {t('everyone')}
                                          </span>
                                          {selectedPlayer === "" && (
                                                 <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-background"></div>
                                          )}
                                   </button>
                                   {players.map((p, i) => (
                                          <button
                                                 key={i}
                                                 onClick={() => setSelectedPlayer(p)}
                                                 className={cn(
                                                        "flex flex-col items-center gap-4 min-w-[100px] group transition-all relative",
                                                        selectedPlayer === p ? "scale-105" : "opacity-40 hover:opacity-100"
                                                 )}
                                          >
                                                 <div className={cn(
                                                        "h-20 w-20 rounded-3xl flex items-center justify-center transition-all duration-500 border-2",
                                                        selectedPlayer === p
                                                               ? "bg-primary border-primary text-primary-foreground shadow-2xl"
                                                               : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20 shadow-lg"
                                                 )}>
                                                        <User size={32} />
                                                 </div>
                                                 <span className={cn(
                                                        "text-[10px] font-black tracking-[0.2em] uppercase truncate max-w-full transition-colors px-2",
                                                        selectedPlayer === p ? "text-white" : "text-zinc-600"
                                                 )}>
                                                        {p.split(' ')[0]}
                                                 </span>
                                                 {selectedPlayer === p && (
                                                        <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-background"></div>
                                                 )}
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* PRODUCTS GRID */}
                     <div className="flex-1 max-w-4xl mx-auto w-full px-4">
                            <div className="flex items-center gap-4 mb-8">
                                   <div className="w-12 h-px bg-white/5"></div>
                                   <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">{t('products_available')}</h3>
                                   <div className="flex-1 h-px bg-white/5"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4 pb-20">
                                   {filteredProducts.map(product => (
                                          <button
                                                 key={product.id}
                                                 onClick={() => handleAdd(product)}
                                                 className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] flex items-center justify-between cursor-pointer group border border-border/50 hover:border-primary/50 shadow-2xl relative overflow-hidden active:scale-[0.98] transition-all"
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
                                                               <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{product.name}</p>
                                                               <p className="text-2xl font-black text-white mt-1.5 tracking-tighter">${product.price.toLocaleString()}</p>
                                                        </div>
                                                 </div>
                                                 <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all relative z-10 shadow-lg">
                                                        <Plus size={24} />
                                                 </div>
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* CONSUMPTION SUMMARY */}
                     {items.length > 0 && (
                            <div className="bg-zinc-950/80 backdrop-blur-3xl border-t border-white/10 rounded-t-[3.5rem] p-10 -mx-8 -mb-8 shadow-2xl relative overflow-hidden mt-auto">
                                   <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none"></div>

                                   <div className="flex justify-between items-center mb-8 relative z-10">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary shadow-2xl border border-white/10">
                                                        <ShoppingCart size={24} />
                                                 </div>
                                                 <div className="space-y-1">
                                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">{t('current_consumptions')}</h3>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{items.length} {t('items_count')}</p>
                                                 </div>
                                          </div>
                                          <button
                                                 onClick={() => {/* Finalize step */ }}
                                                 className="bg-white text-black h-12 px-8 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
                                          >
                                                 {t('continue')} <ArrowRight size={18} />
                                          </button>
                                   </div>

                                   <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-4 mb-10 relative z-10">
                                          {items.map(item => (
                                                 <div key={item.id} className="flex justify-between items-center group p-6 rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 shadow-xl">
                                                        <div className="flex flex-col gap-2">
                                                               <span className="text-sm font-black text-white uppercase tracking-tight">
                                                                      {item.product?.name}
                                                                      <span className="text-emerald-500 ml-3 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest">x{item.quantity}</span>
                                                               </span>
                                                               <div className="flex items-center gap-2">
                                                                      <User size={12} className="text-zinc-600" />
                                                                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{item.playerName || t('general')}</span>
                                                               </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                               <span className="text-2xl font-black text-white tracking-tighter">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                               <button
                                                                      onClick={() => onRemoveItem(item.id)}
                                                                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                                               >
                                                                      <Trash size={20} />
                                                               </button>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>

                                   <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-10">
                                          <div className="space-y-1">
                                                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">{t('kiosk_total')}</span>
                                                 <p className="text-zinc-700 font-bold text-[9px] uppercase tracking-widest">Precios con impuestos incluidos</p>
                                          </div>
                                          <div className="text-right">
                                                 <span className="text-7xl font-black text-white tracking-tighter leading-none block drop-shadow-2xl">
                                                        ${totalAmount.toLocaleString()}
                                                 </span>
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
