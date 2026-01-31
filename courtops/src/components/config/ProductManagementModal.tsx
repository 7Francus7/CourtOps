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
                     <div className="fixed inset-0 z-[1000] bg-background text-foreground overflow-y-auto animate-in slide-in-from-bottom duration-300">
                            {/* Mobile Header logic */}
                            <div className="sticky top-0 bg-background/90 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-border">
                                   <button onClick={onClose} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                                          <ArrowLeft size={24} />
                                   </button>
                                   <h2 className="text-lg font-bold">Nuevo Producto</h2>
                                   <div className="w-8" /> {/* Spacer */}
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-8 pb-32">
                                   {/* Identification / Scan */}
                                   <div className="space-y-2">
                                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Identificación</p>
                                          <div className="relative border border-emerald-500 border-dashed bg-emerald-500/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-colors">
                                                 <div className="flex items-center gap-3 text-emerald-500">
                                                        <ScanBarcode size={24} />
                                                        <span className="text-sm font-medium">Escanear o ingresar código...</span>
                                                 </div>
                                                 <div className="bg-emerald-500 text-black p-2 rounded-xl">
                                                        <Camera size={20} />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Suppliers */}
                                   <div className="space-y-4">
                                          <div className="flex justify-between items-end">
                                                 <p className="text-sm font-bold text-foreground">Proveedor Frecuente</p>
                                                 <button type="button" className="text-xs text-emerald-500 font-bold">Ver todos</button>
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
                                                                      "w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden bg-muted border-2 transition-colors",
                                                                      selectedSupplier === sup.id ? "border-emerald-500" : "border-transparent"
                                                               )}>
                                                                      {selectedSupplier === sup.id && (
                                                                             <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full text-black">
                                                                                    <Check size={12} strokeWidth={4} />
                                                                             </div>
                                                                      )}
                                                                      <span className="text-2xl font-black text-muted-foreground/20 select-none uppercase">{sup.name.slice(0, 1)}</span>
                                                               </div>
                                                               <span className={cn("text-xs font-medium", selectedSupplier === sup.id ? "text-emerald-500" : "text-muted-foreground")}>
                                                                      {sup.name}
                                                               </span>
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Details & Variants */}
                                   <div className="space-y-6">
                                          <h3 className="text-sm font-bold text-foreground">Detalles y Variantes</h3>

                                          {/* Name input (Hidden logic or main input) */}
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Nombre del Producto</label>
                                                 <input
                                                        className="input-theme w-full"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="Ej: Coca Cola Zero"
                                                 />
                                          </div>

                                          {/* Flavors */}
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Sabor</label>
                                                 <div className="flex flex-wrap gap-2">
                                                        {FLAVORS.map(flavor => (
                                                               <button
                                                                      key={flavor}
                                                                      type="button"
                                                                      onClick={() => setSelectedFlavor(flavor)}
                                                                      className={cn(
                                                                             "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                                             selectedFlavor === flavor
                                                                                    ? "bg-emerald-500 text-black border-emerald-500"
                                                                                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                                                                      )}
                                                               >
                                                                      {flavor}
                                                               </button>
                                                        ))}
                                                        <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground">
                                                               <Plus size={16} />
                                                        </button>
                                                 </div>
                                          </div>

                                          {/* Formats */}
                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Formato</label>
                                                 <div className="flex flex-wrap gap-2">
                                                        {FORMATS.map(fmt => (
                                                               <button
                                                                      key={fmt}
                                                                      type="button"
                                                                      onClick={() => setSelectedFormat(fmt)}
                                                                      className={cn(
                                                                             "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                                             selectedFormat === fmt
                                                                                    ? "bg-emerald-500 text-black border-emerald-500"
                                                                                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
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
                                                 <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Stock Inicial</label>
                                                 <div className="relative flex items-center bg-muted border border-border rounded-xl p-1">
                                                        <input
                                                               type="number"
                                                               className="w-full bg-transparent p-2 text-center text-xl font-bold text-foreground focus:outline-none"
                                                               value={formData.stock}
                                                               onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                        />
                                                        <div className="flex flex-col border-l border-border">
                                                               <button type="button" onClick={() => setFormData(p => ({ ...p, stock: p.stock + 1 }))} className="px-2 text-muted-foreground hover:text-foreground"><ChevronDown size={12} className="rotate-180" /></button>
                                                               <button type="button" onClick={() => setFormData(p => ({ ...p, stock: Math.max(0, p.stock - 1) }))} className="px-2 text-muted-foreground hover:text-foreground"><ChevronDown size={12} /></button>
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Precio Venta</label>
                                                 <div className="relative bg-muted border border-border rounded-xl flex items-center px-4 py-3">
                                                        <span className="text-muted-foreground font-normal mr-2">$</span>
                                                        <input
                                                               type="number"
                                                               className="w-full bg-transparent text-right text-xl font-bold text-foreground focus:outline-none placeholder-foreground/20"
                                                               placeholder="0.00"
                                                               value={formData.price || ''}
                                                               onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                        />
                                                 </div>
                                          </div>
                                   </div>
                            </form>

                            {/* Floating Action Bar */}
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent z-20">
                                   <div className="flex gap-3">
                                          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border border-border text-foreground font-bold bg-muted active:scale-95 transition-transform">
                                                 Cancelar
                                          </button>
                                          <button
                                                 onClick={handleSubmit}
                                                 disabled={isLoading}
                                                 className="flex-[2] py-4 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                     <div className="bg-card w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border flex flex-col md:flex-row h-[600px]">

                            {/* Left Panel - Image Upload */}
                            <div className="w-full md:w-[400px] bg-muted/30 p-8 flex flex-col items-center justify-center border-r border-border relative group">
                                   <div className="absolute top-8 left-8">
                                          <h3 className="text-foreground font-black text-xs uppercase tracking-widest opacity-40">Imagen del Producto</h3>
                                   </div>

                                   <div className="w-full aspect-square max-w-[300px] rounded-[2rem] border-2 border-dashed border-border bg-background/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group-hover:scale-105">
                                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                 <Camera size={32} />
                                          </div>
                                          <div className="text-center">
                                                 <p className="text-emerald-500 font-bold mb-1">Subir Imagen</p>
                                                 <p className="text-xs text-muted-foreground">Arrastra o haz clic para seleccionar</p>
                                          </div>
                                   </div>

                                   <p className="absolute bottom-8 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Formatos: JPG, PNG, WEBP. Max 5MB.</p>
                            </div>

                            {/* Right Panel - Form */}
                            <div className="flex-1 p-8 md:p-12 relative flex flex-col bg-card">
                                   <div className="flex justify-between items-start mb-10">
                                          <div>
                                                 <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Nuevo Producto</h2>
                                                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Ingresa los detalles del inventario para el quiosco.</p>
                                          </div>
                                          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:rotate-90 transition-all">
                                                 <X size={24} />
                                          </button>
                                   </div>

                                   <form onSubmit={handleSubmit} className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                          <div className="space-y-3">
                                                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nombre del Producto</label>
                                                 <input
                                                        className="input-theme w-full"
                                                        placeholder="Ej. Bebida Energética XL"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        autoFocus
                                                 />
                                          </div>

                                          <div className="space-y-3">
                                                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                                                 <div className="relative">
                                                        <select
                                                               className="input-theme w-full appearance-none pr-10"
                                                               value={formData.category}
                                                               onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        >
                                                               <option value="Bebidas">Bebidas</option>
                                                               <option value="Snacks">Snacks</option>
                                                               <option value="Accesorios">Accesorios</option>
                                                               <option value="Pelotas">Pelotas</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
                                                 </div>
                                          </div>

                                          <div className="grid grid-cols-4 gap-6">
                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Costo</label>
                                                        <div className="relative bg-muted border border-border rounded-2xl flex items-center px-4 py-3 group focus-within:border-primary">
                                                               <span className="text-muted-foreground font-bold mr-1">$</span>
                                                               <input
                                                                      type="number"
                                                                      className="w-full bg-transparent text-foreground font-bold focus:outline-none"
                                                                      placeholder="0.00"
                                                                      value={formData.cost || ''}
                                                                      onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Venta</label>
                                                        <div className="relative bg-muted border border-border rounded-2xl flex items-center px-4 py-3 group focus-within:border-emerald-500">
                                                               <span className="text-muted-foreground font-bold mr-1">$</span>
                                                               <input
                                                                      type="number"
                                                                      className="w-full bg-transparent text-emerald-500 font-black focus:outline-none"
                                                                      placeholder="0.00"
                                                                      value={formData.price || ''}
                                                                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Stock</label>
                                                        <input
                                                               type="number"
                                                               className="input-theme w-full"
                                                               placeholder="0"
                                                               value={formData.stock || ''}
                                                               onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                        />
                                                 </div>

                                                 <div className="space-y-3 col-span-1">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Reorden</label>
                                                        <input
                                                               type="number"
                                                               className="input-theme w-full"
                                                               placeholder="5"
                                                               value={formData.minStock || 5}
                                                               onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                                        />
                                                 </div>
                                          </div>
                                   </form>

                                   <div className="mt-8 pt-8 border-t border-border flex justify-end">
                                          <button
                                                 onClick={handleSubmit}
                                                 disabled={isLoading}
                                                 className="btn-primary px-10 h-14"
                                          >
                                                 {isLoading ? 'GUARDANDO...' : 'GUARDAR PRODUCTO'}
                                                 <div className="bg-black/20 p-1 rounded-full">
                                                        <Check size={16} strokeWidth={4} />
                                                 </div>
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
