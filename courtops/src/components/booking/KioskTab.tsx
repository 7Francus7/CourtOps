'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Search, Plus, Trash, ShoppingCart, ChevronRight, User, Armchair, Calculator } from 'lucide-react'

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

       const handleAdd = (product: Product) => {
              onAddItem(product.id, 1, selectedPlayer || undefined)
       }

       const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

       return (
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 h-full bg-[#0a0a0b]">

                     {/* LEFT COLUMN: PRODUCT DISCOVERY */}
                     <div className="lg:col-span-7 flex flex-col gap-6 min-h-0">
                            {/* SEARCH & FILTER */}
                            <section className="space-y-5 flex-shrink-0">
                                   <div className="relative group">
                                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-[#3b82f6] transition-colors" />
                                          <input
                                                 value={searchTerm}
                                                 onChange={e => setSearchTerm(e.target.value)}
                                                 className="w-full pl-12 pr-4 py-4 bg-[#161618] border border-transparent rounded-[24px] shadow-sm focus:ring-2 focus:ring-[#3b82f6] transition-all text-white placeholder:text-slate-600 outline-none text-lg font-medium"
                                                 placeholder="¿Qué busca el cliente?"
                                                 type="text"
                                          />
                                   </div>

                                   <div className="space-y-3">
                                          <div className="flex items-center justify-between px-1">
                                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asignar Cargo a:</label>
                                                 {selectedPlayer !== "" && (
                                                        <button onClick={() => setSelectedPlayer("")} className="text-[10px] text-[#3b82f6] font-black uppercase">Limpiar</button>
                                                 )}
                                          </div>
                                          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                                                 {/* General Option */}
                                                 <button
                                                        onClick={() => setSelectedPlayer("")}
                                                        className="flex flex-col items-center gap-2 min-w-[80px] group transition-all"
                                                 >
                                                        <div className={cn(
                                                               "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-md",
                                                               selectedPlayer === "" ? "bg-[#3b82f6]/10 border-[#3b82f6] scale-105" : "bg-[#161618] border-transparent hover:border-slate-700"
                                                        )}>
                                                               <Armchair className={cn("w-6 h-6", selectedPlayer === "" ? "text-[#3b82f6]" : "text-slate-500 group-hover:text-slate-300")} />
                                                        </div>
                                                        <span className={cn("text-[10px] font-black tracking-tight", selectedPlayer === "" ? "text-[#3b82f6]" : "text-slate-500")}>GENERAL</span>
                                                 </button>

                                                 {/* Players */}
                                                 {players.map((p, i) => (
                                                        <button
                                                               key={i}
                                                               onClick={() => setSelectedPlayer(p)}
                                                               className="flex flex-col items-center gap-2 min-w-[80px] group transition-all"
                                                        >
                                                               <div className={cn(
                                                                      "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-md",
                                                                      selectedPlayer === p ? "bg-[#3b82f6]/10 border-[#3b82f6] scale-105" : "bg-[#161618] border-transparent hover:border-slate-700"
                                                               )}>
                                                                      <User className={cn("w-6 h-6", selectedPlayer === p ? "text-[#3b82f6]" : "text-slate-500 group-hover:text-slate-300")} />
                                                               </div>
                                                               <span className={cn("text-[10px] font-black tracking-tight truncate max-w-[80px]", selectedPlayer === p ? "text-[#3b82f6]" : "text-slate-500 uppercase")}>{p}</span>
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>
                            </section>

                            {/* PRODUCTS GRID */}
                            <section className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 pb-10">
                                   <div className="flex items-center justify-between mb-5">
                                          <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest">Catálogo de Productos</h3>
                                          <span className="text-[10px] text-slate-600 font-bold">{filteredProducts.length} DISPONIBLES</span>
                                   </div>
                                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                          {filteredProducts.map(product => (
                                                 <div key={product.id} className="bg-[#161618] p-4 rounded-[32px] shadow-sm border border-transparent hover:border-[#3b82f6]/30 group transition-all relative flex flex-col">
                                                        <div className="aspect-square bg-[#0a0a0b] rounded-[24px] flex items-center justify-center mb-4 group-hover:scale-95 transition-transform overflow-hidden relative">
                                                               <span className="text-4xl">🥤</span>
                                                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                                                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Añadir +</span>
                                                               </div>
                                                        </div>
                                                        <div className="flex-1">
                                                               <h4 className="font-black text-sm text-white leading-tight mb-1 truncate">{product.name}</h4>
                                                               <p className="text-[#3b82f6] font-black text-base">$ {product.price.toLocaleString()}</p>
                                                        </div>
                                                        <button
                                                               onClick={() => handleAdd(product)}
                                                               disabled={loading}
                                                               className="mt-4 w-full bg-[#3b82f6]/10 group-hover:bg-[#3b82f6] text-[#3b82f6] group-hover:text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95"
                                                        >
                                                               <Plus className="w-4 h-4" /> AGREGAR
                                                        </button>
                                                 </div>
                                          ))}
                                          {filteredProducts.length === 0 && (
                                                 <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-[40px]">
                                                        <p className="text-slate-600 font-bold text-lg italic">No se encontraron productos...</p>
                                                 </div>
                                          )}
                                   </div>
                            </section>
                     </div>

                     {/* RIGHT COLUMN: CART / CONSUMOS */}
                     <section className="lg:col-span-5 flex flex-col min-h-0 bg-[#161618] rounded-[40px] border border-[#27272a] shadow-2xl relative">
                            <div className="p-8 flex flex-col h-full">
                                   <div className="flex items-center justify-between mb-8">
                                          <div className="flex items-center gap-3">
                                                 <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 flex items-center justify-center">
                                                        <ShoppingCart className="text-[#3b82f6] w-6 h-6" />
                                                 </div>
                                                 <div>
                                                        <h3 className="font-black text-xl text-white tracking-tight">Consumos</h3>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen de cuenta</p>
                                                 </div>
                                          </div>
                                          <span className="bg-[#3b82f6] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-[#3b82f6]/20">
                                                 {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
                                          </span>
                                   </div>

                                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-h-[300px]">
                                          {items.map(item => (
                                                 <div key={item.id} className="flex items-center justify-between gap-4 p-4 bg-[#0a0a0b]/50 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors group">
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                               <span className="text-sm font-black text-white truncate group-hover:text-[#3b82f6] transition-colors">{item.product?.name}</span>
                                                               <div className="flex items-center gap-2 mt-1">
                                                                      <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[100px]">
                                                                             {item.playerName || 'GENERAL'}
                                                                      </span>
                                                                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                                      <span className="text-[10px] text-slate-600 font-bold">Cant: {item.quantity}</span>
                                                               </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                               <div className="text-right">
                                                                      <p className="text-base font-black text-white">$ {(item.unitPrice * item.quantity).toLocaleString()}</p>
                                                               </div>
                                                               <button
                                                                      onClick={() => onRemoveItem(item.id)}
                                                                      className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                               >
                                                                      <Trash className="w-4 h-4" />
                                                               </button>
                                                        </div>
                                                 </div>
                                          ))}
                                          {items.length === 0 && (
                                                 <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
                                                        <Calculator size={48} className="mb-4" />
                                                        <p className="text-sm font-bold uppercase tracking-widest">Sin consumos extra</p>
                                                 </div>
                                          )}
                                   </div>

                                   <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                          <div className="space-y-2">
                                                 <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                                                        <span>Subtotal Neto</span>
                                                        <span>${totalAmount.toLocaleString()}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center text-white">
                                                        <span className="text-2xl font-black tracking-tighter uppercase italic">Total Kiosco</span>
                                                        <span className="text-4xl font-black text-[#3b82f6] tracking-tighter shadow-[#3b82f6]/10 drop-shadow-2xl">
                                                               ${totalAmount.toLocaleString()}
                                                        </span>
                                                 </div>
                                          </div>

                                          <button className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 transition-all active:scale-[0.98] group overflow-hidden relative">
                                                 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                                 <Calculator className="w-6 h-6" />
                                                 LIQUIDAR KIOSCO
                                          </button>
                                   </div>
                            </div>
                     </section>
              </div>
       )
}
