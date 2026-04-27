'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2, SearchX, CupSoda, Cookie, Package, Plus, PackagePlus, Dumbbell, Shirt, CircleDot, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Product, Client } from './types'
import { restockProduct } from '@/actions/kiosco'

interface ProductGridProps {
       products: Product[]
       loading: boolean
       selectedClient: Client | null
       onAddToCart: (product: Product) => void
       onReloadProducts: () => void
}

function CategoryIcon({ category, size = 40 }: { category: string; size?: number }) {
       const cat = category.toLowerCase()
       if (cat.includes('bebida') || cat.includes('drink')) return <CupSoda size={size} />
       if (cat.includes('snack') || cat.includes('comida') || cat.includes('food')) return <Cookie size={size} />
       if (cat.includes('pelota') || cat.includes('ball')) return <CircleDot size={size} />
       if (cat.includes('ropa') || cat.includes('indument') || cat.includes('shirt') || cat.includes('remera')) return <Shirt size={size} />
       if (cat.includes('accesorio') || cat.includes('equip') || cat.includes('paleta') || cat.includes('pala')) return <Dumbbell size={size} />
       if (cat.includes('promo') || cat.includes('combo') || cat.includes('descuento')) return <Tag size={size} />
       return <Package size={size} />
}

function StockBadge({ stock }: { stock: number }) {
       if (stock === 0) return null
       if (stock <= 3) {
              return (
                     <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg border border-red-400/50 shadow-lg shadow-red-500/20">
                            ¡{stock} left!
                     </div>
              )
       }
       if (stock <= 10) {
              return (
                     <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-400/50">
                            {stock} ud.
                     </div>
              )
       }
       return (
              <div className="absolute top-2 right-2 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded-lg border">
                     {stock}
              </div>
       )
}

export function ProductGrid({ products, loading, selectedClient, onAddToCart, onReloadProducts }: ProductGridProps) {
       if (loading) {
              return (
                     <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground font-medium text-sm">Cargando catálogo...</p>
                     </div>
              )
       }

       if (products.length === 0) {
              return (
                     <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                            <SearchX className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-medium">No se encontraron productos</p>
                     </div>
              )
       }

       return (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 pb-20">
                     {products.map((p, idx) => {
                            const isMember = selectedClient?.membershipStatus === 'ACTIVE'
                            const hasDiscount = isMember && p.memberPrice && p.memberPrice < p.price
                            const displayPrice = hasDiscount ? p.memberPrice! : p.price
                            const isLowStock = p.stock > 0 && p.stock <= 10
                            const isVeryLow = p.stock > 0 && p.stock <= 3

                            return (
                                   <motion.div
                                          key={p.id}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                                          onClick={() => p.stock > 0 && onAddToCart(p)}
                                          className={cn(
                                                 "group bg-white dark:bg-white/5 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-300 border cursor-pointer relative overflow-hidden",
                                                 p.stock === 0
                                                        ? "opacity-50 grayscale cursor-not-allowed border-slate-200 dark:border-white/10"
                                                        : isVeryLow
                                                               ? "border-red-200 dark:border-red-500/20 hover:border-red-400 dark:hover:border-red-400/50"
                                                               : isLowStock
                                                                      ? "border-amber-200 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-400/50"
                                                                      : "border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30"
                                          )}
                                   >
                                          <div className="aspect-square bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                                 {p.imageUrl ? (
                                                        <img src={p.imageUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" loading="lazy" />
                                                 ) : (
                                                        <div className={cn(
                                                               "transition-colors drop-shadow-sm dark:drop-shadow-lg",
                                                               isVeryLow ? "text-red-400 dark:text-red-500 group-hover:text-red-500" :
                                                               isLowStock ? "text-amber-400 dark:text-amber-500 group-hover:text-amber-500" :
                                                               "text-slate-400 dark:text-zinc-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400"
                                                        )}>
                                                               <CategoryIcon category={p.category} />
                                                        </div>
                                                 )}

                                                 <StockBadge stock={p.stock} />

                                                 {p.stock === 0 && (
                                                        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 flex items-center justify-center backdrop-blur-sm">
                                                               <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-red-500/20 uppercase tracking-widest border border-red-400/50">Agotado</span>
                                                        </div>
                                                 )}
                                                 {hasDiscount && (
                                                        <div className="absolute bottom-2 left-2 bg-emerald-500 text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                                                               SOCIO
                                                        </div>
                                                 )}

                                                 {/* Hover Add Overlay */}
                                                 {p.stock > 0 && (
                                                        <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                               <div className="bg-emerald-500 text-white dark:text-black rounded-full p-2.5 shadow-sm transform scale-50 group-hover:scale-100 transition-all duration-300">
                                                                      <Plus size={24} className="stroke-[3]" />
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          <div className="z-10 relative">
                                                 <h3 className={cn(
                                                        "font-bold text-sm leading-tight line-clamp-2 min-h-[2.5em] transition-colors",
                                                        isVeryLow ? "text-red-700 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" :
                                                        "text-slate-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300"
                                                 )}>{p.name}</h3>
                                                 <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 uppercase tracking-wider">{p.category}</p>
                                          </div>

                                          <div className="mt-auto flex items-end justify-between z-10 relative">
                                                 <div className="flex flex-col">
                                                        <span className="font-black text-lg text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-md">${displayPrice.toLocaleString()}</span>
                                                        {hasDiscount && <span className="text-[10px] text-slate-500 dark:text-zinc-500 line-through">${p.price.toLocaleString()}</span>}
                                                 </div>
                                                 <button
                                                        onClick={(e) => {
                                                               e.stopPropagation()
                                                               const qty = prompt(`Agregar Stock a ${p.name} (actual: ${p.stock}):`, '10')
                                                               const parsed = parseInt(qty || '')
                                                               if (!qty || isNaN(parsed) || parsed <= 0) return
                                                               restockProduct(p.id, parsed)
                                                                      .then(res => {
                                                                             if (res.success) {
                                                                                    toast.success(`+${parsed} unidades de ${p.name}`)
                                                                                    onReloadProducts()
                                                                             } else {
                                                                                    toast.error(res.error || 'Error al actualizar stock')
                                                                             }
                                                                      })
                                                                      .catch(() => toast.error('Error de conexión'))
                                                        }}
                                                        className="opacity-100 2xl:opacity-0 2xl:group-hover:opacity-100 text-slate-500 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-black/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all p-1.5 border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 shadow-sm"
                                                        title="Añadir stock rápido"
                                                 >
                                                        <PackagePlus size={16} />
                                                 </button>
                                          </div>
                                   </motion.div>
                            )
                     })}
              </div>
       )
}
