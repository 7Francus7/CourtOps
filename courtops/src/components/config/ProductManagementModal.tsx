'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, ScanBarcode, ChevronDown, Check, Plus, Minus, Search, ArrowLeft, Camera, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
       const {
              formData,
              setFormData,
              updateField,
              suggestedImages,
              isSearchingImage,
              searchImages,
              handleSubmit
       } = useProductForm({ initialData, onSave, isOpen })

       // UI States for Mobile Design Features
       const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null)
       const [selectedFlavor, setSelectedFlavor] = useState<string>('Original')
       const [selectedFormat, setSelectedFormat] = useState<string>('Botella 500ml')

       // Responsive Check
       useEffect(() => {
              const checkMobile = () => setIsMobile(window.innerWidth < 768)
              checkMobile()
              window.addEventListener('resize', checkMobile)
              return () => window.removeEventListener('resize', checkMobile)
       }, [])

       if (!isOpen) return null

       return isMobile ? (
              <MobileView
                     {...{
                            formData,
                            updateField,
                            setFormData,
                            selectedSupplier,
                            setSelectedSupplier,
                            selectedFlavor,
                            setSelectedFlavor,
                            selectedFormat,
                            setSelectedFormat,
                            onClose,
                            handleSubmit,
                            isLoading
                     }}
              />
       ) : (
              <DesktopView
                     {...{
                            formData,
                            updateField,
                            setFormData,
                            suggestedImages,
                            isSearchingImage,
                            searchImages,
                            onClose,
                            handleSubmit,
                            isLoading
                     }}
              />
       )
}

// --- SUB-COMPONENTS ---

type ViewProps = {
       formData: Product
       updateField: (field: keyof Product, value: any) => void
       setFormData: React.Dispatch<React.SetStateAction<Product>>
       onClose: () => void
       handleSubmit: (e?: React.FormEvent) => void
       isLoading?: boolean
       selectedSupplier?: number | null
       setSelectedSupplier?: (id: number | null) => void
       selectedFlavor?: string
       setSelectedFlavor?: (flavor: string) => void
       selectedFormat?: string
       setSelectedFormat?: (format: string) => void
       suggestedImages?: string[]
       isSearchingImage?: boolean
       searchImages?: () => Promise<void>
}

function MobileView({
       formData,
       updateField,
       selectedSupplier,
       setSelectedSupplier,
       selectedFlavor,
       setSelectedFlavor,
       selectedFormat,
       setSelectedFormat,
       onClose,
       handleSubmit,
       isLoading
}: ViewProps) {
       return (
              <div className="fixed inset-0 z-[1000] bg-background text-foreground overflow-y-auto animate-in slide-in-from-bottom duration-300">
                     <div className="sticky top-0 bg-background/90 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-border">
                            <button onClick={onClose} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                                   <ArrowLeft size={24} />
                            </button>
                            <h2 className="text-lg font-bold">Nuevo Producto</h2>
                            <div className="w-8" />
                     </div>

                     <form onSubmit={handleSubmit} className="p-4 space-y-8 pb-32">
                            {/* Scanning and Identification */}
                            <section className="space-y-2">
                                   <p className="section-label">Identificación</p>
                                   <div className="relative border border-emerald-500 border-dashed bg-emerald-500/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-colors">
                                          <div className="flex items-center gap-3 text-emerald-500">
                                                 <ScanBarcode size={24} />
                                                 <span className="text-sm font-medium">Escanear o ingresar código...</span>
                                          </div>
                                          <div className="bg-emerald-500 text-black p-2 rounded-xl">
                                                 <Camera size={20} />
                                          </div>
                                   </div>
                            </section>

                            {/* Supplier Selection */}
                            <section className="space-y-4">
                                   <div className="flex justify-between items-end">
                                          <p className="text-sm font-bold text-foreground">Proveedor Frecuente</p>
                                          <button type="button" className="text-xs text-emerald-500 font-bold">Ver todos</button>
                                   </div>
                                   <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                          {SUPPLIERS.map(sup => (
                                                 <button
                                                        key={sup.id}
                                                        type="button"
                                                        onClick={() => setSelectedSupplier?.(sup.id)}
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
                            </section>

                            <section className="space-y-6">
                                   <h3 className="text-sm font-bold text-foreground">Detalles y Variantes</h3>
                                   <div className="space-y-2">
                                          <label className="section-label">Nombre del Producto</label>
                                          <input
                                                 className="input-theme w-full"
                                                 value={formData.name}
                                                 onChange={e => updateField('name', e.target.value)}
                                                 placeholder="Ej: Coca Cola Zero"
                                          />
                                   </div>

                                   {/* Variants buttons */}
                                   <VariantList
                                          title="Sabor"
                                          items={FLAVORS}
                                          selected={selectedFlavor}
                                          onSelect={setSelectedFlavor}
                                   />
                                   <VariantList
                                          title="Formato"
                                          items={FORMATS}
                                          selected={selectedFormat}
                                          onSelect={setSelectedFormat}
                                   />
                            </section>

                            {/* Stock and Price */}
                            <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                          <label className="section-label">Stock Inicial</label>
                                          <div className="relative flex items-center bg-muted border border-border rounded-xl p-1">
                                                 <input
                                                        type="number"
                                                        className="w-full bg-transparent p-2 text-center text-xl font-bold focus:outline-none"
                                                        value={formData.stock}
                                                        onChange={e => updateField('stock', Number(e.target.value))}
                                                 />
                                                 <div className="flex flex-col border-l border-border">
                                                        <button type="button" onClick={() => updateField('stock', formData.stock + 1)} className="px-2 text-muted-foreground"><ChevronDown size={12} className="rotate-180" /></button>
                                                        <button type="button" onClick={() => updateField('stock', Math.max(0, formData.stock - 1))} className="px-2 text-muted-foreground"><ChevronDown size={12} /></button>
                                                 </div>
                                          </div>
                                   </div>
                                   <div className="space-y-2">
                                          <label className="section-label">Precio Venta</label>
                                          <div className="relative bg-muted border border-border rounded-xl flex items-center px-4 py-3">
                                                 <span className="text-muted-foreground mr-2 font-normal text-lg">$</span>
                                                 <input
                                                        type="number"
                                                        className="w-full bg-transparent text-right text-xl font-bold focus:outline-none placeholder-foreground/20"
                                                        placeholder="0.00"
                                                        value={formData.price || ''}
                                                        onChange={e => updateField('price', Number(e.target.value))}
                                                 />
                                          </div>
                                   </div>
                            </div>
                     </form>

                     {/* Action Buttons */}
                     <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent z-20">
                            <div className="flex gap-3">
                                   <button onClick={onClose} className="flex-1 py-4 rounded-xl border border-border text-foreground font-bold bg-muted active:scale-95 transition-transform">
                                          Cancelar
                                   </button>
                                   <button
                                          onClick={() => handleSubmit()}
                                          disabled={isLoading}
                                          className="flex-[2] py-4 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                   >
                                          {isLoading ? 'Guardando...' : (
                                                 <><Plus size={20} strokeWidth={3} /> Guardar Producto</>
                                          )}
                                   </button>
                            </div>
                     </div>
              </div>
       )
}

function DesktopView({
       formData,
       updateField,
       suggestedImages,
       isSearchingImage,
       searchImages,
       onClose,
       handleSubmit,
       isLoading
}: ViewProps) {
       return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                     <div className="bg-card w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border flex flex-col md:flex-row h-[600px]">
                            {/* Image Section */}
                            <div className="w-full md:w-[400px] bg-muted/30 p-8 flex flex-col items-center justify-center border-r border-border relative group">
                                   <div className="absolute top-8 left-8">
                                          <h3 className="section-label opacity-40">Imagen del Producto</h3>
                                   </div>

                                   <ImageUploadPreview
                                          imageUrl={formData.imageUrl}
                                          suggestedImages={suggestedImages}
                                          onSetImage={(img: string | null) => updateField('imageUrl', img)}
                                   />

                                   <button
                                          onClick={searchImages}
                                          disabled={isSearchingImage}
                                          className="mt-6 flex items-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold py-3 px-6 rounded-2xl transition-all"
                                   >
                                          {isSearchingImage ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                          {isSearchingImage ? 'Buscando...' : 'Buscar Foto Mágica'}
                                   </button>
                            </div>

                            {/* Form Section */}
                            <div className="flex-1 p-8 md:p-12 relative flex flex-col bg-card">
                                   <Header title="Nuevo Producto" description="Ingresa los detalles del inventario para el quiosco." onClose={onClose} />

                                   <form onSubmit={handleSubmit} className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar mt-10">
                                          <Field label="Nombre del Producto" placeholder="Ej. Bebida Energética XL" value={formData.name} onChange={(v: string) => updateField('name', v)} autoFocus />

                                          <div className="space-y-3">
                                                 <label className="section-label ml-1">Categoría</label>
                                                 <div className="relative">
                                                        <select
                                                               className="input-theme w-full appearance-none pr-10"
                                                               value={formData.category}
                                                               onChange={e => updateField('category', e.target.value)}
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
                                                 <PriceInput label="Costo" value={formData.cost} onChange={(v: number) => updateField('cost', v)} />
                                                 <PriceInput label="Venta" value={formData.price} onChange={(v: number) => updateField('price', v)} isHighlighted />
                                                 <Field type="number" label="Stock" value={formData.stock} onChange={(v: string) => updateField('stock', Number(v))} />
                                                 <Field type="number" label="Reorden" value={formData.minStock} onChange={(v: string) => updateField('minStock', Number(v))} />
                                          </div>
                                   </form>

                                   <div className="mt-8 pt-8 border-t border-border flex justify-end">
                                          <button
                                                 onClick={() => handleSubmit()}
                                                 disabled={isLoading}
                                                 className="bg-emerald-500 hover:bg-emerald-400 text-black font-black tracking-widest px-8 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50"
                                          >
                                                 {isLoading ? 'GUARDANDO...' : 'GUARDAR PRODUCTO'}
                                                 <div className="bg-black/20 p-1.5 rounded-full flex items-center justify-center">
                                                        <Check size={18} strokeWidth={4} />
                                                 </div>
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}

// --- UTILS ---

type VariantListProps = {
       title: string
       items: string[]
       selected?: string
       onSelect?: (item: string) => void
}

function VariantList({ title, items, selected, onSelect }: VariantListProps) {
       return (
              <div className="space-y-2">
                     <label className="section-label">{title}</label>
                     <div className="flex flex-wrap gap-2">
                            {items.map((item: string) => (
                                   <button
                                          key={item}
                                          type="button"
                                          onClick={() => onSelect?.(item)}
                                          className={cn(
                                                 "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                                                 selected === item
                                                        ? "bg-emerald-500 text-black border-emerald-500"
                                                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
                                          )}
                                   >
                                          {item}
                                   </button>
                            ))}
                            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground">
                                   <Plus size={16} />
                            </button>
                     </div>
              </div>
       )
}

type ImageUploadPreviewProps = {
       imageUrl?: string | null
       suggestedImages?: string[]
       onSetImage: (img: string | null) => void
}

function ImageUploadPreview({ imageUrl, suggestedImages, onSetImage }: ImageUploadPreviewProps) {
       if (imageUrl) {
              return (
                     <div className="w-full aspect-square max-w-[300px] rounded-[2rem] border-2 border-emerald-500 overflow-hidden relative group">
                            <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                   <button onClick={() => onSetImage(null)} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">Quitar foto</button>
                            </div>
                     </div>
              )
       }

       return (
              <div className="w-full aspect-square max-w-[300px] rounded-[2rem] border-2 border-dashed border-border bg-background/50 flex flex-col items-center justify-center gap-4">
                     {(suggestedImages?.length ?? 0) > 0 ? (
                            <div className="grid grid-cols-2 gap-2 p-4 h-full w-full overflow-y-auto custom-scrollbar">
                                   {suggestedImages?.map((img: string, i: number) => (
                                          <img key={i} src={img} alt="suggested" onClick={() => onSetImage(img)} className="w-full h-24 object-cover rounded-xl border-2 border-transparent hover:border-emerald-500 cursor-pointer" />
                                   ))}
                            </div>
                     ) : (
                            <>
                                   <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Camera size={32} /></div>
                                   <div className="text-center"><p className="text-emerald-500 font-bold mb-1">Sin Imagen</p></div>
                            </>
                     )}
              </div>
       )
}

type HeaderProps = {
       title: string
       description: string
       onClose: () => void
}

function Header({ title, description, onClose }: HeaderProps) {
       return (
              <div className="flex justify-between items-start">
                     <div>
                            <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">{title}</h2>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{description}</p>
                     </div>
                     <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:rotate-90 transition-all">
                            <X size={24} />
                     </button>
              </div>
       )
}

type FieldProps = {
       label: string
       value: any
       onChange: (v: any) => void
       [key: string]: any
}

function Field({ label, value, onChange, ...props }: FieldProps) {
       return (
              <div className="space-y-3">
                     <label className="section-label ml-1">{label}</label>
                     <input className="input-theme w-full" value={value || ''} onChange={e => onChange(e.target.value)} {...props} />
              </div>
       )
}

type PriceInputProps = {
       label: string
       value: number
       onChange: (v: number) => void
       isHighlighted?: boolean
}

function PriceInput({ label, value, onChange, isHighlighted }: PriceInputProps) {
       return (
              <div className="space-y-3 col-span-1">
                     <label className="section-label ml-1">{label}</label>
                     <div className={cn(
                            "relative bg-muted border border-border rounded-2xl flex items-center px-4 py-3 group",
                            isHighlighted ? "focus-within:border-emerald-500" : "focus-within:border-primary"
                     )}>
                            <span className="text-muted-foreground font-bold mr-1">$</span>
                            <input
                                   type="number"
                                   className={cn("w-full bg-transparent focus:outline-none font-bold", isHighlighted ? "text-emerald-500 font-black" : "text-foreground")}
                                   placeholder="0.00"
                                   value={value || ''}
                                   onChange={e => onChange(Number(e.target.value))}
                            />
                     </div>
              </div>
       )
}
