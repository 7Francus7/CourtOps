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
       Sparkles
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
              <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-background text-foreground font-sans h-screen w-screen overflow-hidden antialiased selection:bg-primary selection:text-white">
                     {/* Mobile Header */}
                     <header className="md:hidden h-16 bg-card flex items-center justify-between px-4 border-b border-border shrink-0">
                            <div className="flex items-center gap-2">
                                   <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                          <Store className="w-5 h-5" />
                                   </div>
                                   <h1 className="font-bold text-lg tracking-tight text-foreground">MARKET<span className="font-normal text-muted-foreground">POS</span></h1>
                            </div>
                            <button onClick={onClose} className="p-2 relative rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground">
                                   <X className="w-5 h-5" />
                            </button>
                     </header>

                     {/* --- MAIN CONTENT (LEFT PANEL) --- */}
                     <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0 bg-background">
                            {/* Header & Search Bar */}
                            <div className="p-6 pb-2 space-y-4 md:space-y-0 md:flex md:gap-6 shrink-0 items-center">
                                   <div className="hidden md:flex items-center gap-4 mr-4 min-w-max">
                                          <motion.div
                                                 initial={{ scale: 0.8, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-foreground"
                                          >
                                                 <Store className="w-6 h-6" />
                                          </motion.div>
                                          <div>
                                                 <div className="flex items-center gap-2">
                                                        <h1 className="font-black text-2xl tracking-tighter text-foreground leading-none">MARKET POS</h1>
                                                        <button
                                                               onClick={() => setIsCreateProductOpen(true)}
                                                               className="ml-2 bg-muted p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border"
                                                               title="Crear Nuevo Producto"
                                                        >
                                                               <Plus size={14} />
                                                        </button>
                                                 </div>
                                                 <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cliente Actual:</span>
                                                        <span className="text-xs font-bold text-primary bg-blue-500/10 px-2 py-0.5 rounded border border-primary/20">
                                                               {selectedClient ? selectedClient.name : 'CONSUMIDOR FINAL'}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                                          {/* Product Search */}
                                          <div className="relative flex-grow group">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 focus:border-transparent placeholder-zinc-600 text-foreground transition-all outline-none shadow-sm"
                                                        placeholder="Buscar productos..."
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                 />
                                          </div>

                                          {/* Client Search */}
                                          <div className="relative md:w-80 group">
                                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 focus:border-transparent placeholder-zinc-600 text-foreground transition-all outline-none shadow-sm"
                                                        placeholder="Asignar Cliente"
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={e => setClientSearch(e.target.value)}
                                                 />
                                                 {isClientDropdownOpen && clients.length > 0 && (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               className="absolute top-full left-0 right-0 mt-2 bg-muted rounded-xl shadow-2xl z-50 overflow-hidden border border-border"
                                                        >
                                                               {clients.slice(0, 5).map(c => (
                                                                      <button
                                                                             key={c.id}
                                                                             onClick={() => {
                                                                                    setSelectedClient(c)
                                                                                    setClientSearch('')
                                                                                    setIsClientDropdownOpen(false)
                                                                             }}
                                                                             className="w-full px-4 py-3 text-left hover:bg-muted border-b border-border last:border-0 flex justify-between items-center group"
                                                                      >
                                                                             <div>
                                                                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                                                                                    <p className="text-[10px] text-muted-foreground">{c.phone}</p>
                                                                             </div>
                                                                             <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                                                      </button>
                                                               ))}
                                                        </motion.div>
                                                 )}
                                                 {selectedClient && (
                                                        <button
                                                               onClick={() => setSelectedClient(null)}
                                                               className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                        >
                                                               <X className="w-4 h-4" />
                                                        </button>
                                                 )}
                                          </div>
                                   </div>
                            </div>

                            {/* Filters / Categories */}
                            <div className="px-6 py-2 shrink-0 overflow-x-auto no-scrollbar">
                                   <div className="flex gap-2 pb-2">
                                          {categories.map(cat => (
                                                 <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                               "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border uppercase tracking-wide",
                                                               selectedCategory === cat
                                                                      ? "bg-primary border-primary text-foreground shadow-lg shadow-blue-500/25"
                                                                      : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-zinc-600 hover:bg-card"
                                                        )}
                                                 >
                                                        {cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* Products Grid Component */}
                            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
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
                                   pendingToPay={total} // Start with full amount pending
                                   selectedClient={selectedClient}
                                   onClose={() => setShowCheckout(false)}
                                   onFinalize={handleFinalize}
                                   processing={processing}
                                   allowCredit={allowCredit}
                            />
                     )}

                     {/* --- SUCCESS OVERLAY --- */}
                     {showSuccess && (
                            <div className="fixed inset-0 z-[150] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-8">
                                   <motion.div
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", duration: 0.5 }}
                                          className="bg-[D4FF00] rounded-full p-8 mb-8 shadow-[0_0_60px_rgba(212,255,0,0.4)]"
                                   >
                                          <Sparkles className="w-20 h-20 text-black fill-black/10" />
                                   </motion.div>

                                   <motion.h2
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.2 }}
                                          className="text-5xl font-black text-foreground uppercase tracking-tighter mb-4 text-center"
                                   >
                                          �Venta Exitosa!
                                   </motion.h2>

                                   <motion.p
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.3 }}
                                          className="text-muted-foreground mb-12 text-lg font-medium text-center max-w-md"
                                   >
                                          La transacci�n ha sido registrada correctamente en el sistema.
                                   </motion.p>

                                   <motion.div
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.4 }}
                                          className="flex flex-col w-full max-w-sm gap-4"
                                   >
                                          <button
                                                 onClick={resetSale}
                                                 className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors"
                                          >
                                                 Nueva Venta
                                          </button>
                                   </motion.div>
                            </div>
                     )}

                     {/* Simpler Create Product Modal Inline for now if needed or omit if not core path asked */}
                     {isCreateProductOpen && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                   <div className="bg-muted border border-border p-6 rounded-2xl w-full max-w-md space-y-4">
                                          <h2 className="text-xl font-bold text-foreground">Nuevo Producto</h2>
                                          <input
                                                 placeholder="Nombre"
                                                 className="w-full bg-background border border-border p-3 rounded-xl text-foreground outline-none"
                                                 value={newProduct.name}
                                                 onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                          />
                                          <div className="grid grid-cols-2 gap-4">
                                                 <input
                                                        placeholder="Precio"
                                                        type="number"
                                                        className="w-full bg-background border border-border p-3 rounded-xl text-foreground outline-none"
                                                        value={newProduct.price}
                                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                 />
                                                 <input
                                                        placeholder="Stock"
                                                        type="number"
                                                        className="w-full bg-background border border-border p-3 rounded-xl text-foreground outline-none"
                                                        value={newProduct.stock}
                                                        onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                 />
                                          </div>


                                          <select
                                                 className="w-full bg-background border border-border p-3 rounded-xl text-foreground outline-none"
                                                 value={newProduct.category}
                                                 onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                          >
                                                 <option value="Bebidas">Bebidas</option>
                                                 <option value="Snacks">Snacks</option>
                                                 <option value="Accesorios">Accesorios</option>
                                                 <option value="Alquiler">Alquiler</option>
                                          </select>

                                          <div className="flex gap-2 pt-2">
                                                 <button onClick={() => setIsCreateProductOpen(false)} className="flex-1 bg-card text-foreground p-3 rounded-xl font-bold">Cancelar</button>
                                                 <button onClick={handleCreateProduct} className="flex-1 bg-primary text-foreground p-3 rounded-xl font-bold">Guardar</button>
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       )
}

