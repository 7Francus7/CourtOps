import React, { useState } from 'react'
import { Search, Plus, Trash2, ShoppingCart, User, Store } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export type Product = {
       id: number
       name: string
       price: number
       stock: number
       category: string
}

interface KioskTabProps {
       products: Product[]
       items: any[]
       loading: boolean
       onAddItem: (productId: number, quantity: number, playerName?: string) => void
       onRemoveItem: (itemId: number) => void
       players: string[]
}

export function KioskTab({ products, items, loading, onAddItem, onRemoveItem, players }: KioskTabProps) {
       const { t } = useLanguage()
       const [search, setSearch] = useState("")
       const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>(undefined)

       const filteredProducts = products.filter(p =>
              p.name.toLowerCase().includes(search.toLowerCase())
       )

       return (
              <div className="space-y-6">
                     {/* Compact Toolbar */}
                     <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                                   <input
                                          type="text"
                                          placeholder={t('search_products')}
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary/30 transition-all placeholder:text-zinc-700 shadow-sm"
                                   />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                   <button
                                          onClick={() => setSelectedPlayer(undefined)}
                                          className={cn(
                                                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                                 !selectedPlayer ? "bg-primary text-black border-primary shadow-lg" : "bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10"
                                          )}
                                   >
                                          General
                                   </button>
                                   {players.map(player => (
                                          <button
                                                 key={player}
                                                 onClick={() => setSelectedPlayer(player)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                                        selectedPlayer === player ? "bg-primary text-black border-primary shadow-lg" : "bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10"
                                                 )}
                                          >
                                                 {player}
                                          </button>
                                   ))}
                            </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Smaller Product Grid */}
                            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                                   {filteredProducts.map(product => (
                                          <button
                                                 key={product.id}
                                                 onClick={() => onAddItem(product.id, 1, selectedPlayer)}
                                                 disabled={loading}
                                                 className="group bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-left transition-all hover:bg-white/5 hover:border-white/10 hover:-translate-y-1 active:scale-95 shadow-sm"
                                          >
                                                 <div className="flex items-center justify-between mb-2">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                               <Store size={14} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-primary">${product.price}</span>
                                                 </div>
                                                 <p className="text-xs font-bold text-zinc-300 truncate mb-1">{product.name}</p>
                                                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{product.category}</p>
                                          </button>
                                   ))}
                            </div>

                            {/* Minimal Consumption List */}
                            <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-6 h-fit sticky top-6 shadow-xl">
                                   <div className="flex items-center gap-3 mb-6">
                                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-500">
                                                 <ShoppingCart size={14} />
                                          </div>
                                          <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Consumo Actual</h3>
                                   </div>

                                   {items.length === 0 ? (
                                          <div className="py-12 flex flex-col items-center text-center">
                                                 <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Sin consumos</p>
                                          </div>
                                   ) : (
                                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                                 {items.map(item => (
                                                        <div key={item.id} className="flex items-center justify-between group">
                                                               <div className="min-w-0">
                                                                      <div className="flex items-center gap-2">
                                                                             <span className="text-[10px] font-bold text-white truncate">{item.product.name}</span>
                                                                             <span className="text-[9px] text-emerald-500 px-1 bg-emerald-500/10 rounded">x{item.quantity}</span>
                                                                      </div>
                                                                      <div className="flex items-center gap-1.5 mt-0.5">
                                                                             <User size={8} className="text-zinc-600" />
                                                                             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.playerName || 'General'}</span>
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-center gap-3 ml-4">
                                                                      <span className="text-xs font-black text-white">${item.unitPrice * item.quantity}</span>
                                                                      <button
                                                                             onClick={() => onRemoveItem(item.id)}
                                                                             className="w-8 h-8 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                                      >
                                                                             <Plus size={14} className="rotate-45" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
