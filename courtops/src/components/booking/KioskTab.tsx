'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Search, Plus, Minus, Trash, ShoppingCart, User, Users, Armchair, Calculator } from 'lucide-react'

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
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
                     {/* SEARCH */}
                     <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   placeholder="Buscar bebidas, snacks..."
                                   className="w-full h-14 pl-12 pr-4 bg-[#161618] border-none rounded-2xl font-bold text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                            />
                     </div>

                     {/* PLAYER SELECTOR */}
                     <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Asignar consumo a:</h3>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                   <button
                                          onClick={() => setSelectedPlayer("")}
                                          className="flex flex-col items-center gap-2 shrink-0 group"
                                   >
                                          <div className={cn(
                                                 "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                                                 selectedPlayer === "" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-transparent bg-[#161618] text-slate-500"
                                          )}>
                                                 <Users className="w-5 h-5" />
                                          </div>
                                          <span className={cn("text-[8px] font-black tracking-tighter uppercase", selectedPlayer === "" ? "text-blue-500" : "text-slate-600")}>Consumen Todos</span>
                                   </button>
                                   {players.map((p, i) => (
                                          <button
                                                 key={i}
                                                 onClick={() => setSelectedPlayer(p)}
                                                 className="flex flex-col items-center gap-2 shrink-0 group max-w-[64px]"
                                          >
                                                 <div className={cn(
                                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                                                        selectedPlayer === p ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-transparent bg-[#161618] text-slate-500"
                                                 )}>
                                                        <User className="w-5 h-5" />
                                                 </div>
                                                 <span className={cn("text-[8px] font-black tracking-tighter truncate w-full text-center", selectedPlayer === p ? "text-blue-500" : "text-slate-600 uppercase")}>{p}</span>
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* POPULAR PRODUCTS */}
                     <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Productos Populares</h3>
                                   <button className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">Ver todo ➔</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                   {filteredProducts.slice(0, 4).map(product => (
                                          <div key={product.id} className="bg-[#161618] rounded-[24px] p-4 flex flex-col gap-3 relative overflow-hidden group border border-[#27272a]">
                                                 {/* Mock Discount Tag */}
                                                 <div className="absolute top-3 right-3 bg-[#12c48b] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">-$200</div>
                                                 <div className="h-24 bg-[#0a0a0b] rounded-2xl flex items-center justify-center text-4xl">
                                                        {product.category.toLowerCase().includes('bebida') ? '🥤' :
                                                               product.name.toLowerCase().includes('pelota') ? '🎾' : '🍔'}
                                                 </div>
                                                 <div className="flex flex-col gap-1">
                                                        <h4 className="text-xs font-black text-white truncate leading-none">{product.name}</h4>
                                                        <p className="text-blue-500 font-black text-sm">${product.price.toLocaleString()}</p>
                                                 </div>
                                                 <button
                                                        onClick={() => handleAdd(product)}
                                                        disabled={loading}
                                                        className="w-full h-10 bg-[#3b82f6]/10 hover:bg-[#3b82f6] text-[#3b82f6] hover:text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1"
                                                 >
                                                        <Plus className="w-4 h-4" /> AGREGAR
                                                 </button>
                                          </div>
                                   ))}
                            </div>
                     </div>

                     {/* CONSUMOS CART */}
                     <div className="bg-[#161618] rounded-[28px] p-6 border border-[#27272a] space-y-6">
                            <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-2">
                                          <ShoppingCart className="w-5 h-5 text-blue-500" />
                                          <h3 className="text-sm font-black text-white uppercase tracking-tight">Consumos</h3>
                                   </div>
                                   <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-1 rounded-full">{items.length} ITEMS</span>
                            </div>

                            <div className="space-y-4">
                                   {items.map(item => (
                                          <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl">
                                                 <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[11px] font-black text-white truncate">{item.product?.name}</span>
                                                        <span className="text-[8px] font-bold text-slate-500 uppercase truncate">Asignado a: <span className="text-slate-400">{item.playerName || 'General'}</span></span>
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                        <div className="flex items-center bg-[#0a0a0b] rounded-lg h-8 overflow-hidden border border-white/5">
                                                               <button className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-slate-500"><Minus className="w-3 h-3" /></button>
                                                               <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                               <button className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-blue-500"><Plus className="w-3 h-3" /></button>
                                                        </div>
                                                        <div className="text-right min-w-[50px]">
                                                               <span className="text-[11px] font-black">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                        <button
                                                               onClick={() => onRemoveItem(item.id)}
                                                               className="p-1.5 text-red-500/50 hover:text-red-500 transition-colors"
                                                        >
                                                               <Trash className="w-4 h-4" />
                                                        </button>
                                                 </div>
                                          </div>
                                   ))}
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-4">
                                   <div className="flex justify-between text-[11px] font-bold text-slate-400">
                                          <span>Subtotal Kiosco</span>
                                          <span>${totalAmount.toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between items-end">
                                          <span className="text-lg font-black tracking-tight uppercase">Total Kiosco</span>
                                          <span className="text-3xl font-black text-blue-500">${totalAmount.toLocaleString()}</span>
                                   </div>
                                   <button className="w-full h-16 bg-[#3b82f6] rounded-[20px] shadow-lg shadow-blue-500/20 text-white font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                          <Calculator className="w-6 h-6" />
                                          COBRAR KIOSCO
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
