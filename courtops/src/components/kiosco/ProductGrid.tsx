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
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                            <p className="text-zinc-500 font-medium text-sm">Cargando catálogo...</p>
                     </div>
              )
       }

       if (products.length === 0) {
              return (
                     <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-zinc-600">
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
                                                 "group bg-[#18181B] hover:bg-[#202024] rounded-2xl p-3 flex flex-col gap-3 transition-all border border-zinc-800 hover:border-zinc-700 cursor-pointer relative overflow-hidden",
                                                 p.stock === 0 && "opacity-50 grayscale cursor-not-allowed"
                                          )}
                                   >
                                          <div className="aspect-square bg-[#121214] rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                                                 <div className="text-zinc-700 group-hover:text-zinc-600 transition-colors">
                                                        {p.category.toLowerCase().includes('bebida') ? <CupSoda size={40} /> :
                                                               p.category.toLowerCase().includes('snack') ? <Cookie size={40} /> :
                                                                      <Package size={40} />}
                                                 </div>

                                                 {p.stock > 0 && (
                                                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/5">
                                                               {p.stock}
                                                        </div>
                                                 )}
                                                 {p.stock === 0 && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                                               <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">Sin Stock</span>
                                                        </div>
                                                 )}
                                                 {hasDiscount && (
                                                        <div className="absolute top-2 left-2 bg-[#D4FF00] text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-lg shadow-[#D4FF00]/20">
                                                               SOCIO
                                                        </div>
                                                 )}

                                                 {/* Hover Add Overlay */}
                                                 {p.stock > 0 && (
                                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                               <div className="bg-blue-600 text-white rounded-full p-2 shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                                                      <Plus size={24} />
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          <div>
                                                 <h3 className="font-bold text-gray-200 text-sm leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-white transition-colors">{p.name}</h3>
                                                 <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{p.category}</p>
                                          </div>

                                          <div className="mt-auto flex items-end justify-between">
                                                 <div className="flex flex-col">
                                                        <span className="font-bold text-lg text-white">${displayPrice}</span>
                                                        {hasDiscount && <span className="text-[10px] text-zinc-500 line-through">${p.price}</span>}
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
                                                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-blue-400 transition-all p-1"
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
