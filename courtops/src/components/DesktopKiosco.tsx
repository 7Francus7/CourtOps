'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getProducts, processSale, SaleItem, Payment } from '@/actions/kiosco'
import { getClients } from '@/actions/clients'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
       Store,
       Search,
       Plus,
       User,
       X,
       Sparkles,
       PackagePlus
} from 'lucide-react'
import { getClubSettings } from '@/actions/dashboard'
import { upsertProduct } from '@/actions/settings'
import { Product, CartItem, Client } from './kiosco/types'
import { ProductGrid } from './kiosco/ProductGrid'
import { CartSidebar } from './kiosco/CartSidebar'
import { CheckoutOverlay } from './kiosco/CheckoutOverlay'

type Props = {
       isOpen: boolean
       onClose: () => void
}

export default function DesktopKiosco({ isOpen, onClose }: Props) {
       // --- State ---
       const [products, setProducts] = useState<Product[]>([])
       const [cart, setCart] = useState<CartItem[]>([])
       const [loading, setLoading] = useState(true)
       const [processing, setProcessing] = useState(false)
       const [searchTerm, setSearchTerm] = useState('')
       const [selectedCategory, setSelectedCategory] = useState('Todos')
       const [showCheckout, setShowCheckout] = useState(false)
       const [showSuccess, setShowSuccess] = useState(false)
       const [allowCredit, setAllowCredit] = useState(true)

       // Create Product State
       const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
       // Note: Assuming newProduct state handling would be in a separate modal or here if simple. 
       // Keeping it simple here or if needed later we can extract CreateProductModal.
       // For now, I'll keep the logic but maybe simplify or just link it.
       // The original code had state for newProduct. Let's keep it to avoid regression.
       const [newProduct, setNewProduct] = useState({
              name: '',
              category: 'Bebidas',
              price: '',
              cost: '',
              stock: ''
       })

       // Client Selection
       const [clients, setClients] = useState<Client[]>([])
       const [clientSearch, setClientSearch] = useState('')
       const [selectedClient, setSelectedClient] = useState<Client | null>(null)
       const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)

       const loadProducts = useCallback(async () => {
              setLoading(true)
              try {
                     const [productsData, settingsData] = await Promise.all([
                            getProducts(),
                            getClubSettings()
                     ])
                     setProducts(productsData as any)
                     if (settingsData) {
                            setAllowCredit(settingsData.allowCredit ?? true)
                     }
              } catch (error) {
                     toast.error("Error al cargar productos")
              } finally {
                     setLoading(false)
              }
       }, [])

       const resetSale = useCallback(() => {
              setCart([])
              setShowCheckout(false)
              setShowSuccess(false)
              setSelectedCategory('Todos')
              setSearchTerm('')
              setSelectedClient(null)
              setClientSearch('')
       }, [])

       // --- Effects ---
       useEffect(() => {
              if (isOpen) {
                     loadProducts()
                     resetSale()
              }
       }, [isOpen, loadProducts, resetSale])

       useEffect(() => {
              const timer = setTimeout(() => {
                     if (clientSearch.length >= 2) {
                            getClients(clientSearch).then(data => {
                                   setClients(data as any)
                                   setIsClientDropdownOpen(true)
                            })
                     } else {
                            setIsClientDropdownOpen(false)
                     }
              }, 300)
              return () => clearTimeout(timer)
       }, [clientSearch])

       // Recalculate cart prices if client changes (membership discount)
       useEffect(() => {
              setCart(prev => prev.map(item => ({
                     ...item,
                     appliedPrice: (selectedClient?.membershipStatus === 'ACTIVE' && item.memberPrice) ? item.memberPrice : item.price
              })))
       }, [selectedClient])



       // --- Logic ---
       const addToCart = (product: Product) => {
              const appliedPrice = (selectedClient?.membershipStatus === 'ACTIVE' && product.memberPrice) ? product.memberPrice : product.price

              setCart(prev => {
                     const existing = prev.find(p => p.id === product.id)
                     if (existing) {
                            if (existing.quantity + 1 > product.stock) {
                                   toast.warning("Stock insuficiente")
                                   return prev
                            }
                            return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1, appliedPrice } : p)
                     }
                     return [...prev, { ...product, quantity: 1, appliedPrice }]
              })

              toast.success(`${product.name} +1`, {
                     duration: 800,
                     position: 'bottom-center'
              })
       }

       const updateQuantity = (id: number, delta: number) => {
              setCart(prev => {
                     return prev.map(p => {
                            if (p.id === id) {
                                   const newQty = p.quantity + delta
                                   if (newQty <= 0) return p
                                   if (newQty > p.stock) {
                                          toast.warning("Stock m+�ximo alcanzado")
                                          return p
                                   }
                                   return { ...p, quantity: newQty }
                            }
                            return p
                     })
              })
       }

       const clearCart = () => {
              if (cart.length === 0) return
              if (confirm("-+Seguro que deseas vaciar el carrito?")) {
                     setCart([])
              }
       }

       const categories = useMemo(() => {
              const cats = new Set(products.map(p => p.category))
              return ['Todos', ...Array.from(cats)]
       }, [products])

       const filteredProducts = useMemo(() => {
              return products.filter(p => {
                     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
                     const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory
                     return matchesSearch && matchesCat
              })
       }, [products, searchTerm, selectedCategory])

       const total = cart.reduce((sum, item) => sum + (item.appliedPrice * item.quantity), 0)

       const handleFinalize = async (payments: Payment[], method: string) => {
              if (total === 0) return toast.error("Carrito vac+�o")
              // Note: payments are now passed from checkout overlay

              setProcessing(true)
              try {
                     const saleItems: SaleItem[] = cart.map(i => ({
                            productId: i.id,
                            quantity: i.quantity,
                            price: i.appliedPrice
                     }))

                     await processSale(saleItems, payments, selectedClient?.id || undefined)
                     setShowSuccess(true)
                     setShowCheckout(false)
                     toast.success("Venta realizada con +�xito")
                     loadProducts()
              } catch (error: any) {
                     toast.error("Error: " + error.message)
              } finally {
                     setProcessing(false)
              }
       }

       // New Product is kept here for now as it wasn't the main bloat source
       const handleCreateProduct = async () => {
              // ... existing logic if we keep the modal or just remove it for now to save space?
              // The prompt didn't ask to remove features, just refactor.
              // I'll keep the state but maybe hide the modal code if it's too much, 
              // BUT actually let's just keep the button and logic if possible.
              // For brevity in this response, I'll omit the Create Modal implementation details 
              // and focus on the main Kiosco structure, assuming 'Plus' button opens a modal 
              // that we might extract later or is just a small part.
              // Wait, I should include it to not break functionality. 
              // I will assume it's okay to leave the simple logic for create product here or extract it too?
              // Let's leave the create product logic effectively but maybe not the UI if I want to be concise.
              // Actually, I should probably put the Create logic in a component too if I want to be thorough.
              // Whatever, let's just implement the UI for Create Product inline since it's small enough compared to the rest.
              if (!newProduct.name || !newProduct.price || !newProduct.category) {
                     return toast.error("Completa campos obligatorios")
              }
              setProcessing(true)
              try {
                     await upsertProduct({
                            name: newProduct.name,
                            category: newProduct.category,
                            price: parseFloat(newProduct.price),
                            cost: parseFloat(newProduct.cost) || 0,
                            stock: parseInt(newProduct.stock) || 0
                     })
                     toast.success("Producto creado!")
                     setIsCreateProductOpen(false)
                     setNewProduct({ name: '', category: 'Bebidas', price: '', cost: '', stock: '' })
                     loadProducts()
              } catch (error: any) {
                     toast.error(error.message)
              } finally {
                     setProcessing(false)
              }
       }


       if (!isOpen) return null

       return (
              <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-zinc-100 font-sans h-screen w-screen overflow-hidden antialiased selection:bg-emerald-500/30 selection:text-white">

                     {/* Mobile Header */}
                     <header className="md:hidden h-16 bg-white dark:bg-white/5 backdrop-blur-xl flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                   <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                                          <Store className="w-5 h-5" />
                                   </div>
                                   <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">COURT<span className="font-light text-slate-500 dark:text-zinc-400">POS</span></h1>
                            </div>
                            <button onClick={onClose} className="p-2 relative rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                                   <X className="w-5 h-5" />
                            </button>
                     </header>

                     {/* --- MAIN CONTENT (LEFT PANEL) --- */}
                     <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

                            {/* Header & Search Bar */}
                            <div className="p-6 pb-2 space-y-4 md:space-y-0 md:flex md:gap-6 shrink-0 items-center relative z-10">
                                   <div className="hidden md:flex items-center gap-4 mr-4 min-w-max">
                                          <motion.div
                                                 initial={{ scale: 0.8, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 className="bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-white dark:text-black"
                                          >
                                                 <Store className="w-6 h-6" />
                                          </motion.div>
                                          <div>
                                                 <div className="flex items-center gap-3">
                                                        <h1 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">PUNTO DE VENTA</h1>
                                                        <button
                                                               onClick={() => setIsCreateProductOpen(true)}
                                                               className="bg-white dark:bg-white/5 p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 shadow-sm"
                                                               title="Crear Nuevo Producto"
                                                        >
                                                               <Plus size={16} />
                                                        </button>
                                                 </div>
                                                 <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider">Cliente Actual:</span>
                                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-inner">
                                                               {selectedClient ? selectedClient.name : 'CONSUMIDOR FINAL'}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                                          {/* Product Search */}
                                          <div className="relative flex-grow group">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 dark:placeholder-zinc-500/70 text-slate-900 dark:text-white transition-all outline-none shadow-sm backdrop-blur-md"
                                                        placeholder="Buscar productos..."
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                 />
                                          </div>

                                          {/* Client Search */}
                                          <div className="relative md:w-80 group">
                                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-1 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-400 dark:placeholder-zinc-500/70 text-slate-900 dark:text-white transition-all outline-none shadow-sm backdrop-blur-md"
                                                        placeholder="Asignar Cliente (DNI, Nombre...)"
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={e => setClientSearch(e.target.value)}
                                                 />
                                                 {isClientDropdownOpen && clients.length > 0 && (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-white/10"
                                                        >
                                                               {clients.slice(0, 5).map(c => (
                                                                      <button
                                                                             key={c.id}
                                                                             onClick={() => {
                                                                                    setSelectedClient(c)
                                                                                    setClientSearch('')
                                                                                    setIsClientDropdownOpen(false)
                                                                             }}
                                                                             className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 last:border-0 flex justify-between items-center group/client transition-colors"
                                                                      >
                                                                             <div>
                                                                                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 group-hover/client:text-teal-600 dark:group-hover/client:text-teal-400 transition-colors">{c.name}</p>
                                                                                    <p className="text-[10px] text-slate-500 dark:text-zinc-500">{c.phone}</p>
                                                                             </div>
                                                                             <Plus className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover/client:text-teal-600 dark:group-hover/client:text-teal-400 opacity-0 group-hover/client:opacity-100 transition-all" />
                                                                      </button>
                                                               ))}
                                                        </motion.div>
                                                 )}
                                                 {selectedClient && (
                                                        <button
                                                               onClick={() => setSelectedClient(null)}
                                                               className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                                        >
                                                               <X className="w-4 h-4" />
                                                        </button>
                                                 )}
                                          </div>
                                   </div>
                            </div>

                            {/* Filters / Categories */}
                            <div className="px-6 py-2 shrink-0 overflow-x-auto no-scrollbar relative z-10">
                                   <div className="flex gap-2 pb-2">
                                          {categories.map(cat => (
                                                 <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                               "px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap uppercase tracking-wider border",
                                                               selectedCategory === cat
                                                                      ? "bg-emerald-500 text-white dark:text-black border-emerald-500 dark:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10"
                                                        )}
                                                 >
                                                        {cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* Products Grid Component */}
                            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar relative z-10">
                                   <ProductGrid
                                          products={filteredProducts}
                                          loading={loading}
                                          selectedClient={selectedClient}
                                          onAddToCart={addToCart}
                                          onReloadProducts={loadProducts}
                                   />
                            </div>
                     </main>

                     {/* --- SIDEBAR (RIGHT PANEL - CART) --- */}
                     <CartSidebar
                            cart={cart}
                            onClose={onClose}
                            onClearCart={clearCart}
                            onUpdateQuantity={updateQuantity}
                            onCheckout={(isFastPay) => {
                                   if (isFastPay) {
                                          handleFinalize([{ method: 'CASH', amount: total }], 'CASH')
                                   } else {
                                          setShowCheckout(true)
                                   }
                            }}
                     />

                     {/* --- CHECKOUT OVERLAY --- */}
                     {showCheckout && (
                            <CheckoutOverlay
                                   total={total}
                                   pendingToPay={total}
                                   selectedClient={selectedClient}
                                   onClose={() => setShowCheckout(false)}
                                   onFinalize={handleFinalize}
                                   processing={processing}
                                   allowCredit={allowCredit}
                            />
                     )}

                     {/* --- SUCCESS OVERLAY --- */}
                     {showSuccess && (
                            <div className="fixed inset-0 z-[150] bg-white/90 dark:bg-[#030712]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
                                   <motion.div
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", duration: 0.6 }}
                                          className="bg-emerald-500 rounded-full p-8 mb-8 shadow-[0_0_80px_rgba(16,185,129,0.5)] border border-emerald-400"
                                   >
                                          <Sparkles className="w-24 h-24 text-white dark:text-black fill-white/20 dark:fill-black/20" />
                                   </motion.div>

                                   <motion.h2
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.2 }}
                                          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-300 dark:to-teal-600 uppercase tracking-tighter mb-4 text-center"
                                   >
                                          ¡Venta Exitosa!
                                   </motion.h2>

                                   <motion.p
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.3 }}
                                          className="text-slate-600 dark:text-zinc-400 mb-12 text-lg font-medium text-center max-w-md"
                                   >
                                          La transacción ha sido registrada correctamente y el stock actualizado en el sistema.
                                   </motion.p>

                                   <motion.div
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.4 }}
                                          className="flex flex-col w-full max-w-sm gap-4"
                                   >
                                          <button
                                                 onClick={resetSale}
                                                 className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                          >
                                                 Nueva Venta
                                          </button>
                                   </motion.div>
                            </div>
                     )}

                     {/* Create Product Modal Inline */}
                     {isCreateProductOpen && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-[#030712]/80 backdrop-blur-md">
                                   <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 shadow-2xl p-6 rounded-3xl w-full max-w-md space-y-5">
                                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
                                                 <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><PackagePlus className="text-emerald-500 w-5 h-5" /> Nuevo Producto</h2>
                                                 <button onClick={() => setIsCreateProductOpen(false)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
                                          </div>

                                          <div className="space-y-4">
                                                 <div className="space-y-1.5">
                                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Nombre del Producto</label>
                                                        <input
                                                               placeholder="Ej: Gatorade Manzana"
                                                               className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700"
                                                               value={newProduct.name}
                                                               onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                        />
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                               <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Precio Público ($)</label>
                                                               <input
                                                                      placeholder="1500"
                                                                      type="number"
                                                                      className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                                                                      value={newProduct.price}
                                                                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                               />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                               <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Stock Inicial</label>
                                                               <input
                                                                      placeholder="24"
                                                                      type="number"
                                                                      className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                                                                      value={newProduct.stock}
                                                                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                               />
                                                        </div>
                                                 </div>

                                                 <div className="space-y-1.5">
                                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Categoría</label>
                                                        <select
                                                               className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-3 rounded-xl text-slate-900 dark:text-white outline-none transition-all"
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
                                                 <button onClick={() => setIsCreateProductOpen(false)} className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white p-3.5 rounded-xl font-bold transition-colors">Cancelar</button>
                                                 <button onClick={handleCreateProduct} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black p-3.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">Guardar Producto</button>
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       )
}

