'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2, SearchX, CupSoda, Cookie, Package, Plus, PackagePlus } from 'lucide-react'
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                     {products.map((p, idx) => {
                            const isMember = selectedClient?.membershipStatus === 'ACTIVE'
                            const hasDiscount = isMember && p.memberPrice && p.memberPrice < p.price
                            const displayPrice = hasDiscount ? p.memberPrice! : p.price

                            return (
                                   <motion.div
                                          key={p.id}
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: idx * 0.05 }}
                                          onClick={() => p.stock > 0 && onAddToCart(p)}
                                          className={cn(
                                                 "group bg-white/5 hover:bg-white/10 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-300 border border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer relative overflow-hidden backdrop-blur-sm",
                                                 p.stock === 0 && "opacity-50 grayscale cursor-not-allowed"
                                          )}
                                   >
                                          {/* Glow Effect */}
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

                                          <div className="aspect-square bg-black/40 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                                 <div className="text-zinc-600 group-hover:text-emerald-400 transition-colors drop-shadow-lg">
                                                        {p.category.toLowerCase().includes('bebida') ? <CupSoda size={40} /> :
                                                               p.category.toLowerCase().includes('snack') ? <Cookie size={40} /> :
                                                                      <Package size={40} />}
                                                 </div>

                                                 {p.stock > 0 && (
                                                        <div className="absolute top-2 right-2 bg-[#030712]/50 backdrop-blur-md text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded-lg border">
                                                               {p.stock}
                                                        </div>
                                                 )}
                                                 {p.stock === 0 && (
                                                        <div className="absolute inset-0 bg-[#030712]/80 flex items-center justify-center backdrop-blur-sm">
                                                               <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-red-500/20 uppercase tracking-widest border border-red-400/50">Agotado</span>
                                                        </div>
                                                 )}
                                                 {hasDiscount && (
                                                        <div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-[0_0_10px_rgba(16,185,129,0.5)] tracking-widest">
                                                               SOCIO
                                                        </div>
                                                 )}

                                                 {/* Hover Add Overlay */}
                                                 {p.stock > 0 && (
                                                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                               <div className="bg-emerald-500 text-black rounded-full p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] transform scale-50 group-hover:scale-100 transition-all duration-300">
                                                                      <Plus size={24} className="stroke-[3]" />
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          <div className="z-10 relative">
                                                 <h3 className="font-bold text-zinc-100 text-sm leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-emerald-300 transition-colors">{p.name}</h3>
                                                 <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{p.category}</p>
                                          </div>

                                          <div className="mt-auto flex items-end justify-between z-10 relative">
                                                 <div className="flex flex-col">
                                                        <span className="font-black text-lg text-white drop-shadow-md">${displayPrice.toLocaleString()}</span>
                                                        {hasDiscount && <span className="text-[10px] text-zinc-500 line-through">${p.price.toLocaleString()}</span>}
                                                 </div>
                                                 <button
                                                        onClick={(e) => {
                                                               e.stopPropagation()
                                                               const qty = prompt(`Agregar Stock a ${p.name}:`, '0')
                                                               if (qty && parseInt(qty) > 0) {
                                                                      restockProduct(p.id, parseInt(qty)).then(() => {
                                                                             toast.success("Stock actualizado")
                                                                             onReloadProducts()
                                                                      })
                                                               }
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-emerald-400 bg-black/40 hover:bg-emerald-500/20 rounded-lg transition-all p-1.5 border border-transparent hover:border-emerald-500/30"
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
