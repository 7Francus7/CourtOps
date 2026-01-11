'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, ScanBarcode, ChevronDown, Check, Plus, Minus, Search, ArrowLeft, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

type Product = {
       id?: number
       name: string
       category: string
       cost: number
       price: number
       memberPrice?: number | null
       stock: number
       minStock?: number
}

type Props = {
       isOpen: boolean
       onClose: () => void
       onSave: (product: Product) => void
       initialData?: Product | null
       isLoading?: boolean
}

// Mock Data for "Frequent Suppliers" and "Variants" (Design only)
const SUPPLIERS = [
       { id: 1, name: 'Coca-Cola', color: 'bg-red-500', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/800px-Coca-Cola_logo.svg.png' },
       { id: 2, name: 'Gatorade', color: 'bg-orange-500', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Gatorade_logo.svg' },
       { id: 3, name: 'Lays', color: 'bg-yellow-500', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lay%27s_Logo.svg/1200px-Lay%27s_Logo.svg.png' },
       { id: 4, name: 'Arcor', color: 'bg-blue-500', img: '' },
]

const FLAVORS = ['Original', 'Zero', 'Light', 'Naranja', 'Lima']
const FORMATS = ['Lata 350ml', 'Botella 500ml', '1.5 Litros']

export default function ProductManagementModal({ isOpen, onClose, onSave, initialData, isLoading }: Props) {
       const [isMobile, setIsMobile] = useState(false)
       const [formData, setFormData] = useState<Product>({
              name: '',
              category: 'Bebidas',
              cost: 0,
              price: 0,
              memberPrice: null,
              stock: 0,
              minStock: 5
       })

       // UI States for Mobile Design Features
       const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null)
       const [selectedFlavor, setSelectedFlavor] = useState<string>('Original')
       const [selectedFormat, setSelectedFormat] = useState<string>('Botella 500ml')

       useEffect(() => {
              if (initialData) {
                     setFormData(initialData)
              } else {
                     setFormData({
                            name: '',
                            category: 'Bebidas',
                            cost: 0,
                            price: 0,
                            memberPrice: null,
                            stock: 0,
                            minStock: 5
                     })
              }
       }, [initialData, isOpen])

       // Responsive Check
       useEffect(() => {
              const checkMobile = () => setIsMobile(window.innerWidth < 768)
              checkMobile()
              window.addEventListener('resize', checkMobile)
              return () => window.removeEventListener('resize', checkMobile)
       }, [])

       const handleSubmit = (e: React.FormEvent) => {
              e.preventDefault()
              onSave(formData)
       }

       if (!isOpen) return null

       // --- MOBILE VERSION ---
       if (isMobile) {
              return (
                     <div className="fixed inset-0 z-[1000] bg-[#090b0e] text-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
                            {/* Mobile Header logic */}
                            <div className="sticky top-0 bg-[#090b0e]/90 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-white/5">
                                   <button onClick={onClose} className="p-2 -ml-2 text-white/70 hover:text-white">
                                          <ArrowLeft size={24} />
                                   </button>
                                   <h2 className="text-lg font-bold">Nuevo Producto</h2>
                                   <div className="w-8" /> {/* Spacer */}
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-8 pb-32">
                                   {/* Identification / Scan */}
                                   <div className="space-y-2">
                                          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Identificación</p>
                                          <div className="relative border border-[#22c55e] border-dashed bg-[#22c55e]/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-[#22c55e]/10 transition-colors">
                                                 <div className="flex items-center gap-3 text-[#22c55e]">
                                                        <ScanBarcode size={24} />
                                                        <span className="text-sm font-medium">Escanear o ingresar código...</span>
                                                 </div>
                                                 <div className="bg-[#22c55e] text-black p-2 rounded-xl">
                                                        <Camera size={20} />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Suppliers */}
                                   <div className="space-y-4">
                                          <div className="flex justify-between items-end">
                                                 <p className="text-sm font-bold text-white">Proveedor Frecuente</p>
                                                 <button type="button" className="text-xs text-[#22c55e] font-bold">Ver todos</button>
                                          </div>
                                          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                                 {SUPPLIERS.map(sup => (
                                                        <button
                                                               key={sup.id}
                                                               type="button"
                                                               onClick={() => setSelectedSupplier(sup.id)}
                                                               className={cn(
                                                                      "flex flex-col items-center gap-2 min-w-[80px] group transition-all",
                                                                      selectedSupplier === sup.id ? "scale-105" : "opacity-60 hover:opacity-100"
                                                               )}
                                                        >
                                                               <div className={cn(
                                                                      "w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white/5 border-2 transition-colors",
                                                                      selectedSupplier === sup.id ? "border-[#22c55e]" : "border-transparent"
                                                               )}>
                                                                      {selectedSupplier === sup.id && (
                                                                             <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-[#22c55e] rounded-full text-black">
                                                                                    <Check size={12} strokeWidth={4} />
                                                                             </div>
                                                                      )}
                                                                      <span className="text-2xl font-black text-white/20 select-none uppercase">{sup.name.slice(0, 1)}</span>
                                                               </div>
                                                               <span className={cn("text-xs font-medium", selectedSupplier === sup.id ? "text-[#22c55e]" : "text-gray-400")}>
                                                                      {sup.name}
                                                               </span>
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Details & Variants */}
                                   <div className="space-y-6">
                                          <h3 className="text-sm font-bold text-white">Detalles y Variantes</h3>

                                          {/* Name input (Hidden logic or main input) */}
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nombre del Producto</label>
                                                 <input
                                                        className="w-full bg-[#1A1D21] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#22c55e] transition-colors"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="Ej: Coca Cola Zero"
                                                 />
                                          </div>

                                          {/* Flavors */}
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sabor</label>
                                                 <div className="flex flex-wrap gap-2">
                                                        {FLAVORS.map(flavor => (
                                                               <button
                                                                      key={flavor}
                                                                      type="button"
                                                                      onClick={() => setSelectedFlavor(flavor)}
                                                                      className={cn(
                                                                             "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                                             selectedFlavor === flavor
                                                                                    ? "bg-[#22c55e] text-black border-[#22c55e]"
                                                                                    : "bg-transparent text-gray-400 border-white/10 hover:border-white/30"
                                                                      )}
                                                               >
                                                                      {flavor}
                                                               </button>
                                                        ))}
                                                        <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full border border-dashed border-white/30 text-white/50 hover:text-white hover:border-white">
                                                               <Plus size={16} />
                                                        </button>
                                                 </div>
                                          </div>

                                          {/* Formats */}
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Formato</label>
                                                 <div className="flex flex-wrap gap-2">
                                                        {FORMATS.map(fmt => (
                                                               <button
                                                                      key={fmt}
                                                                      type="button"
                                                                      onClick={() => setSelectedFormat(fmt)}
                                                                      className={cn(
                                                                             "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                                             selectedFormat === fmt
                                                                                    ? "bg-[#22c55e] text-black border-[#22c55e]"
                                                                                    : "bg-transparent text-gray-400 border-white/10 hover:border-white/30"
                                                                      )}
                                                               >
                                                                      {fmt}
                                                               </button>
                                                        ))}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Bottom Inputs (Stock & Price) */}
                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Stock Inicial</label>
                                                 <div className="relative flex items-center bg-[#1A1D21] border border-white/10 rounded-xl p-1">
                                                        <input
                                                               type="number"
                                                               className="w-full bg-transparent p-2 text-center text-xl font-bold text-white focus:outline-none"
                                                               value={formData.stock}
                                                               onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                        />
                                                        <div className="flex flex-col border-l border-white/10">
                                                               <button type="button" onClick={() => setFormData(p => ({ ...p, stock: p.stock + 1 }))} className="px-2 text-white/50 hover:text-white"><ChevronDown size={12} className="rotate-180" /></button>
                                                               <button type="button" onClick={() => setFormData(p => ({ ...p, stock: Math.max(0, p.stock - 1) }))} className="px-2 text-white/50 hover:text-white"><ChevronDown size={12} /></button>
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Precio Venta</label>
                                                 <div className="relative bg-[#1A1D21] border border-white/10 rounded-xl flex items-center px-4 py-3">
                                                        <span className="text-gray-500 font-normal mr-2">$</span>
                                                        <input
                                                               type="number"
                                                               className="w-full bg-transparent text-right text-xl font-bold text-white focus:outline-none placeholder-white/20"
                                                               placeholder="0.00"
                                                               value={formData.price || ''}
                                                               onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                        />
                                                 </div>
                                          </div>
                                   </div>
                            </form>

                            {/* Floating Action Bar */}
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#090b0e] to-transparent z-20">
                                   <div className="flex gap-3">
                                          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold bg-[#1A1D21] active:scale-95 transition-transform">
                                                 Cancelar
                                          </button>
                                          <button
                                                 onClick={handleSubmit}
                                                 disabled={isLoading}
                                                 className="flex-[2] py-4 rounded-xl bg-[#22c55e] text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                          >
                                                 {isLoading ? 'Guardando...' : (
                                                        <>
                                                               <Plus size={20} strokeWidth={3} />
                                                               Guardar Producto
                                                        </>
                                                 )}
                                          </button>
                                   </div>
                            </div>
                     </div>
              )
       }

       // --- DESKTOP VERSION ---
       return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                     <div className="bg-[#111418] w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 flex flex-col md:flex-row h-[600px]">

                            {/* Left Panel - Image Upload */}
                            <div className="w-full md:w-[400px] bg-[#0C0E11] p-8 flex flex-col items-center justify-center border-r border-white/5 relative group">
                                   <div className="absolute top-8 left-8">
                                          <h3 className="text-white font-bold text-lg">Imagen del Producto</h3>
                                   </div>

                                   <div className="w-full aspect-square max-w-[300px] rounded-[2rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#0078F0] hover:bg-[#0078F0]/5 transition-all group-hover:scale-105">
                                          <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                                 <Camera size={32} />
                                          </div>
                                          <div className="text-center">
                                                 <p className="text-brand-blue font-bold mb-1">Subir Imagen</p>
                                                 <p className="text-xs text-gray-500">Arrastra o haz clic para seleccionar</p>
                                          </div>
                                   </div>

                                   <p className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-wider">Formatos: JPG, PNG, WEBP. Max 5MB.</p>
                            </div>

                            {/* Right Panel - Form */}
                            <div className="flex-1 p-8 md:p-12 relative flex flex-col">
                                   <div className="flex justify-between items-start mb-10">
                                          <div>
                                                 <h2 className="text-3xl font-black text-white tracking-tight mb-2">Nuevo Producto</h2>
                                                 <p className="text-gray-400">Ingresa los detalles del inventario para el quiosco.</p>
                                          </div>
                                          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-white hover:rotate-90 transition-all">
                                                 <X size={24} />
                                          </button>
                                   </div>

                                   <form onSubmit={handleSubmit} className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                          <div className="space-y-3">
                                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
                                                 <input
                                                        className="w-full bg-[#1A1D21] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#0078F0] focus:ring-1 focus:ring-[#0078F0]"
                                                        placeholder="Ej. Bebida Energética XL"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        autoFocus
                                                 />
                                          </div>

                                          <div className="space-y-3">
                                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                                 <div className="relative">
                                                        <select
                                                               className="w-full bg-[#1A1D21] border border-white/10 rounded-2xl p-4 text-gray-300 appearance-none focus:text-white focus:outline-none focus:border-[#0078F0]"
                                                               value={formData.category}
                                                               onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        >
                                                               <option value="Bebidas">Bebidas</option>
                                                               <option value="Snacks">Snacks</option>
                                                               <option value="Accesorios">Accesorios</option>
                                                               <option value="Pelotas">Pelotas</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                                                 </div>
                                          </div>

                                          <div className="grid grid-cols-4 gap-6">
                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Costo</label>
                                                        <div className="relative bg-[#1A1D21] border border-white/10 rounded-2xl flex items-center px-4 py-3 group focus-within:border-[#0078F0]">
                                                               <span className="text-gray-500 font-bold mr-1">$</span>
                                                               <input
                                                                      type="number"
                                                                      className="w-full bg-transparent text-white font-mono font-bold focus:outline-none"
                                                                      placeholder="0.00"
                                                                      value={formData.cost || ''}
                                                                      onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Venta</label>
                                                        <div className="relative bg-[#1A1D21] border border-white/10 rounded-2xl flex items-center px-4 py-3 group focus-within:border-[#0078F0]">
                                                               <span className="text-gray-500 font-bold mr-1">$</span>
                                                               <input
                                                                      type="number"
                                                                      className="w-full bg-transparent text-[#0078F0] font-mono font-black focus:outline-none"
                                                                      placeholder="0.00"
                                                                      value={formData.price || ''}
                                                                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Stock</label>
                                                        <input
                                                               type="number"
                                                               className="w-full bg-[#1A1D21] border border-white/10 rounded-2xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#0078F0]"
                                                               placeholder="0"
                                                               value={formData.stock || ''}
                                                               onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                        />
                                                 </div>

                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Reorden</label>
                                                        <input
                                                               type="number"
                                                               className="w-full bg-[#1A1D21] border border-white/10 rounded-2xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#0078F0]"
                                                               placeholder="5"
                                                               value={formData.minStock || 5}
                                                               onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                                        />
                                                 </div>
                                          </div>
                                   </form>

                                   <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                                          <button
                                                 onClick={handleSubmit}
                                                 disabled={isLoading}
                                                 className="bg-[#0078F0] hover:bg-[#0060C0] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(0,120,240,0.3)] hover:shadow-[0_0_50px_rgba(0,120,240,0.5)] transition-all active:scale-95"
                                          >
                                                 {isLoading ? 'Guardando...' : 'Guardar Producto'}
                                                 <div className="bg-white/20 p-1 rounded-full">
                                                        <Check size={16} strokeWidth={3} />
                                                 </div>
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
