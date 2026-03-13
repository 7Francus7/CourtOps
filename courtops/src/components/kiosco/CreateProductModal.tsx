'use client'

import React, { useState } from 'react'
import { X, PackagePlus, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react'
import { upsertProduct } from '@/actions/settings'
import { toast } from 'sonner'

interface CreateProductModalProps {
       onClose: () => void
       onSuccess: () => void
}

export function CreateProductModal({ onClose, onSuccess }: CreateProductModalProps) {
       const [processing, setProcessing] = useState(false)
       const [newProduct, setNewProduct] = useState({
              name: '',
              category: 'Bebidas',
              price: '',
              cost: '',
              stock: ''
       })
       const [imageUrl, setImageUrl] = useState<string>('')
       const [suggestedImages, setSuggestedImages] = useState<string[]>([])
       const [isSearchingImage, setIsSearchingImage] = useState(false)

       const handleCreateProduct = async () => {
              if (!newProduct.name || !newProduct.price || !newProduct.category) {
                     return toast.error("Completa campos obligatorios")
              }
              setProcessing(true)
              try {
                     const res = await upsertProduct({
                            name: newProduct.name,
                            category: newProduct.category,
                            price: parseFloat(newProduct.price),
                            cost: parseFloat(newProduct.cost) || 0,
                            stock: parseInt(newProduct.stock) || 0,
                            imageUrl: imageUrl || undefined
                     })

                     if (!res.success) throw new Error(res.error)

                     toast.success("Producto creado!")
                     onSuccess()
                     onClose()
              } catch (error: any) {
                     toast.error(error.message)
              } finally {
                     setProcessing(false)
              }
       }

       const searchImages = async () => {
              if (!newProduct.name) return toast.error("Escribe un nombre primero para buscar la foto")
              setIsSearchingImage(true)
              try {
                     const res = await fetch(`/api/images/search?q=${encodeURIComponent(newProduct.name)}`)
                     const data = await res.json()
                     if (data.images && data.images.length > 0) {
                            setSuggestedImages(data.images)
                            if (!imageUrl) setImageUrl(data.images[0])
                            toast.success("¡Imágenes encontradas!")
                     } else {
                            toast.error("No se encontraron imágenes")
                     }
              } catch (err) {
                     toast.error("Error al buscar imágenes")
              } finally {
                     setIsSearchingImage(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-zinc-950/80 backdrop-blur-md">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 rounded-3xl w-full max-w-md space-y-5">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
                                   <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                          <PackagePlus className="text-emerald-500 w-5 h-5" /> Nuevo Producto
                                   </h2>
                                   <button onClick={onClose} className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                          <X size={20} />
                                   </button>
                            </div>

                            <div className="space-y-4">
                                   <div className="space-y-1.5">
                                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Nombre del Producto</label>
                                          <div className="flex gap-2">
                                                 <input
                                                        placeholder="Ej: Gatorade Manzana"
                                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700"
                                                        value={newProduct.name}
                                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                 />
                                                 <button
                                                        onClick={searchImages}
                                                        disabled={isSearchingImage}
                                                        title="Buscar foto en Internet"
                                                        className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center justify-center min-w-[50px]"
                                                 >
                                                        {isSearchingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Image Suggestions Grid */}
                                   {(suggestedImages.length > 0 || imageUrl) && (
                                          <div className="space-y-2">
                                                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 flex items-center gap-1">
                                                        <ImageIcon size={14} /> Seleccionar Foto
                                                 </label>
                                                 {suggestedImages.length > 0 ? (
                                                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                                                               {suggestedImages.map((img, i) => (
                                                                      <img
                                                                             key={i}
                                                                             src={img}
                                                                             alt="suggested"
                                                                             onClick={() => setImageUrl(img)}
                                                                             className={`h-16 w-16 min-w-[64px] object-cover rounded-xl border-2 transition-all cursor-pointer ${imageUrl === img ? 'border-emerald-500 shadow-md scale-105' : 'border-transparent hover:border-emerald-500/50'}`}
                                                                      />
                                                               ))}
                                                        </div>
                                                 ) : (
                                                        <div className="flex p-2 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-white/10 items-center justify-center">
                                                               <img src={imageUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg" />
                                                        </div>
                                                 )}
                                          </div>
                                   )}

                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Precio Público ($)</label>
                                                 <input
                                                        placeholder="1500"
                                                        type="number"
                                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                                                        value={newProduct.price}
                                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                 />
                                          </div>
                                          <div className="space-y-1.5">
                                                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Stock Inicial</label>
                                                 <input
                                                        placeholder="24"
                                                        type="number"
                                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                                                        value={newProduct.stock}
                                                        onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                 />
                                          </div>
                                   </div>

                                   <div className="space-y-1.5">
                                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Categoría</label>
                                          <select
                                                 className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all"
                                                 value={newProduct.category}
                                                 onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                          >
                                                 <option value="Bebidas">🥤 Bebidas</option>
                                                 <option value="Snacks">🍫 Snacks</option>
                                                 <option value="Accesorios">🎾 Accesorios</option>
                                                 <option value="Alquiler">👕 Alquiler</option>
                                          </select>
                                   </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                   <button onClick={onClose} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white p-3.5 rounded-xl font-bold transition-colors">Cancelar</button>
                                   <button
                                          onClick={handleCreateProduct}
                                          disabled={processing}
                                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black p-3.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                                   >
                                          {processing ? 'Guardando...' : 'Guardar Producto'}
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
