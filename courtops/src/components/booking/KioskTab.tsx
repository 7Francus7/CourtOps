import React, { useState } from 'react'
import { Search, Plus, ShoppingCart, User, Store, Users, DollarSign, RefreshCw, Wallet, Beer, Pizza, Trophy, X, Package } from 'lucide-react'
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
       onCollectPayment?: (player: any) => void
       players: any[]
}

export function KioskTab({ products, items, loading, onAddItem, onRemoveItem, onRecalculate, onCollectPayment, players }: KioskTabProps) {
       const { t } = useLanguage()
       const [search, setSearch] = useState("")
       const [selectedCategory, setSelectedCategory] = useState<string | "all">("all")
       const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>(undefined)

       const categories = ["all", ...Array.from(new Set(products.map(p => p.category || 'Varios')))]

       const filteredProducts = products.filter(p => {
              const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
              const matchesCategory = selectedCategory === "all" || (p.category || 'Varios') === selectedCategory
              return matchesSearch && matchesCategory
       })

       const getCategoryIcon = (category: string) => {
              const cat = category?.toLowerCase() || ''
              if (cat.includes('bebi')) return <Beer size={16} />
              if (cat.includes('comi') || cat.includes('snack')) return <Pizza size={16} />
              if (cat.includes('pelota') || cat.includes('acces') || cat.includes('grip') || cat.includes('indum')) return <Trophy size={16} />
              return <Store size={16} />
       }

       const generalTotal = items
              .filter(i => !i.playerName || i.playerName === 'General' || i.playerName === t('everyone'))
              .reduce((acc: number, i: any) => acc + (i.unitPrice * i.quantity), 0)

       const itemsTotal = items.reduce((acc: number, i: any) => acc + (i.unitPrice * i.quantity), 0)

       return (
              <div className="space-y-5">
                     {/* Search */}
                     <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600" size={15} />
                            <input
                                   type="text"
                                   placeholder={t('search_placeholder_kiosk')}
                                   value={search}
                                   onChange={(e) => setSearch(e.target.value)}
                                   className="w-full h-11 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                            />
                     </div>

                     {/* Player Selector + Categories */}
                     <div className="space-y-3">
                            {/* Who consumes */}
                            <div>
                                   <div className="flex items-center justify-between mb-2">
                                          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">¿Quién consume?</span>
                                          {!selectedPlayer && (
                                                 <span className="text-[9px] font-medium text-emerald-500 animate-pulse">General</span>
                                          )}
                                   </div>
                                   <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
                                          <button
                                                 onClick={() => setSelectedPlayer(undefined)}
                                                 className={cn(
                                                        "px-3.5 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0",
                                                        !selectedPlayer
                                                               ? "bg-emerald-500 text-white border-emerald-500"
                                                               : "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]"
                                                 )}
                                          >
                                                 <Users size={11} />
                                                 Todos
                                          </button>
                                          {players.map(player => (
                                                 <button
                                                        key={player.id}
                                                        onClick={() => setSelectedPlayer(player.name)}
                                                        className={cn(
                                                               "px-3.5 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0",
                                                               selectedPlayer === player.name
                                                                      ? "bg-primary text-primary-foreground border-primary"
                                                                      : "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]"
                                                        )}
                                                 >
                                                        <User size={11} />
                                                        {player.name}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* Categories */}
                            <div>
                                   <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">Categorías</span>
                                   <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
                                          {categories.map(cat => (
                                                 <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                               "px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap border shrink-0",
                                                               selectedCategory === cat
                                                                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                                                      : "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]"
                                                        )}
                                                 >
                                                        {cat === "all" ? "Todos" : cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Product Grid */}
                            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto custom-scrollbar pr-1 max-h-[calc(90vh-320px)] lg:max-h-[calc(90vh-250px)]">
                                   {filteredProducts.length === 0 ? (
                                          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                                 <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
                                                        <Package size={20} className="text-slate-300 dark:text-zinc-700" />
                                                 </div>
                                                 <p className="text-sm text-slate-400 dark:text-zinc-600 font-medium">Sin productos</p>
                                                 <p className="text-[11px] text-slate-300 dark:text-zinc-700 mt-1">Agregá productos desde Configuración</p>
                                          </div>
                                   ) : (
                                          filteredProducts.map(product => (
                                                 <button
                                                        key={product.id}
                                                        onClick={() => onAddItem(product.id, 1, selectedPlayer)}
                                                        disabled={loading || product.stock <= 0}
                                                        className="group bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl p-3.5 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.02] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                                                 >
                                                        <div className="flex items-center justify-between mb-2.5">
                                                               <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 dark:text-zinc-600 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                                      {getCategoryIcon(product.category)}
                                                               </div>
                                                               <span className="text-sm font-bold text-primary tracking-tight">${product.price.toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 line-clamp-2 leading-tight mb-1.5">{product.name}</p>
                                                        <div className="flex items-center justify-between">
                                                               <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-medium">{product.category || 'Varios'}</span>
                                                               {product.stock > 0 && product.stock <= 5 && (
                                                                      <span className="text-[9px] text-amber-500 font-medium">Stock: {product.stock}</span>
                                                               )}
                                                        </div>
                                                 </button>
                                          ))
                                   )}
                            </div>

                            {/* Sidebar: Cart + Summary */}
                            <div className="flex flex-col gap-4">
                                   {/* Cart */}
                                   <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl p-4">
                                          <div className="flex items-center justify-between mb-4">
                                                 <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                               <ShoppingCart size={13} />
                                                        </div>
                                                        <span className="text-[12px] font-semibold text-slate-700 dark:text-white">{t('current_consumptions')}</span>
                                                 </div>
                                                 {items.length > 0 && (
                                                        <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 bg-white dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-white/[0.06]">
                                                               {items.length}
                                                        </span>
                                                 )}
                                          </div>

                                          {items.length === 0 ? (
                                                 <div className="py-10 flex flex-col items-center text-center">
                                                        <Store size={20} className="mb-2 text-slate-300 dark:text-zinc-700" />
                                                        <p className="text-[11px] text-slate-400 dark:text-zinc-600 font-medium">Sin consumos</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        {items.map((item: any) => (
                                                               <div key={item.id} className="flex items-center justify-between group gap-2 py-2.5 px-2 rounded-lg hover:bg-white dark:hover:bg-white/[0.02] transition-colors">
                                                                      <div className="min-w-0 flex-1">
                                                                             <div className="flex items-center gap-1.5">
                                                                                    <span className="text-[12px] font-medium text-slate-700 dark:text-white truncate">{item.product?.name || 'Producto'}</span>
                                                                                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">x{item.quantity}</span>
                                                                             </div>
                                                                             <div className="flex items-center gap-1 mt-0.5">
                                                                                    <User size={8} className="text-slate-400 dark:text-zinc-600 shrink-0" />
                                                                                    <span className={cn(
                                                                                           "text-[9px] font-medium truncate",
                                                                                           !item.playerName || item.playerName === 'General' ? "text-emerald-500" : "text-slate-400 dark:text-zinc-600"
                                                                                    )}>
                                                                                           {item.playerName || t('everyone')}
                                                                                    </span>
                                                                             </div>
                                                                      </div>
                                                                      <div className="flex items-center gap-2 shrink-0">
                                                                             <span className="text-[12px] font-semibold text-slate-800 dark:text-white">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                             <button
                                                                                    onClick={() => onRemoveItem(item.id)}
                                                                                    className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                             >
                                                                                    <X size={12} />
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        ))}

                                                        {/* Cart Total */}
                                                        <div className="pt-2.5 mt-1.5 border-t border-slate-200/60 dark:border-white/[0.04] flex justify-between items-center px-2">
                                                               <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Total kiosco</span>
                                                               <span className="text-sm font-bold text-slate-900 dark:text-white">${itemsTotal.toLocaleString()}</span>
                                                        </div>
                                                 </div>
                                          )}
                                   </div>

                                   {/* Per-Person Summary */}
                                   <div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl p-4">
                                          <div className="flex items-center justify-between mb-3.5">
                                                 <div className="flex items-center gap-2">
                                                        <DollarSign size={12} className="text-slate-400 dark:text-zinc-500" />
                                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-500">Resumen por persona</span>
                                                 </div>
                                                 {onRecalculate && (
                                                        <button
                                                               onClick={onRecalculate}
                                                               className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-95"
                                                               title="Recalcular"
                                                        >
                                                               <RefreshCw size={11} />
                                                        </button>
                                                 )}
                                          </div>

                                          <div className="space-y-1">
                                                 {/* Shared */}
                                                 {generalTotal > 0 && (
                                                        <div className="flex justify-between items-center px-3 py-2 bg-emerald-50/50 dark:bg-emerald-500/[0.04] rounded-lg">
                                                               <div>
                                                                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">Compartido</span>
                                                                      <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-medium">Kiosco General</span>
                                                               </div>
                                                               <span className="text-[12px] font-bold text-slate-800 dark:text-white">${generalTotal.toLocaleString()}</span>
                                                        </div>
                                                 )}

                                                 {players.map(p => (
                                                        <div key={p.id} className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                               <div>
                                                                      <span className="text-[10px] font-medium text-slate-600 dark:text-zinc-400 block">{p.name}</span>
                                                                      {p.isPaid ? (
                                                                             <span className="text-[9px] text-emerald-500 font-medium">Pagado</span>
                                                                      ) : (
                                                                             <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-medium">Pendiente</span>
                                                                      )}
                                                               </div>
                                                               <div className="flex items-center gap-2">
                                                                      <span className={cn(
                                                                             "text-[12px] font-bold",
                                                                             p.isPaid ? "text-emerald-500" : "text-slate-800 dark:text-white"
                                                                      )}>
                                                                             ${(p.amount || 0).toLocaleString()}
                                                                      </span>
                                                                      {!p.isPaid && p.amount > 0 && onCollectPayment && (
                                                                             <button
                                                                                    onClick={() => onCollectPayment(p)}
                                                                                    className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center active:scale-90 transition-all"
                                                                                    title="Cobrar"
                                                                             >
                                                                                    <Wallet size={11} />
                                                                             </button>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
