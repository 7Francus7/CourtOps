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
              <div className="flex-1 bg-background p-6 relative">
                     {/* SEARCH BAR */}
                     <div className="relative mb-6 group">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                            <input
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="w-full bg-card text-foreground placeholder-muted-foreground/50 rounded-xl py-3.5 pl-12 pr-4 border border-border focus:border-primary transition-all duration-200 text-sm font-medium outline-none"
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
                                          className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group"
                                   >
                                          <div className={cn(
                                                 "h-12 w-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                                 selectedPlayer === "" ? "bg-blue-500/10 border-2 border-blue-500 text-blue-500" : "bg-zinc-800 border-2 border-transparent text-muted-foreground"
                                          )}>
                                                 <Users className="text-xl" />
                                          </div>
                                          <span className={cn(
                                                 "text-[10px] font-bold text-center leading-tight",
                                                 selectedPlayer === "" ? "text-blue-500" : "text-muted-foreground"
                                          )}>
                                                 CONSUMEN<br />TODOS
                                          </span>
                                   </div>
                                   {players.map((p, i) => (
                                          <div
                                                 key={i}
                                                 onClick={() => setSelectedPlayer(p)}
                                                 className={cn(
                                                        "flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group transition-opacity",
                                                        selectedPlayer === p ? "opacity-100" : "opacity-60 hover:opacity-100"
                                                 )}
                                          >
                                                 <div className={cn(
                                                        "h-12 w-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                                        selectedPlayer === p ? "bg-blue-500/10 border-2 border-blue-500 text-blue-500" : "bg-zinc-800 border-2 border-transparent text-muted-foreground"
                                                 )}>
                                                        <User className="text-xl" />
                                                 </div>
                                                 <span className={cn(
                                                        "text-[10px] font-semibold text-center leading-tight uppercase truncate w-full",
                                                        selectedPlayer === p ? "text-blue-500" : "text-muted-foreground"
                                                 )}>
                                                        {p.split(' ')[0]}<br />{p.split(' ')[1]?.charAt(0) || ''}
                                                 </span>
                                          </div>
                                   ))}
                            </div>
                     </div>

                     {/* PRODUCTS GRID */}
                     <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                   <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Productos</h3>
                                   <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                          Ver todo <ArrowRight className="w-3 h-3" />
                                   </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                   {filteredProducts.slice(0, 8).map(product => (
                                          <div
                                                 key={product.id}
                                                 onClick={() => handleAdd(product)}
                                                 className="bg-card p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors group border border-border hover:border-primary/30"
                                          >
                                                 <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={cn(
                                                               "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-lg",
                                                               product.category.toLowerCase().includes('bebida') ? "bg-blue-900/30 text-blue-400" : "bg-orange-900/30 text-orange-400"
                                                        )}>
                                                               {product.category.toLowerCase().includes('bebida') ? '🥤' : '🎾'}
                                                        </div>
                                                        <div className="min-w-0">
                                                               <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                                                               <p className="text-xs text-zinc-400">${product.price.toLocaleString()}</p>
                                                        </div>
                                                 </div>
                                                 <button className="h-8 w-8 shrink-0 rounded-full bg-[#121214] border border-zinc-700 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                        <Plus className="w-4 h-4" />
                                                 </button>
                                          </div>
                                   ))}
                            </div>
                     </div>

                     {/* CONSUMPTION SUMMARY */}
                     {items.length > 0 && (
                            <div className="bg-card rounded-2xl p-5 border border-border mt-2">
                                   <div className="flex justify-between items-center mb-4">
                                          <div className="flex items-center gap-2">
                                                 <ShoppingCart className="text-zinc-400 w-5 h-5" />
                                                 <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Consumos</h3>
                                          </div>
                                          <span className="px-2 py-1 rounded-md bg-blue-600 text-foreground text-[10px] font-bold">{items.length} ITEMS</span>
                                   </div>
                                   <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-1 mb-3">
                                          {items.map(item => (
                                                 <div key={item.id} className="flex justify-between items-center text-xs">
                                                        <div className="flex flex-col">
                                                               <span className="text-zinc-300 font-medium">{item.product?.name} x{item.quantity}</span>
                                                               <span className="text-[9px] text-muted-foreground uppercase">{item.playerName || 'General'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                               <span className="text-foreground font-bold">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                               <button onClick={() => onRemoveItem(item.id)} className="text-red-500/50 hover:text-red-500"><Trash className="w-3 h-3" /></button>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                                   <div className="h-px bg-zinc-800 w-full mb-3"></div>
                                   <div className="flex justify-between items-end">
                                          <span className="text-base font-bold text-foreground">TOTAL KIOSCO</span>
                                          <span className="text-3xl font-extrabold text-blue-500 leading-none">${totalAmount.toLocaleString()}</span>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
