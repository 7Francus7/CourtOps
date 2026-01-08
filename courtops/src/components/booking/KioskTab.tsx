import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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
       players: string[] // List of player names for assignment
}

export function KioskTab({ products, items = [], loading, onAddItem, onRemoveItem, players = [] }: Props) {
       const [searchTerm, setSearchTerm] = useState("")
       const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
       const [quantity, setQuantity] = useState(1)
       const [selectedPlayer, setSelectedPlayer] = useState("")

       // Filter products
       const filteredProducts = useMemo(() => {
              return products.filter(p => {
                     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
                     const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory
                     return matchesSearch && matchesCategory
              })
       }, [products, searchTerm, selectedCategory])

       // Get unique categories
       const categories = useMemo(() => {
              const cats = new Set(products.map(p => p.category))
              return ["ALL", ...Array.from(cats)]
       }, [products])

       const handleQuickAdd = async (product: Product) => {
              await onAddItem(product.id, quantity, selectedPlayer || undefined)
              setQuantity(1) // Reset quantity after add
              // Optional: Keep player selected? Or reset? Let's keep it for rapid entry for same player.
       }

       return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-[500px]">

                     {/* LEFT: Product Selector */}
                     <div className="md:col-span-8 flex flex-col gap-4">

                            {/* Search & Filter Bar */}
                            <div className="flex gap-3 sticky top-0 bg-[#0B0D10]/95 backdrop-blur z-10 py-2">
                                   <div className="relative flex-1">
                                          <input
                                                 type="text"
                                                 placeholder="Buscar bebidas, snacks..."
                                                 className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand-blue focus:bg-white/10 transition-all font-medium"
                                                 value={searchTerm}
                                                 onChange={(e) => setSearchTerm(e.target.value)}
                                          />
                                          <svg className="absolute left-3 top-3.5 text-white/40" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                   </div>

                                   <select
                                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-blue"
                                          value={selectedCategory}
                                          onChange={(e) => setSelectedCategory(e.target.value)}
                                   >
                                          {categories.map(c => (
                                                 <option key={c} value={c}>{c === 'ALL' ? 'Todo' : c}</option>
                                          ))}
                                   </select>
                            </div>

                            {/* Quantity & Player Selector (Context for next add) */}
                            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                   <div className="flex items-center gap-2">
                                          <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Cantidad:</span>
                                          <div className="flex items-center bg-black/40 rounded-lg border border-white/10">
                                                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-white/10 text-white font-bold transition-all">-</button>
                                                 <span className="w-8 text-center font-mono text-white font-bold">{quantity}</span>
                                                 <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-white/10 text-white font-bold transition-all">+</button>
                                          </div>
                                   </div>

                                   <div className="h-4 w-px bg-white/10 mx-2" />

                                   <div className="flex items-center gap-2 flex-1">
                                          <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Asignar a:</span>
                                          <select
                                                 value={selectedPlayer}
                                                 onChange={(e) => setSelectedPlayer(e.target.value)}
                                                 className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-brand-blue flex-1"
                                          >
                                                 <option value="">-- General (Mesa) --</option>
                                                 {players.map((p, i) => (
                                                        <option key={i} value={p}>{p}</option>
                                                 ))}
                                          </select>
                                   </div>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                   {filteredProducts.map(product => (
                                          <button
                                                 key={product.id}
                                                 onClick={() => handleQuickAdd(product)}
                                                 disabled={loading || product.stock <= 0}
                                                 className={cn(
                                                        "group relative flex flex-col items-start p-3 rounded-xl border transition-all text-left overflow-hidden",
                                                        product.stock <= 0
                                                               ? "bg-red-500/5 border-red-500/10 opacity-60"
                                                               : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-brand-blue/30 hover:scale-[1.02] active:scale-95"
                                                 )}
                                          >
                                                 {product.stock <= 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                                                               <span className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-1 rounded">Sin Stock</span>
                                                        </div>
                                                 )}

                                                 <div className="w-full aspect-square bg-black/20 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                                                        {/* Placeholder icon or image */}
                                                        <span className="text-3xl opacity-50">🥤</span>
                                                 </div>

                                                 <div className="w-full">
                                                        <div className="flex justify-between items-start w-full">
                                                               <span className="font-bold text-white text-sm line-clamp-2 leading-tight">{product.name}</span>
                                                        </div>
                                                        <div className="flex justify-between items-end mt-1 w-full">
                                                               <span className="text-brand-green font-mono font-bold">${product.price}</span>
                                                               <span className="text-[10px] text-white/30 uppercase font-bold">{product.stock} un.</span>
                                                        </div>
                                                 </div>

                                                 {/* Hover Add Overlay */}
                                                 <div className="absolute inset-0 bg-brand-blue/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                        <span className="text-white font-black text-xl">+ AGREGAR</span>
                                                 </div>
                                          </button>
                                   ))}

                                   {filteredProducts.length === 0 && (
                                          <div className="col-span-full py-10 text-center text-white/30">
                                                 <p>No se encontraron productos</p>
                                          </div>
                                   )}
                            </div>
                     </div>

                     {/* RIGHT: Cart Summary */}
                     <div className="md:col-span-4 flex flex-col h-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                            <div className="p-4 bg-white/5 border-b border-white/5">
                                   <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                          🛒 Consumos
                                          <span className="bg-brand-blue text-white text-[10px] px-2 py-0.5 rounded-full">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                                   </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                   {items.map(item => (
                                          <div key={item.id} className="flex gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 group transition-colors">
                                                 <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-lg font-bold text-white/50 shrink-0">
                                                        {item.quantity}x
                                                 </div>

                                                 <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-white truncate">{item.product?.name || 'Producto eliminado'}</div>
                                                        <div className="flex justify-between items-center text-xs mt-0.5">
                                                               {item.playerName ? (
                                                                      <span className="text-brand-blue font-bold uppercase text-[9px] bg-brand-blue/10 px-1.5 rounded">{item.playerName}</span>
                                                               ) : (
                                                                      <span className="text-white/30 italic">General</span>
                                                               )}
                                                               <span className="font-mono text-white/70">${item.unitPrice * item.quantity}</span>
                                                        </div>
                                                 </div>

                                                 <button
                                                        onClick={() => onRemoveItem(item.id)}
                                                        disabled={loading}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                                        title="Eliminar"
                                                 >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                 </button>
                                          </div>
                                   ))}

                                   {items.length === 0 && (
                                          <div className="flex flex-col items-center justify-center h-48 text-white/20">
                                                 <span className="text-4xl mb-2">🛍️</span>
                                                 <p className="text-xs font-bold uppercase tracking-widest">Carrito vacío</p>
                                          </div>
                                   )}
                            </div>

                            <div className="p-4 bg-white/5 border-t border-white/5 space-y-2">
                                   <div className="flex justify-between text-sm text-white/50">
                                          <span>Subtotal</span>
                                          <span>${items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)}</span>
                                   </div>
                                   <div className="flex justify-between text-xl font-black text-white">
                                          <span>TOTAL</span>
                                          <span className="text-brand-green">${items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)}</span>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
