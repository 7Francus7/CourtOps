'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ScanBarcode, Camera, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductForm } from '@/hooks/useProductForm'
import type { Product } from '@/types/product'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSave: (product: Product) => void
       initialData?: Product | null
       isLoading?: boolean
}

type HeaderProps = {
       title: string
       description: string
       onClose: () => void
}

export default function ProductManagementModal({ isOpen, onClose, onSave, initialData, isLoading }: Props) {
       const [isMobile, setIsMobile] = useState(false)
       const {
              formData,
              setFormData,
              updateField,
              suggestedImages,
              isSearchingImage,
              searchImages,
              handleSubmit
       } = useProductForm({ initialData, onSave, isOpen })

       useEffect(() => {
              const checkMobile = () => setIsMobile(window.innerWidth < 1024)
              checkMobile()
              window.addEventListener('resize', checkMobile)
              return () => window.removeEventListener('resize', checkMobile)
       }, [])

       return (
              <AnimatePresence>
                     {isOpen && (
                            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-0 md:p-10 overflow-hidden">
                                   {/* Backdrop with dynamic blur */}
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          onClick={onClose}
                                          className="absolute inset-0 bg-black/80 backdrop-blur-[40px] z-0"
                                   />

                                   {/* Animated Glows */}
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] pointer-events-none opacity-50 mix-blend-screen animate-pulse-soft" />

                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                          className="relative w-full max-w-6xl h-full md:h-[80vh] bg-[#09090b]/40 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row z-10"
                                   >
                                          {/* Close Button UI */}
                                          <button
                                                 onClick={onClose}
                                                 className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all z-[100] active:scale-90"
                                          >
                                                 <X size={24} />
                                          </button>

                                          {/* LEFT SIDE: THE HERO (SLANTED TYPOGRAPHY) */}
                                          <div className="w-full lg:w-2/5 p-10 lg:p-16 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/5">
                                                 <div className="relative z-10">
                                                        <motion.div
                                                               initial={{ x: -20, opacity: 0 }}
                                                               animate={{ x: 0, opacity: 1 }}
                                                               transition={{ delay: 0.2 }}
                                                               className="space-y-1"
                                                        >
                                                               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 block mb-4">Configuración Pro</span>
                                                               <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                                                                      {formData.name ? (
                                                                             <motion.span layoutId="title" className="block line-clamp-2">{formData.name}</motion.span>
                                                                      ) : (
                                                                             <span className="opacity-20">Nuevo <br /> Articulo</span>
                                                                      )}
                                                               </h2>
                                                        </motion.div>

                                                        <div className="mt-12 group">
                                                               <div className="relative w-full aspect-square bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center group-hover:border-primary/50 transition-all duration-700">
                                                                      {formData.imageUrl ? (
                                                                             <motion.img
                                                                                    initial={{ scale: 1.2, opacity: 0 }}
                                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                                    src={formData.imageUrl}
                                                                                    alt="product"
                                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                             />
                                                                      ) : (
                                                                             <div className="text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                                                                           <Camera size={40} className="text-white/50" />
                                                                                    </div>
                                                                                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 italic">Esperando visual...</p>
                                                                             </div>
                                                                      )}

                                                                      {/* Image Overlay Controls */}
                                                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all">
                                                                             <button onClick={searchImages} className="bg-white text-black font-black px-6 py-3 rounded-2xl tracking-tighter hover:scale-105 active:scale-95 transition-all">
                                                                                    BUSCAR IMAGEN AI
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="relative z-10 pt-10">
                                                        <div className="flex items-center gap-4">
                                                               <div className="h-px bg-white/10 flex-1" />
                                                               <div className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Studio Mode</div>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* RIGHT SIDE: THE CONTROLS (HIGH CONTRAST GLASS) */}
                                          <form onSubmit={handleSubmit} className="flex-1 p-10 lg:p-16 flex flex-col bg-black/20 overflow-y-auto custom-scrollbar">
                                                 <div className="space-y-12">
                                                        {/* SECTION: BASICS */}
                                                        <section className="space-y-8 animate-in slide-in-from-right duration-500 delay-100">
                                                               <div className="flex items-center gap-3">
                                                                      <div className="w-2 h-8 bg-primary rounded-full" />
                                                                      <h3 className="text-xl font-black italic uppercase tracking-widest text-white/90">Información Base</h3>
                                                               </div>

                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] ml-1">Alias del Producto</label>
                                                                      <input
                                                                             autoFocus
                                                                             className="w-full bg-white/5 border-b-2 border-white/10 px-0 py-4 text-3xl font-black italic uppercase tracking-tighter text-white placeholder:text-white/10 focus:outline-none focus:border-primary transition-all bg-transparent"
                                                                             placeholder="ESCRIBE EL NOMBRE..."
                                                                             value={formData.name}
                                                                             onChange={e => updateField('name', e.target.value)}
                                                                      />
                                                               </div>

                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                      <div className="space-y-3">
                                                                             <label className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] ml-1">Segmento / Categoría</label>
                                                                             <div className="flex gap-2 flex-wrap">
                                                                                    {['Bebidas', 'Snacks', 'Accesorios', 'Pelotas'].map(cat => (
                                                                                           <button
                                                                                                  key={cat}
                                                                                                  type="button"
                                                                                                  onClick={() => updateField('category', cat)}
                                                                                                  className={cn(
                                                                                                         "px-6 py-3 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all border",
                                                                                                         formData.category === cat
                                                                                                                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                                                                                                : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                                                                                                  )}
                                                                                           >
                                                                                                  {cat}
                                                                                           </button>
                                                                                    ))}
                                                                             </div>
                                                                      </div>
                                                                      <div className="space-y-3">
                                                                             <label className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] ml-1">Identificador Barcode</label>
                                                                             <div className="group relative">
                                                                                    <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                                                                                    <input
                                                                                           className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all border-dashed"
                                                                                           placeholder="ESCANEAR CÓDIGO..."
                                                                                           value={""}
                                                                                           onChange={() => { }}
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </section>

                                                        {/* SECTION: FINANCIALS & STOCK */}
                                                        <section className="space-y-8 animate-in slide-in-from-right duration-500 delay-200">
                                                               <div className="flex items-center gap-3">
                                                                      <div className="w-2 h-8 bg-accent rounded-full" />
                                                                      <h3 className="text-xl font-black italic uppercase tracking-widest text-white/90">Estrategia Comercial</h3>
                                                               </div>

                                                               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                                      <StatInput label="Costo" value={formData.cost} onChange={(v) => updateField('cost', v)} />
                                                                      <StatInput label="PVP Público" value={formData.price} onChange={(v) => updateField('price', v)} isMain />
                                                                      <StatInput label="Stock" value={formData.stock} onChange={(v) => updateField('stock', v)} isInt />
                                                                      <StatInput label="Alertas" value={formData.minStock || 0} onChange={(v) => updateField('minStock', v)} isInt />
                                                               </div>
                                                        </section>
                                                 </div>

                                                 {/* FOOTER ACTIONS */}
                                                 <div className="mt-auto pt-16 flex gap-4">
                                                        <button
                                                               type="button"
                                                               onClick={onClose}
                                                               className="px-10 py-5 rounded-3xl text-sm font-black uppercase italic tracking-widest text-white/30 hover:text-white transition-colors"
                                                        >
                                                               Cancelar
                                                        </button>
                                                        <button
                                                               type="button"
                                                               onClick={() => handleSubmit()}
                                                               disabled={isLoading}
                                                               className="flex-1 bg-white hover:bg-white/90 text-black px-10 py-5 rounded-[2rem] text-sm font-black uppercase italic tracking-[0.2em] shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                                        >
                                                               {isLoading ? (
                                                                      <Loader2 className="animate-spin" />
                                                               ) : (
                                                                      <>PROCESAR ALTA <Check size={20} strokeWidth={4} /></>
                                                               )}
                                                        </button>
                                                 </div>
                                          </form>
                                   </motion.div>
                            </div>
                     )}
              </AnimatePresence>
       )
}

function StatInput({ label, value, onChange, isMain, isInt }: { label: string, value: number, onChange: (v: number) => void, isMain?: boolean, isInt?: boolean }) {
       return (
              <div className="group space-y-3">
                     <label className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em] ml-1 group-focus-within:text-white/60 transition-colors uppercase">{label}</label>
                     <div className={cn(
                            "relative overflow-hidden rounded-3xl border transition-all duration-300",
                            isMain ? "bg-white/10 border-primary/40 p-1" : "bg-white/[0.03] border-white/5 p-1"
                     )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-center px-4 py-3">
                                   {!isInt && <span className="text-white/20 font-black mr-1 text-xs italic">$</span>}
                                   <input
                                          type="number"
                                          className={cn(
                                                 "w-full bg-transparent focus:outline-none text-xl font-black italic tracking-tighter truncate",
                                                 isMain ? "text-primary" : "text-white"
                                          )}
                                          value={value || ''}
                                          onChange={e => onChange(Number(e.target.value))}
                                          placeholder="0"
                                   />
                            </div>
                     </div>
              </div>
       )
}

function Header({ title, description, onClose }: HeaderProps) {
       return (
              <div className="flex justify-between items-start">
                     <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 italic tracking-[0.1em]">{title}</h2>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest italic">{description}</p>
                     </div>
                     <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all">
                            <X size={20} />
                     </button>
              </div>
       )
}
