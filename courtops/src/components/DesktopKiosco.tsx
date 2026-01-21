'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { getProducts, processSale, SaleItem, Payment, restockProduct } from '@/actions/kiosco'
import { getClients } from '@/actions/clients'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
       Store,
       Search,
       PlusCircle,
       PackagePlus,
       User,
       X,
       Plus,
       SearchX,
       CupSoda,
       Cookie,
       Package,
       Trash2,
       ScanBarcode,
       Banknote,
       Landmark,
       CreditCard,
       NotebookPen,
       Smartphone,
       Check,
       Sparkles,
       Save,
       Loader2,
       ArrowRight
} from 'lucide-react'
import { upsertProduct } from '@/actions/settings'

type Product = {
       id: number
       name: string
       price: number
       memberPrice?: number | null
       stock: number
       category: string
}

type Client = {
       id: number
       name: string
       phone: string
       membershipStatus?: string
}

type CartItem = Product & { quantity: number; appliedPrice: number }

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

       // Create Product State
       const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
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

       // POS state
       const [receivedAmount, setReceivedAmount] = useState<string>('')
       const [paymentLines, setPaymentLines] = useState<Payment[]>([])
       const [selectedMethod, setSelectedMethod] = useState<string>('CASH')

       // --- Effects ---
       useEffect(() => {
              if (isOpen) {
                     loadProducts()
                     resetSale()
              }
       }, [isOpen])

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

       const loadProducts = async () => {
              setLoading(true)
              try {
                     const data = await getProducts()
                     setProducts(data as any)
              } catch (error) {
                     toast.error("Error al cargar productos")
              } finally {
                     setLoading(false)
              }
       }

       const resetSale = () => {
              setCart([])
              setReceivedAmount('')
              setPaymentLines([])
              setShowCheckout(false)
              setShowSuccess(false)
              setSelectedCategory('Todos')
              setSearchTerm('')
              setSelectedClient(null)
              setClientSearch('')
       }

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

              // Feedback toast
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
                                          toast.warning("Stock m├íximo alcanzado")
                                          return p
                                   }
                                   return { ...p, quantity: newQty }
                            }
                            return p
                     })
              })
       }

       const removeFromCart = (id: number) => {
              setCart(prev => prev.filter(p => p.id !== id))
       }

       const clearCart = () => {
              if (cart.length === 0) return
              if (confirm("┬┐Seguro que deseas vaciar el carrito?")) {
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

       const quickAccessProducts = useMemo(() => {
              // Simulating "top sellers" or just first 5 for now
              return products.slice(0, 5)
       }, [products])

       const total = cart.reduce((sum, item) => sum + (item.appliedPrice * item.quantity), 0)
       const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

       const totalInPayments = paymentLines.reduce((acc, p) => acc + p.amount, 0)
       const pendingToPay = Math.max(0, total - totalInPayments)

       const change = useMemo(() => {
              const received = parseFloat(receivedAmount) || 0
              if (received <= pendingToPay) return 0
              return received - pendingToPay
       }, [receivedAmount, pendingToPay])

       const addPaymentLine = (method: string, amount: number) => {
              if (amount <= 0) return
              setPaymentLines(prev => [...prev, { method, amount }])
              setReceivedAmount('')
       }

       const removePaymentLine = (index: number) => {
              setPaymentLines(prev => prev.filter((_, i) => i !== index))
       }

       const handleFinalize = async () => {
              if (total === 0) return toast.error("Carrito vac├¡o")

              const finalPayments = paymentLines.length > 0 ? paymentLines : [{ method: selectedMethod, amount: total }]

              setProcessing(true)
              try {
                     const saleItems: SaleItem[] = cart.map(i => ({
                            productId: i.id,
                            quantity: i.quantity,
                            price: i.appliedPrice
                     }))

                     await processSale(saleItems, finalPayments, selectedClient?.id || undefined)
                     setShowSuccess(true)
                     toast.success("Venta realizada con ├⌐xito")
                     loadProducts()
              } catch (error: any) {
                     toast.error("Error: " + error.message)
              } finally {
                     setProcessing(false)
              }
       }

       const handleCreateProduct = async () => {
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
              <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#09090B] text-gray-200 font-sans h-screen w-screen overflow-hidden antialiased selection:bg-blue-500 selection:text-white">
                     {/* Mobile Header */}
                     <header className="md:hidden h-16 bg-[#121214] flex items-center justify-between px-4 border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-2">
                                   <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
                                          <Store className="w-5 h-5" />
                                   </div>
                                   <h1 className="font-bold text-lg tracking-tight text-white">MARKET<span className="font-normal text-zinc-500">POS</span></h1>
                            </div>
                            <button onClick={onClose} className="p-2 relative rounded-full hover:bg-white/5 transition text-zinc-400 hover:text-white">
                                   <X className="w-5 h-5" />
                            </button>
                     </header>

                     {/* --- MAIN CONTENT (LEFT PANEL) --- */}
                     <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0 bg-[#09090B]">
                            {/* Header & Search Bar */}
                            <div className="p-6 pb-2 space-y-4 md:space-y-0 md:flex md:gap-6 shrink-0 items-center">
                                   <div className="hidden md:flex items-center gap-4 mr-4 min-w-max">
                                          <motion.div
                                                 initial={{ scale: 0.8, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-white"
                                          >
                                                 <Store className="w-6 h-6" />
                                          </motion.div>
                                          <div>
                                                 <div className="flex items-center gap-2">
                                                        <h1 className="font-black text-2xl tracking-tighter text-white leading-none">MARKET POS</h1>
                                                        <button
                                                               onClick={() => setIsCreateProductOpen(true)}
                                                               className="ml-2 bg-white/5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                                                               title="Crear Nuevo Producto"
                                                        >
                                                               <Plus size={14} />
                                                        </button>
                                                 </div>
                                                 <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Cliente Actual:</span>
                                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                               {selectedClient ? selectedClient.name : 'CONSUMIDOR FINAL'}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                                          {/* Product Search */}
                                          <div className="relative flex-grow group">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-[#18181B] border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-zinc-600 text-white transition-all outline-none shadow-sm"
                                                        placeholder="Buscar productos..."
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                 />
                                          </div>

                                          {/* Client Search */}
                                          <div className="relative md:w-80 group">
                                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-[#18181B] border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder-zinc-600 text-white transition-all outline-none shadow-sm"
                                                        placeholder="Asignar Cliente"
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={e => setClientSearch(e.target.value)}
                                                 />
                                                 {isClientDropdownOpen && clients.length > 0 && (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               className="absolute top-full left-0 right-0 mt-2 bg-[#18181B] rounded-xl shadow-2xl z-50 overflow-hidden border border-zinc-700"
                                                        >
                                                               {clients.slice(0, 5).map(c => (
                                                                      <button
                                                                             key={c.id}
                                                                             onClick={() => {
                                                                                    setSelectedClient(c)
                                                                                    setClientSearch('')
                                                                                    setIsClientDropdownOpen(false)
                                                                             }}
                                                                             className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 flex justify-between items-center group"
                                                                      >
                                                                             <div>
                                                                                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{c.name}</p>
                                                                                    <p className="text-[10px] text-zinc-500">{c.phone}</p>
                                                                             </div>
                                                                             <Plus className="w-4 h-4 text-zinc-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                                                      </button>
                                                               ))}
                                                        </motion.div>
                                                 )}
                                                 {selectedClient && (
                                                        <button
                                                               onClick={() => setSelectedClient(null)}
                                                               className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
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
                                                                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                                                      : "bg-[#18181B] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800"
                                                        )}
                                                 >
                                                        {cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                                          {loading ? (
                                                 <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                                                        <p className="text-zinc-500 font-medium text-sm">Cargando catálogo...</p>
                                                 </div>
                                          ) : filteredProducts.length === 0 ? (
                                                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-zinc-600">
                                                        <SearchX className="w-16 h-16 mb-4 opacity-50" />
                                                        <p className="font-medium">No se encontraron productos</p>
                                                 </div>
                                          ) : filteredProducts.map((p, idx) => {
                                                 const isMember = selectedClient?.membershipStatus === 'ACTIVE'
                                                 const hasDiscount = isMember && p.memberPrice && p.memberPrice < p.price
                                                 const displayPrice = hasDiscount ? p.memberPrice! : p.price

                                                 return (
                                                        <motion.div
                                                               key={p.id}
                                                               initial={{ opacity: 0, scale: 0.9 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               transition={{ delay: idx * 0.05 }}
                                                               onClick={() => p.stock > 0 && addToCart(p)}
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
                                                                                                  loadProducts()
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
                            </div >
                     </main >

                     {/* --- SIDEBAR (RIGHT PANEL - CART) --- */}
                     <aside className="w-full md:w-[480px] bg-[#121214] flex flex-col shadow-2xl z-20 border-l border-white/5 h-full">
                            <div className="hidden md:flex p-6 items-center justify-between border-b border-white/5 bg-[#121214] shrink-0">
                                   <div>
                                          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Punto de Venta</p>
                                          <div className="flex items-center gap-3">
                                                 <h2 className="text-2xl font-black italic tracking-tighter text-white">MI CARRITO</h2>
                                                 <AnimatePresence>
                                                        {cartCount > 0 && (
                                                               <motion.span
                                                                      initial={{ scale: 0 }}
                                                                      animate={{ scale: 1 }}
                                                                      exit={{ scale: 0 }}
                                                                      className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-blue-600/40"
                                                               >
                                                                      {cartCount}
                                                               </motion.span>
                                                        )}
                                                 </AnimatePresence>
                                          </div>
                                   </div>
                                   <div className="flex gap-2">
                                          <button
                                                 onClick={onClose}
                                                 className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-zinc-500"
                                                 title="Cerrar Kiosco"
                                          >
                                                 <X size={18} />
                                          </button>
                                          <button
                                                 onClick={clearCart}
                                                 disabled={cart.length === 0}
                                                 className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all group disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-zinc-500 text-zinc-500"
                                                 title="Vaciar Carrito"
                                          >
                                                 <Trash2 size={18} />
                                          </button>
                                   </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#121214] custom-scrollbar">
                                   <AnimatePresence mode='popLayout'>
                                          {cart.length === 0 ? (
                                                 <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50"
                                                 >
                                                        <ScanBarcode size={64} className="mb-6 stroke-1" />
                                                        <p className="text-sm font-bold uppercase tracking-widest text-center">Escanea productos<br />o selecciona del catálogo</p>
                                                 </motion.div>
                                          ) : (
                                                 cart.map(item => (
                                                        <motion.div
                                                               layout
                                                               key={item.id}
                                                               initial={{ opacity: 0, x: 20 }}
                                                               animate={{ opacity: 1, x: 0 }}
                                                               exit={{ opacity: 0, x: -20 }}
                                                               className="bg-[#18181B] rounded-2xl p-4 flex gap-4 shadow-sm border border-white/5 group hover:border-white/10 transition-colors relative overflow-hidden"
                                                        >
                                                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                               <div className="w-16 h-16 rounded-xl bg-[#121214] flex items-center justify-center shrink-0 border border-white/5">
                                                                      {item.category.toLowerCase().includes('bebida') ? <CupSoda className="text-zinc-500" size={24} /> : <Package className="text-zinc-500" size={24} />}
                                                               </div>

                                                               <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                                                      <div className="flex justify-between items-start gap-2">
                                                                             <h4 className="font-bold text-gray-200 text-sm line-clamp-2 leading-snug">{item.name}</h4>
                                                                             <span className="font-bold text-white text-base bg-white/5 px-2 py-0.5 rounded-lg">${item.appliedPrice * item.quantity}</span>
                                                                      </div>

                                                                      <div className="flex justify-between items-end mt-2">
                                                                             <p className="text-[11px] text-zinc-500 font-medium">Unidad: ${item.appliedPrice}</p>
                                                                             <div className="flex items-center bg-[#121214] rounded-lg p-0.5 border border-white/5">
                                                                                    <button
                                                                                           onClick={() => updateQuantity(item.id, -1)}
                                                                                           className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all"
                                                                                    >
                                                                                           <span className="text-base font-bold">-</span>
                                                                                    </button>
                                                                                    <span className="w-8 text-center text-sm font-bold font-mono text-white">{item.quantity}</span>
                                                                                    <button
                                                                                           onClick={() => updateQuantity(item.id, 1)}
                                                                                           className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-all"
                                                                                    >
                                                                                           <span className="text-base font-bold">+</span>
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </motion.div>
                                                 ))
                                          )}
                                   </AnimatePresence>
                            </div>

                            {/* Total & Action */}
                            <div className="p-6 bg-[#18181B] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-30 shrink-0 space-y-4">

                                   <div className="space-y-2">
                                          <div className="flex justify-between items-center text-sm">
                                                 <span className="text-zinc-500 font-medium">Subtotal</span>
                                                 <span className="font-mono text-zinc-400 font-medium">${total.toLocaleString('es-AR')}</span>
                                          </div>
                                          <div className="flex justify-between items-end">
                                                 <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase pb-1">Total a Pagar</span>
                                                 <div className="text-right">
                                                        <motion.span
                                                               key={total}
                                                               initial={{ scale: 1.2, color: "#fff" }}
                                                               animate={{ scale: 1, color: "#D4FF00" }}
                                                               className="block text-4xl font-black text-[#D4FF00] drop-shadow-[0_0_15px_rgba(212,255,0,0.3)] tabular-nums"
                                                        >
                                                               ${total.toLocaleString('es-AR')}
                                                        </motion.span>
                                                 </div>
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => setShowCheckout(true)}
                                          disabled={cart.length === 0}
                                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-between px-6 group transition-all transform active:scale-[0.98]"
                                   >
                                          <span>CONFIRMAR VENTA</span>
                                          <div className="bg-white/20 rounded-lg p-1.5 group-hover:bg-white/30 transition-colors">
                                                 <ArrowRight className="text-white block w-5 h-5" />
                                          </div>
                                   </button>
                            </div>
                     </aside>

                     {/* --- CHECKOUT OVERLAY --- */}
                     {showCheckout && (
                            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                          onClick={() => setShowCheckout(false)}
                                   />
                                   <motion.div
                                          initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                          animate={{ scale: 1, opacity: 1, y: 0 }}
                                          className="relative z-10 bg-[#18181B] border border-white/5 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/50"
                                   >
                                          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#18181B]">
                                                 <h3 className="text-xl font-bold text-white tracking-tight">Finalizar Venta</h3>
                                                 <button onClick={() => setShowCheckout(false)} className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-zinc-400 hover:text-white transition-colors">
                                                        <X size={20} />
                                                 </button>
                                          </div>

                                          <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                                 <div className="flex flex-col items-center">
                                                        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold mb-2">Total a Pagar</p>
                                                        <div className="relative">
                                                               <span className="text-6xl font-black text-white tracking-tighter">${pendingToPay.toLocaleString()}</span>
                                                        </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                               { id: 'CASH', label: 'Efectivo', icon: Banknote },
                                                               { id: 'TRANSFER', label: 'Transferencia', icon: Landmark },
                                                               { id: 'CREDIT', label: 'Tarjeta', icon: CreditCard },
                                                               { id: 'ACCOUNT', label: 'A Cuenta', icon: NotebookPen, reqClient: true }
                                                        ].map(m => (
                                                               <button
                                                                      key={m.id}
                                                                      onClick={() => setSelectedMethod(m.id)}
                                                                      disabled={m.reqClient && !selectedClient}
                                                                      className={cn(
                                                                             "p-4 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                                                                             selectedMethod === m.id
                                                                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                                                                                    : "bg-[#121214] border-white/5 text-zinc-400 hover:bg-[#1C1C1F] hover:border-white/10",
                                                                             m.reqClient && !selectedClient && "opacity-30 cursor-not-allowed grayscale"
                                                                      )}
                                                               >
                                                                      <m.icon className={cn("w-6 h-6", selectedMethod === m.id ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                                                                      {m.label}
                                                                      {selectedMethod === m.id && (
                                                                             <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-white/20 rounded-2xl" />
                                                                      )}
                                                               </button>
                                                        ))}
                                                 </div>

                                                 <div className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-4">
                                                        <div>
                                                               <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-2">Monto Recibido</label>
                                                               <div className="relative group">
                                                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg group-focus-within:text-blue-500 transition-colors">$</span>
                                                                      <input
                                                                             type="number"
                                                                             autoFocus
                                                                             className="w-full bg-[#09090B] border border-white/5 rounded-xl py-4 pl-8 pr-4 text-white font-mono text-2xl outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                                                                             placeholder={pendingToPay.toString()}
                                                                             value={receivedAmount}
                                                                             onChange={e => setReceivedAmount(e.target.value)}
                                                                      />
                                                               </div>
                                                        </div>
                                                        <AnimatePresence>
                                                               {selectedMethod === 'CASH' && parseFloat(receivedAmount) > pendingToPay && (
                                                                      <motion.div
                                                                             initial={{ height: 0, opacity: 0 }}
                                                                             animate={{ height: "auto", opacity: 1 }}
                                                                             exit={{ height: 0, opacity: 0 }}
                                                                             className="overflow-hidden"
                                                                      >
                                                                             <div className="flex justify-between items-center bg-[#D4FF00]/5 p-4 rounded-xl border border-[#D4FF00]/20">
                                                                                    <span className="text-[#D4FF00] font-bold text-xs uppercase tracking-wider">Vuelto a entregar</span>
                                                                                    <span className="text-[#D4FF00] font-mono font-black text-2xl">${change.toLocaleString()}</span>
                                                                             </div>
                                                                      </motion.div>
                                                               )}
                                                        </AnimatePresence>
                                                 </div>
                                          </div>

                                          <div className="p-6 border-t border-white/5 bg-[#121214]">
                                                 {pendingToPay > 0 && parseFloat(receivedAmount) > 0 && parseFloat(receivedAmount) < pendingToPay && (
                                                        <motion.button
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               onClick={() => addPaymentLine(selectedMethod, parseFloat(receivedAmount))}
                                                               className="w-full mb-3 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide border border-white/5 hover:border-white/10"
                                                        >
                                                               + Agregar Pago Parcial
                                                        </motion.button>
                                                 )}
                                                 <button
                                                        onClick={handleFinalize}
                                                        disabled={processing || (paymentLines.length > 0 && pendingToPay > 0)}
                                                        className="w-full bg-[#D4FF00] hover:bg-[#b0d100] text-black font-black py-4 rounded-xl text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,255,0,0.2)] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)] active:scale-[0.98]"
                                                 >
                                                        {processing ? (
                                                               <span className="flex items-center justify-center gap-2">
                                                                      <Loader2 className="animate-spin w-5 h-5" /> PROCESANDO...
                                                               </span>
                                                        ) : 'COMPLETAR COBRO'}
                                                 </button>
                                          </div>
                                   </motion.div>
                            </div>
                     )}

                     {/* --- SUCCESS OVERLAY --- */}
                     {showSuccess && (
                            <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8">
                                   <motion.div
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", duration: 0.5 }}
                                          className="bg-[#D4FF00] rounded-full p-8 mb-8 shadow-[0_0_60px_rgba(212,255,0,0.4)]"
                                   >
                                          <Sparkles className="w-20 h-20 text-black fill-black/10" />
                                   </motion.div>

                                   <motion.h2
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.2 }}
                                          className="text-5xl font-black text-white uppercase tracking-tighter mb-4 text-center"
                                   >
                                          ¡Venta Exitosa!
                                   </motion.h2>

                                   <motion.p
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.3 }}
                                          className="text-zinc-400 mb-12 text-lg font-medium text-center max-w-md"
                                   >
                                          La transacción ha sido registrada correctamente en el sistema.
                                   </motion.p>

                                   <motion.div
                                          initial={{ y: 20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: 0.4 }}
                                          className="flex flex-col w-full max-w-sm gap-4"
                                   >
                                          <button
                                                 onClick={() => {
                                                        const phone = selectedClient?.phone?.replace(/\D/g, '')
                                                        if (phone) {
                                                               const itemsList = cart.map(i => `${i.quantity}x ${i.name}`).join('%0A')
                                                               const message = `hola *${selectedClient?.name || 'Cliente'}*! 👋%0A%0AConfirmamos tu compra en *Club Padel*:%0A%0A${itemsList}%0A%0A💰 *Total: $${total}*%0A%0A¡Gracias por elegirnos! 🎾`
                                                               window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
                                                        }
                                                        else toast.info("No hay cliente activo")
                                                 }}
                                                 className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-[#25D366]/20 active:scale-[0.98]"
                                          >
                                                 <Smartphone size={24} />
                                                 <span className="text-lg">Enviar Ticket por WhatsApp</span>
                                          </button>
                                          <button
                                                 onClick={resetSale}
                                                 className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                                          >
                                                 NUEVA VENTA
                                          </button>
                                   </motion.div>
                            </div>
                     )}

                     {/* --- CREATE PRODUCT MODAL --- */}
                     {isCreateProductOpen && (
                            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                          onClick={() => setIsCreateProductOpen(false)}
                                   />
                                   <motion.div
                                          initial={{ scale: 0.95, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          className="relative z-10 bg-[#18181B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                                   >
                                          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#18181B]">
                                                 <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                        <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-500">
                                                               <PackagePlus className="w-5 h-5" />
                                                        </div>
                                                        Nuevo Producto
                                                 </h3>
                                                 <button onClick={() => setIsCreateProductOpen(false)} className="text-zinc-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                                                        <X className="w-5 h-5" />
                                                 </button>
                                          </div>

                                          <div className="p-6 space-y-5">
                                                 <div>
                                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Nombre del Producto</label>
                                                        <input
                                                               value={newProduct.name}
                                                               onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                               className="w-full bg-[#121214] border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                                                               placeholder="Ej: Coca Cola, Grip Wilson..."
                                                               autoFocus
                                                        />
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Precio Venta</label>
                                                               <div className="relative">
                                                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                                                      <input
                                                                             type="number"
                                                                             value={newProduct.price}
                                                                             onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                                             className="w-full bg-[#121214] border border-white/5 rounded-xl p-3.5 pl-7 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                                                                             placeholder="0.00"
                                                                      />
                                                               </div>
                                                        </div>
                                                        <div>
                                                               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Costo (Opcional)</label>
                                                               <div className="relative">
                                                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                                                      <input
                                                                             type="number"
                                                                             value={newProduct.cost}
                                                                             onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })}
                                                                             className="w-full bg-[#121214] border border-white/5 rounded-xl p-3.5 pl-7 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                                                                             placeholder="0.00"
                                                                      />
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Stock Inicial</label>
                                                               <input
                                                                      type="number"
                                                                      value={newProduct.stock}
                                                                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                                      className="w-full bg-[#121214] border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                                                                      placeholder="0"
                                                               />
                                                        </div>
                                                        <div>
                                                               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Categoría</label>
                                                               <div className="relative">
                                                                      <select
                                                                             value={newProduct.category}
                                                                             onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                                             className="w-full bg-[#121214] border border-white/5 rounded-xl p-3.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                                                      >
                                                                             {['Bebidas', 'Snacks', 'Indumentaria', 'Accesorios', 'Alquiler', 'Varios'].map(c => (
                                                                                    <option key={c} value={c}>{c}</option>
                                                                             ))}
                                                                      </select>
                                                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                                             <ChevronDown size={16} />
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <button
                                                        onClick={handleCreateProduct}
                                                        disabled={processing}
                                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                                                 >
                                                        {processing ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                                        Guardar Producto
                                                 </button>
                                          </div>
                                   </motion.div>
                            </div>
                     )}
              </div>
       )
}

// Helper icon component for dropdown
function ChevronDown({ size }: { size: number }) {
       return (
              <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width={size}
                     height={size}
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
              >
                     <path d="m6 9 6 6 6-6" />
              </svg>
       )
}
