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

export function KioskTab({ products, items = [], loading, onAddItem, onRemoveItem, players = [] }: Props) {
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
              <div className="flex-1 bg-[#F8FAFC] dark:bg-background p-4 md:p-8 relative min-h-[600px] flex flex-col">
                     {/* SEARCH BAR */}
                     <div className="relative mb-8 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-muted-foreground group-focus-within:text-[var(--primary)] transition-colors" />
                            <input
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="w-full h-14 bg-white dark:bg-card text-slate-900 dark:text-foreground placeholder-slate-300 dark:placeholder-muted-foreground/50 rounded-2xl pl-14 pr-5 border border-slate-200 dark:border-border focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-300 text-sm font-black outline-none shadow-sm shadow-slate-200/50"
                                   placeholder="Buscar bebidas, snacks..."
                                   type="text"
                            />
                     </div>

                     {/* PLAYER ASSIGNMENT */}
                     <div className="mb-8">
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Asignar consumo a:</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                   <div
                                          onClick={() => setSelectedPlayer("")}
                                          className="flex flex-col items-center gap-3 min-w-[72px] cursor-pointer group"
                                   >
                                          <div className={cn(
                                                 "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm",
                                                 selectedPlayer === ""
                                                        ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                                        : "bg-white dark:bg-zinc-800 border-2 border-slate-100 dark:border-transparent text-slate-400 dark:text-muted-foreground"
                                          )}>
                                                 <Users className="text-xl" />
                                          </div>
                                          <span className={cn(
                                                 "text-[9px] font-black text-center leading-tight tracking-widest uppercase",
                                                 selectedPlayer === "" ? "text-[var(--primary)]" : "text-slate-400 dark:text-muted-foreground"
                                          )}>
                                                 CONSUMEN<br />TODOS
                                          </span>
                                   </div>
                                   {players.map((p, i) => (
                                          <div
                                                 key={i}
                                                 onClick={() => setSelectedPlayer(p)}
                                                 className={cn(
                                                        "flex flex-col items-center gap-3 min-w-[72px] cursor-pointer group transition-all",
                                                        selectedPlayer === p ? "opacity-100" : "opacity-60 hover:opacity-100"
                                                 )}
                                          >
                                                 <div className={cn(
                                                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm",
                                                        selectedPlayer === p
                                                               ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                                               : "bg-white dark:bg-zinc-800 border-2 border-slate-100 dark:border-transparent text-slate-400 dark:text-muted-foreground"
                                                 )}>
                                                        <User className="text-xl" />
                                                 </div>
                                                 <span className={cn(
                                                        "text-[9px] font-black text-center leading-tight uppercase tracking-widest truncate w-full",
                                                        selectedPlayer === p ? "text-[var(--primary)]" : "text-slate-400 dark:text-muted-foreground"
                                                 )}>
                                                        {p.split(' ')[0]}<br />{p.split(' ')[1]?.charAt(0) || ''}
                                                 </span>
                                          </div>
                                   ))}
                            </div>
                     </div>

                     {/* PRODUCTS GRID */}
                     <div className="mb-10 flex-1">
                            <div className="flex justify-between items-center mb-6">
                                   <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-4 bg-[var(--primary)] rounded-full mr-1"></div>
                                          <h3 className="text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.2em]">Productos Disponibles</h3>
                                   </div>
                                   <button className="text-[10px] font-black text-[var(--primary)] hover:opacity-80 uppercase tracking-widest flex items-center gap-1.5 transition-opacity">
                                          Ver todo <ArrowRight className="w-3.5 h-3.5" />
                                   </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                                   {filteredProducts.map(product => (
                                          <div
                                                 key={product.id}
                                                 onClick={() => handleAdd(product)}
                                                 className="bg-white dark:bg-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-slate-200 dark:border-border hover:border-[var(--primary)]/30 shadow-sm"
                                          >
                                                 <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className={cn(
                                                               "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-inner",
                                                               product.category.toLowerCase().includes('bebida')
                                                                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400"
                                                                      : "bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400"
                                                        )}>
                                                               {product.category.toLowerCase().includes('bebida') ? '🥤' : '🎾'}
                                                        </div>
                                                        <div className="min-w-0">
                                                               <p className="text-sm font-black text-slate-900 dark:text-foreground truncate uppercase tracking-tight">{product.name}</p>
                                                               <p className="text-lg font-black text-[var(--primary)]">${product.price.toLocaleString()}</p>
                                                        </div>
                                                 </div>
                                                 <button className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 dark:bg-[#121214] border border-transparent dark:border-zinc-700 flex items-center justify-center text-white dark:text-blue-500 group-hover:scale-110 active:scale-90 transition-all shadow-md">
                                                        <Plus className="w-5 h-5" />
                                                 </button>
                                          </div>
                                   ))}
                            </div>
                     </div>

                     {/* CONSUMPTION SUMMARY */}
                     {items.length > 0 && (
                            <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-border mt-auto shadow-xl shadow-slate-200/50 dark:shadow-none">
                                   <div className="flex justify-between items-center mb-6">
                                          <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                        <ShoppingCart className="w-5 h-5" />
                                                 </div>
                                                 <h3 className="text-xs font-black text-slate-900 dark:text-foreground uppercase tracking-widest">Consumos Actuales</h3>
                                          </div>
                                          <span className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest leading-none shadow-lg shadow-[var(--primary)]/20">{items.length} ITEMS</span>
                                   </div>
                                   <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar pr-3 mb-6">
                                          {items.map(item => (
                                                 <div key={item.id} className="flex justify-between items-center group">
                                                        <div className="flex flex-col">
                                                               <span className="text-sm font-black text-slate-900 dark:text-zinc-300 uppercase tracking-tight">{item.product?.name} <span className="text-[var(--primary)]">x{item.quantity}</span></span>
                                                               <span className="text-[9px] text-slate-400 dark:text-muted-foreground uppercase font-black tracking-widest">{item.playerName || 'General'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                               <span className="text-lg font-black text-slate-900 dark:text-foreground tracking-tighter">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                               <button
                                                                      onClick={() => onRemoveItem(item.id)}
                                                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                               >
                                                                      <Trash className="w-4 h-4" />
                                                               </button>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                                   <div className="h-px bg-slate-100 dark:bg-zinc-800 w-full mb-6"></div>
                                   <div className="flex justify-between items-end">
                                          <span className="text-xs font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-1">TOTAL KIOSCO</span>
                                          <span className="text-4xl font-black text-[var(--primary)] tracking-tighter leading-none">${totalAmount.toLocaleString()}</span>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
