import React, { useState } from 'react'
import { Search, Plus, Trash2, ShoppingCart, User, Store, Users, DollarSign, RefreshCw } from 'lucide-react'
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
       onRecalculate?: () => void
       players: any[]
}

export function KioskTab({ products, items, loading, onAddItem, onRemoveItem, onRecalculate, players }: KioskTabProps) {
       const { t } = useLanguage()
       const [search, setSearch] = useState("")
       const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>(undefined)

       const filteredProducts = products.filter(p =>
              p.name.toLowerCase().includes(search.toLowerCase())
       )

       const generalTotal = items
              .filter(i => !i.playerName || i.playerName === 'General' || i.playerName === t('everyone'))
              .reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)

       return (
              <div className="space-y-6">
                     {/* Compact Toolbar */}
                     <div className="flex flex-col gap-4">
                            <div className="relative group shadow-sm">
                                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                                   <input
                                          type="text"
                                          placeholder={t('search_placeholder_kiosk')}
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full h-12 bg-[#F8F9FA] dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary/30 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700"
                                   />
                            </div>

                            <div className="flex flex-col gap-3">
                                   <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 ml-1">¿Quién consume?</span>
                                          {!selectedPlayer && (
                                                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Cargando a General</span>
                                          )}
                                   </div>
                                   <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                          <button
                                                 onClick={() => setSelectedPlayer(undefined)}
                                                 className={cn(
                                                        "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
                                                        !selectedPlayer
                                                               ? "bg-emerald-500 text-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                               : "bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50"
                                                 )}
                                          >
                                                 <Users size={12} />
                                                 {t('everyone')}
                                          </button>
                                          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 shrink-0" />
                                          {players.map(player => (
                                                 <button
                                                        key={player.id}
                                                        onClick={() => setSelectedPlayer(player.name)}
                                                        className={cn(
                                                               "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2",
                                                               selectedPlayer === player.name
                                                                      ? "bg-primary text-slate-900 border-primary shadow-lg shadow-primary/20"
                                                                      : "bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50"
                                                        )}
                                                 >
                                                        <User size={12} />
                                                        {player.name}
                                                 </button>
                                          ))}
                                   </div>
                            </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Larger Product Grid */}
                            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 h-[calc(90vh-300px)] lg:h-[calc(90vh-230px)]">
                                   {filteredProducts.map(product => (
                                          <button
                                                 key={product.id}
                                                 onClick={() => onAddItem(product.id, 1, selectedPlayer)}
                                                 disabled={loading}
                                                 className="group bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary/20 hover:-translate-y-1 active:scale-95 shadow-sm h-fit"
                                          >
                                                 <div className="flex items-center justify-between mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-slate-100 dark:border-white/5">
                                                               <Store size={18} />
                                                        </div>
                                                        <span className="text-sm font-black text-primary tracking-tighter">${product.price}</span>
                                                 </div>
                                                 <p className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 mb-1 leading-tight h-8">{product.name}</p>
                                                 <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[8px] text-slate-400 dark:text-zinc-600 font-black uppercase tracking-widest">{product.category || 'Varios'}</span>
                                                        {product.stock > 0 && <span className="text-[8px] text-emerald-500 font-bold">Stock: {product.stock}</span>}
                                                 </div>
                                          </button>
                                   ))}
                            </div>

                            {/* Cart Sidebar with Summary */}
                            <div className="flex flex-col gap-6">
                                   <div className="bg-[#F8F9FA] dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 h-fit shadow-xl">
                                          <div className="flex items-center justify-between mb-6">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                               <ShoppingCart size={14} />
                                                        </div>
                                                        <h3 className="text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em]">{t('current_consumptions')}</h3>
                                                 </div>
                                                 {items.length > 0 && (
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                                                               {items.length} items
                                                        </span>
                                                 )}
                                          </div>

                                          {items.length === 0 ? (
                                                 <div className="py-12 flex flex-col items-center text-center opacity-40">
                                                        <Store size={24} className="mb-3 text-slate-300 dark:text-zinc-700" />
                                                        <p className="text-slate-300 dark:text-zinc-700 text-[10px] font-black uppercase tracking-widest">Sin consumos</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {items.map(item => (
                                                               <div key={item.id} className="flex items-center justify-between group gap-2 pb-3 border-b border-slate-200/50 dark:border-white/5 last:border-0">
                                                                      <div className="min-w-0 flex-1">
                                                                             <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate" title={item.product.name}>{item.product.name}</span>
                                                                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded shrink-0">x{item.quantity}</span>
                                                                             </div>
                                                                             <div className="flex items-center gap-1.5 mt-1">
                                                                                    <User size={8} className="text-slate-400 dark:text-zinc-600 shrink-0" />
                                                                                    <span className={cn(
                                                                                           "text-[8px] font-black uppercase tracking-widest truncate",
                                                                                           !item.playerName || item.playerName === 'General' ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400 dark:text-zinc-600"
                                                                                    )}>
                                                                                           {item.playerName || t('everyone')}
                                                                                    </span>
                                                                             </div>
                                                                      </div>
                                                                      <div className="flex items-center gap-3 shrink-0">
                                                                             <span className="text-xs font-black text-slate-900 dark:text-white">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                             <button
                                                                                    onClick={() => onRemoveItem(item.id)}
                                                                                    className="w-8 h-8 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0 border border-transparent hover:border-red-500/20"
                                                                             >
                                                                                    <Plus size={14} className="rotate-45" />
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          )}
                                   </div>

                                   {/* Totals Summary */}
                                   <div className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                                          <div className="flex items-center justify-between mb-6">
                                                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 flex items-center gap-2">
                                                        <DollarSign size={12} /> Resumen por persona
                                                 </h4>
                                                 {onRecalculate && (
                                                        <button
                                                               onClick={onRecalculate}
                                                               className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all active:scale-95"
                                                               title="Dividir y Recalcular"
                                                        >
                                                               <RefreshCw size={12} />
                                                        </button>
                                                 )}
                                          </div>

                                          <div className="space-y-3 relative z-10">
                                                 <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 group">
                                                        <div className="flex flex-col">
                                                               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Pendiente Compartido</span>
                                                               <span className="text-[8px] text-slate-400 dark:text-zinc-600 font-bold">Kiosco Gral.</span>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform">${generalTotal.toLocaleString()}</span>
                                                 </div>

                                                 {players.map(p => (
                                                        <div key={p.id} className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors rounded-xl">
                                                               <div className="flex flex-col">
                                                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">{p.name}</span>
                                                                      {p.isPaid ? (
                                                                             <span className="text-[7px] text-emerald-500 font-black uppercase">Todo Pagado</span>
                                                                      ) : (
                                                                             <span className="text-[7px] text-slate-300 dark:text-zinc-700 font-black uppercase">Total a cobrar</span>
                                                                      )}
                                                               </div>
                                                               <span className={cn(
                                                                      "text-xs font-bold transition-all",
                                                                      p.isPaid ? "text-emerald-500 scale-90" : "text-slate-900 dark:text-white"
                                                               )}>
                                                                      ${(p.amount || 0).toLocaleString()}
                                                               </span>
                                                        </div>
                                                 ))}

                                                 <div className="mt-4 p-5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[1.5rem] border border-primary/20 text-center relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                                        <div className="relative z-10">
                                                               <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-1">Total General de la Mesa</p>
                                                               <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                                      ${(items.reduce((acc: number, i: any) => acc + (i.unitPrice * i.quantity), 0) + (players.reduce((acc: number, p: any) => acc + (p.amount || 0), 0))).toLocaleString()}
                                                               </p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
