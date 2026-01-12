'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Search, Plus, Minus, Trash, ShoppingCart, ChevronRight, User, Armchair, Calculator } from 'lucide-react'

// Custom colors from user snippet design
const COLORS = {
       backgroundDark: "#0a0a0b",
       cardDark: "#161618",
       primary: "#3b82f6",
       accentGreen: "#22c55e",
       accentYellow: "#eab308"
}

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

       // Filter products
       const filteredProducts = useMemo(() => {
              return products.filter(p =>
                     p.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
       }, [products, searchTerm])

       // Top Products (Just take first 4 for demo or all if filtered)
       const displayProducts = filteredProducts

       const handleAdd = (product: Product) => {
              onAddItem(product.id, 1, selectedPlayer || undefined)
       }

       const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

       return (
              <div className="flex flex-col gap-6 h-full pb-20">
                     {/* SEARCH SECTION */}
                     <section className="space-y-4 shrink-0">
                            <div className="relative">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                   <input
                                          value={searchTerm}
                                          onChange={e => setSearchTerm(e.target.value)}
                                          className="w-full pl-10 pr-4 py-3 bg-[#161618] border-none rounded-2xl shadow-sm ring-1 ring-slate-700 focus:ring-2 focus:ring-[#3b82f6] transition-all text-white placeholder:text-slate-500 outline-none"
                                          placeholder="Buscar bebidas, snacks..."
                                          type="text"
                                   />
                            </div>

                            <div className="flex flex-col gap-2">
                                   <label className="text-xs font-bold text-slate-500 uppercase px-1">Asignar Consumo a:</label>
                                   <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar custom-scrollbar">
                                          {/* General Option */}
                                          <button
                                                 onClick={() => setSelectedPlayer("")}
                                                 className="flex flex-col items-center gap-1 min-w-[70px] group"
                                          >
                                                 <div className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                                                        selectedPlayer === "" ? "bg-[#161618] border-[#3b82f6]" : "bg-[#161618] border-transparent group-hover:bg-white/5"
                                                 )}>
                                                        <Armchair className={cn("w-5 h-5", selectedPlayer === "" ? "text-[#3b82f6]" : "text-slate-400")} />
                                                 </div>
                                                 <span className={cn("text-[10px] font-bold", selectedPlayer === "" ? "text-[#3b82f6]" : "text-slate-500")}>General</span>
                                          </button>

                                          {/* Players */}
                                          {players.length > 0 ? players.map((p, i) => (
                                                 <button
                                                        key={i}
                                                        onClick={() => setSelectedPlayer(p)}
                                                        className="flex flex-col items-center gap-1 min-w-[70px] group"
                                                 >
                                                        <div className={cn(
                                                               "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                                                               selectedPlayer === p ? "bg-[#161618] border-[#3b82f6]" : "bg-[#161618] border-transparent group-hover:bg-white/5"
                                                        )}>
                                                               <User className={cn("w-5 h-5", selectedPlayer === p ? "text-[#3b82f6]" : "text-slate-400")} />
                                                        </div>
                                                        <span className={cn("text-[10px] font-medium truncate max-w-[70px]", selectedPlayer === p ? "text-[#3b82f6]" : "text-slate-500")}>{p}</span>
                                                 </button>
                                          )) : (
                                                 // Fallback if no players (shouldn't happen often)
                                                 <span className="text-slate-600 text-[10px] self-center">Sin jugadores</span>
                                          )}
                                   </div>
                            </div>
                     </section>

                     {/* PRODUCTS GRID */}
                     <section className="space-y-3 shrink-0">
                            <div className="flex items-center justify-between">
                                   <h3 className="font-bold text-white">Productos Populares</h3>
                                   <button className="flex items-center gap-1 text-[#3b82f6] text-xs font-bold uppercase hover:text-blue-400">
                                          Ver todo <ChevronRight className="w-4 h-4" />
                                   </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                   {displayProducts.slice(0, 4).map(product => (
                                          <div key={product.id} className="bg-[#161618] p-3 rounded-2xl shadow-sm border border-[#27272a] flex flex-col gap-3 relative overflow-hidden group">
                                                 {/* <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">-$200</div> */}
                                                 <div className="h-24 bg-slate-800/50 rounded-xl flex items-center justify-center">
                                                        <span className="text-4xl">🥤</span>
                                                 </div>
                                                 <div>
                                                        <h4 className="font-bold text-sm text-white leading-tight mb-1 truncate">{product.name}</h4>
                                                        <p className="text-[#3b82f6] font-extrabold text-sm">${product.price.toLocaleString()}</p>
                                                 </div>
                                                 <button
                                                        onClick={() => handleAdd(product)}
                                                        disabled={loading}
                                                        className="w-full bg-[#1e293b] hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                                 >
                                                        <Plus className="w-4 h-4" /> AGREGAR
                                                 </button>
                                          </div>
                                   ))}
                                   {displayProducts.length === 0 && (
                                          <div className="col-span-2 text-center text-slate-500 py-8">No se encontraron productos</div>
                                   )}
                            </div>
                     </section>

                     {/* CONSUMOS LIST */}
                     <section className="bg-[#161618] rounded-3xl p-5 shadow-xl border border-[#27272a] flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                   <div className="flex items-center gap-2">
                                          <ShoppingCart className="text-[#3b82f6] w-5 h-5" />
                                          <h3 className="font-extrabold text-lg text-white">Consumos</h3>
                                   </div>
                                   <span className="bg-[#3b82f6] text-white text-[10px] font-black px-2 py-1 rounded-full">{items.length} ITEMS</span>
                            </div>

                            <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                   {items.map(item => (
                                          <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-slate-800/50 rounded-2xl">
                                                 <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-bold text-white truncate">{item.product?.name}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase truncate">
                                                               Asignado a: <span className="text-slate-300">{item.playerName || 'General'}</span>
                                                        </span>
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                        <div className="flex items-center bg-slate-700 rounded-lg p-1 shadow-sm">
                                                               {/* Logic for decrease quantity/remove not strictly in snippet but implied */}
                                                               {/* Assuming 'remove' is delete item entirely or decrease qty */}
                                                               <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                                                        </div>
                                                        <div className="text-right min-w-[60px]">
                                                               <p className="text-sm font-extrabold text-white">${(item.unitPrice * item.quantity).toLocaleString()}</p>
                                                        </div>
                                                        <button
                                                               onClick={() => onRemoveItem(item.id)}
                                                               className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"
                                                        >
                                                               <Trash className="w-4 h-4" />
                                                        </button>
                                                 </div>
                                          </div>
                                   ))}
                                   {items.length === 0 && (
                                          <div className="text-center text-slate-600 py-8 text-sm">No hay consumos agregados</div>
                                   )}
                            </div>

                            <div className="pt-4 border-t border-slate-700 space-y-3 shrink-0">
                                   <div className="flex justify-between items-center text-slate-400">
                                          <span className="text-sm font-medium">Subtotal Kiosco</span>
                                          <span className="font-bold">${totalAmount.toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between items-center text-white">
                                          <span className="text-lg font-black tracking-tight uppercase">Total Kiosco</span>
                                          <span className="text-2xl font-black text-[#3b82f6]">${totalAmount.toLocaleString()}</span>
                                   </div>
                                   {/* If this button should do something specific like pay ONLY kiosk, we'd need a handler. 
                                       For now I'll make it a visual button or scroll to pay? 
                                       The user mockup says "COBRAR KIOSCO". 
                                       I'll leave it as a visual call to action or maybe trigger payment flow for kiosk amount? 
                                       Currently parent handles payment. I won't wire it to logic unless requested, or just console log.
                                   */}
                                   <button className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                          <Calculator className="w-5 h-5" />
                                          COBRAR KIOSCO
                                   </button>
                            </div>
                     </section>
              </div>
       )
}
