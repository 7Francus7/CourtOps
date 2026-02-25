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
                            <div className="relative flex-1 group shadow-sm">
                                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                                   <input
                                          type="text"
                                          placeholder={t('search_placeholder_kiosk')}
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full h-12 bg-[#F8F9FA] dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/30 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700"
                                   />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                   <button
                                          onClick={() => setSelectedPlayer(undefined)}
                                          className={cn(
                                                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                                 !selectedPlayer ? "bg-primary text-slate-900 border-primary shadow-lg" : "bg-[#F8F9FA] dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
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
                                                        selectedPlayer === player ? "bg-primary text-slate-900 border-primary shadow-lg" : "bg-[#F8F9FA] dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
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
                                                 className="group bg-[#F8F9FA] dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-left transition-all hover:bg-slate-100 dark:hover:bg-white/5 hover:border-primary/20 hover:-translate-y-1 active:scale-95 shadow-sm"
                                          >
                                                 <div className="flex items-center justify-between mb-2">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                               <Store size={14} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-primary">${product.price}</span>
                                                 </div>
                                                 <p className="text-xs font-bold text-slate-900 dark:text-zinc-300 truncate mb-1">{product.name}</p>
                                                 <p className="text-[9px] text-slate-400 dark:text-zinc-600 font-black uppercase tracking-widest">{product.category}</p>
                                          </button>
                                   ))}
                            </div>

                            {/* Minimal Consumption List */}
                            <div className="bg-[#F8F9FA] dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 h-fit sticky top-6 shadow-xl">
                                   <div className="flex items-center gap-3 mb-6">
                                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-emerald-500">
                                                 <ShoppingCart size={14} />
                                          </div>
                                          <h3 className="text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em]">{t('current_consumptions')}</h3>
                                   </div>

                                   {items.length === 0 ? (
                                          <div className="py-12 flex flex-col items-center text-center">
                                                 <p className="text-slate-300 dark:text-zinc-700 text-[10px] font-black uppercase tracking-widest">Sin consumos</p>
                                          </div>
                                   ) : (
                                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                                 {items.map(item => (
                                                        <div key={item.id} className="flex items-center justify-between group gap-2">
                                                               <div className="min-w-0 flex-1">
                                                                      <div className="flex items-center gap-2">
                                                                             <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate" title={item.product.name}>{item.product.name}</span>
                                                                             <span className="text-[9px] text-emerald-600 dark:text-emerald-500 px-1 bg-emerald-500/10 rounded shrink-0">x{item.quantity}</span>
                                                                      </div>
                                                                      <div className="flex items-center gap-1.5 mt-0.5">
                                                                             <User size={8} className="text-slate-400 dark:text-zinc-600 shrink-0" />
                                                                             <span className="text-[8px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest truncate">{item.playerName || 'General'}</span>
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-center gap-3 shrink-0">
                                                                      <span className="text-xs font-black text-slate-900 dark:text-white">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                      <button
                                                                             onClick={() => onRemoveItem(item.id)}
                                                                             className="w-8 h-8 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0"
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
