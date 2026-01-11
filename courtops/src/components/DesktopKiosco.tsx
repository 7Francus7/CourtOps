'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { getProducts, processSale, SaleItem, Payment } from '@/actions/kiosco'
import { getClients } from '@/actions/clients'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
       Store,
       Search,
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
       Sparkles
} from 'lucide-react'

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

       if (!isOpen) return null

       return (
              <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#F3F4F6] dark:bg-[#050505] text-gray-800 dark:text-gray-200 font-sans h-screen w-screen overflow-hidden antialiased selection:bg-[#006FEE] selection:text-white dark animate-in fade-in duration-300">
                     {/* Mobile Header (Hidden on Desktop but good for responsiveness) */}
                     <header className="md:hidden h-16 bg-white dark:bg-[#121212] flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                            <div className="flex items-center gap-2">
                                   <div className="bg-[#006FEE]/20 p-2 rounded-lg text-[#006FEE]">
                                          <Store className="w-5 h-5" />
                                   </div>
                                   <h1 className="font-bold text-lg tracking-tight">MARKET<span className="font-normal text-gray-500 dark:text-gray-400">POS</span></h1>
                            </div>
                            <button onClick={onClose} className="p-2 relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                   <X className="w-5 h-5" />
                            </button>
                     </header>

                     {/* --- MAIN CONTENT (LEFT PANEL) --- */}
                     <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                            {/* Header & Search Bar */}
                            <div className="p-4 md:p-6 pb-2 space-y-4 md:space-y-0 md:flex md:gap-4 shrink-0 items-center">
                                   <div className="hidden md:flex items-center gap-3 mr-4 min-w-max">
                                          <div className="bg-[#006FEE]/10 p-2.5 rounded-xl text-[#006FEE]">
                                                 <Store className="w-6 h-6" />
                                          </div>
                                          <div>
                                                 <h1 className="font-black text-xl tracking-tighter text-gray-900 dark:text-white leading-none">MARKET POS <span className="text-[10px] bg-[#006FEE]/20 text-[#006FEE] px-1.5 py-0.5 rounded align-middle ml-1">PRO</span></h1>
                                                 <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full inline-block mt-1">
                                                        {selectedClient ? selectedClient.name : 'CONSUMIDOR FINAL'}
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                                          {/* Product Search */}
                                          <div className="relative flex-grow group">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006FEE] transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-white dark:bg-[#1E1E1E] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#006FEE] shadow-sm dark:shadow-none placeholder-gray-400 dark:text-white transition-all outline-none"
                                                        placeholder="Buscar nombre, bebida, pelota..."
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                 />
                                          </div>

                                          {/* Client Search */}
                                          <div className="relative md:w-1/3 group">
                                                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006FEE] transition-colors w-5 h-5" />
                                                 <input
                                                        className="w-full bg-white dark:bg-[#1E1E1E] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#006FEE] shadow-sm dark:shadow-none placeholder-gray-400 dark:text-white transition-all outline-none"
                                                        placeholder="Cliente (Opcional)"
                                                        type="text"
                                                        value={clientSearch}
                                                        onChange={e => setClientSearch(e.target.value)}
                                                 />
                                                 {isClientDropdownOpen && clients.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100 dark:border-gray-800">
                                                               {clients.slice(0, 5).map(c => (
                                                                      <button
                                                                             key={c.id}
                                                                             onClick={() => {
                                                                                    setSelectedClient(c)
                                                                                    setClientSearch('')
                                                                                    setIsClientDropdownOpen(false)
                                                                             }}
                                                                             className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between items-center group"
                                                                      >
                                                                             <div>
                                                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{c.name}</p>
                                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{c.phone}</p>
                                                                             </div>
                                                                             <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#006FEE]" />
                                                                      </button>
                                                               ))}
                                                        </div>
                                                 )}
                                                 {selectedClient && (
                                                        <button
                                                               onClick={() => setSelectedClient(null)}
                                                               className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500/10 rounded-full group"
                                                        >
                                                               <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                                        </button>
                                                 )}
                                          </div>
                                   </div>
                            </div>

                            {/* Filters / Categories */}
                            <div className="px-4 md:px-6 py-2 shrink-0 overflow-x-auto no-scrollbar">
                                   <div className="flex gap-3 pb-2 md:pb-0">
                                          {categories.map(cat => (
                                                 <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                               "px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap border group",
                                                               selectedCategory === cat
                                                                      ? "bg-[#006FEE] text-white shadow-lg shadow-[#006FEE]/30 border-transparent active:scale-95"
                                                                      : "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                                        )}
                                                 >
                                                        {cat === 'Todos' && <Store className={cn("text-lg transition-colors", selectedCategory === cat ? "text-white" : "text-gray-400 group-hover:text-[#006FEE]")} size={18} />}
                                                        {cat.toLowerCase().includes('equipamiento') && <Check className={cn("text-lg transition-colors", selectedCategory === cat ? "text-white" : "text-gray-400 group-hover:text-[#006FEE]")} size={18} />}
                                                        {cat.toLowerCase().includes('bebida') && <CupSoda className={cn("text-lg transition-colors", selectedCategory === cat ? "text-white" : "text-gray-400 group-hover:text-[#006FEE]")} size={18} />}
                                                        {cat.toLowerCase().includes('alquiler') && <NotebookPen className={cn("text-lg transition-colors", selectedCategory === cat ? "text-white" : "text-gray-400 group-hover:text-[#006FEE]")} size={18} />}
                                                        {cat.toLowerCase().includes('suple') && <Cookie className={cn("text-lg transition-colors", selectedCategory === cat ? "text-white" : "text-gray-400 group-hover:text-[#006FEE]")} size={18} />}

                                                        {cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 custom-scrollbar">
                                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 pb-20">
                                          {loading ? (
                                                 <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                                                        <div className="w-10 h-10 border-4 border-[#006FEE] border-t-transparent rounded-full animate-spin mb-4" />
                                                        <p className="text-gray-500 font-medium">Cargando productos...</p>
                                                 </div>
                                          ) : filteredProducts.length === 0 ? (
                                                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                                        <SearchX className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" />
                                                        <p className="text-gray-500 font-medium">No se encontraron productos</p>
                                                 </div>
                                          ) : filteredProducts.map(p => {
                                                 const isMember = selectedClient?.membershipStatus === 'ACTIVE'
                                                 const hasDiscount = isMember && p.memberPrice && p.memberPrice < p.price
                                                 const displayPrice = hasDiscount ? p.memberPrice! : p.price

                                                 return (
                                                        <div
                                                               key={p.id}
                                                               onClick={() => p.stock > 0 && addToCart(p)}
                                                               className={cn(
                                                                      "group bg-white dark:bg-[#121212] rounded-2xl p-3 flex flex-col gap-3 hover:shadow-xl dark:hover:shadow-black/60 transition-all border border-transparent hover:border-[#006FEE]/40 cursor-pointer relative overflow-hidden",
                                                                      p.stock === 0 && "opacity-50 grayscale cursor-not-allowed"
                                                               )}
                                                        >
                                                               <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center">
                                                                      {/* Placeholder Icon if no image - In real app replace with Image tag if URL available */}
                                                                      <div className="text-gray-300 dark:text-gray-600">
                                                                             {p.category.toLowerCase().includes('bebida') ? <CupSoda size={48} /> :
                                                                                    p.category.toLowerCase().includes('snack') ? <Cookie size={48} /> :
                                                                                           <Package size={48} />}
                                                                      </div>

                                                                      {p.stock > 0 && (
                                                                             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                                                                    {p.stock} un.
                                                                             </div>
                                                                      )}
                                                                      {p.stock === 0 && (
                                                                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">SIN STOCK</span>
                                                                             </div>
                                                                      )}
                                                                      {hasDiscount && (
                                                                             <div className="absolute top-2 left-2 bg-[#D4FF00] text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                                                                                    SOCIO
                                                                             </div>
                                                                      )}
                                                               </div>

                                                               <div>
                                                                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base leading-tight line-clamp-2 min-h-[2.5em]">{p.name}</h3>
                                                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.category}</p>
                                                               </div>

                                                               <div className="mt-auto flex items-center justify-between">
                                                                      <div className="flex flex-col">
                                                                             <span className="font-bold text-lg text-gray-900 dark:text-white">${displayPrice}</span>
                                                                             {hasDiscount && <span className="text-[10px] text-gray-400 line-through">${p.price}</span>}
                                                                      </div>
                                                                      <button className="bg-[#006FEE]/10 hover:bg-[#006FEE] text-[#006FEE] hover:text-white w-9 h-9 rounded-lg flex items-center justify-center transition-colors">
                                                                             <Plus size={20} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )
                                          })}
                                   </div>
                            </div>
                     </main>

                     {/* --- SIDEBAR (RIGHT PANEL - CART) --- */}
                     <aside className="w-full md:w-[420px] bg-white dark:bg-[#111316] flex flex-col shadow-2xl z-20 border-l border-gray-200 dark:border-gray-800 h-full">
                            <div className="hidden md:flex p-6 items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111316] shrink-0">
                                   <div>
                                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Checkpoint</p>
                                          <div className="flex items-center gap-2">
                                                 <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">MI CARRITO</h2>
                                                 {cartCount > 0 && (
                                                        <span className="bg-[#006FEE] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-[#006FEE]/40 animate-in zoom-in">{cartCount}</span>
                                                 )}
                                          </div>
                                   </div>
                                   <div className="flex gap-2">
                                          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-400">
                                                 <X size={20} />
                                          </button>
                                          <button
                                                 onClick={clearCart}
                                                 className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-400"
                                                 disabled={cart.length === 0}
                                          >
                                                 <Trash2 className="text-gray-400 group-hover:text-white text-xl" />
                                          </button>
                                   </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0d0f12] custom-scrollbar">
                                   {cart.length === 0 ? (
                                          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                                 <ScanBarcode size={64} className="mb-4" />
                                                 <p className="text-sm font-bold uppercase tracking-widest">CARRITO VACÍO</p>
                                          </div>
                                   ) : (
                                          cart.map(item => (
                                                 <div key={item.id} className="bg-white dark:bg-[#181b21] rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors animate-in slide-in-from-right-2">
                                                        <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                                               {item.category.toLowerCase().includes('bebida') ? <CupSoda className="text-gray-400" /> : <Package className="text-gray-400" />}
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                                               <div className="flex justify-between items-start">
                                                                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-2 leading-snug">{item.name}</h4>
                                                                      <span className="font-bold text-gray-900 dark:text-white text-base ml-2">${item.appliedPrice * item.quantity}</span>
                                                               </div>
                                                               <div className="flex justify-between items-end mt-2">
                                                                      <p className="text-[11px] text-gray-400 font-medium">Unidad: ${item.appliedPrice}</p>
                                                                      <div className="flex items-center bg-gray-100 dark:bg-black rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
                                                                             <button
                                                                                    onClick={() => updateQuantity(item.id, -1)}
                                                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 shadow-sm transition-all"
                                                                             >
                                                                                    <span className="text-base font-bold">-</span>
                                                                             </button>
                                                                             <span className="w-8 text-center text-sm font-bold font-mono dark:text-white">{item.quantity}</span>
                                                                             <button
                                                                                    onClick={() => updateQuantity(item.id, 1)}
                                                                                    className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400 shadow-sm transition-all"
                                                                             >
                                                                                    <span className="text-base font-bold">+</span>
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>
                                          ))
                                   )}
                            </div>

                            {/* Total & Action */}
                            <div className="p-6 bg-white dark:bg-[#111316] border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.3)] relative z-30 shrink-0">
                                   <div className="flex justify-between items-center mb-3">
                                          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Items Subtotal</span>
                                          <span className="font-mono text-gray-400 font-medium">${total.toLocaleString('es-AR')}</span>
                                   </div>
                                   <div className="flex justify-between items-end mb-6">
                                          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase pb-1">Monto Neto a Cobrar</span>
                                          <div className="text-right">
                                                 <span className="block text-4xl font-black text-[#006FEE] dark:text-[#D4FF00] drop-shadow-[0_0_8px_rgba(212,255,0,0.5)]">
                                                        ${total.toLocaleString('es-AR')}
                                                 </span>
                                          </div>
                                   </div>
                                   <button
                                          onClick={() => setShowCheckout(true)}
                                          disabled={cart.length === 0}
                                          className="w-full bg-[#006FEE] hover:bg-[#005BC4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-2xl shadow-xl shadow-[#006FEE]/30 flex items-center justify-between px-6 group transition-all transform active:scale-[0.98]"
                                   >
                                          <span>CONFIRMAR VENTA</span>
                                          <div className="bg-white/20 rounded-lg p-1">
                                                 <Banknote className="text-white block w-6 h-6" />
                                          </div>
                                   </button>
                            </div>
                     </aside>

                     {/* --- CHECKOUT OVERLAY (Reused existing structure but styled to match) --- */}
                     {showCheckout && (
                            <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                                   <div className="bg-[#111418] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
                                          <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                                 <h3 className="text-xl font-bold text-white">Método de Pago</h3>
                                                 <button onClick={() => setShowCheckout(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
                                                        <X size={20} />
                                                 </button>
                                          </div>

                                          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                                 <div className="flex flex-col items-center">
                                                        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Total a Pagar</p>
                                                        <p className="text-5xl font-black text-white mt-2">${pendingToPay}</p>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                               { id: 'CASH', label: 'Efectivo', icon: <Banknote className="w-6 h-6" /> },
                                                               { id: 'TRANSFER', label: 'Transf.', icon: <Landmark className="w-6 h-6" /> },
                                                               { id: 'CREDIT', label: 'Deb/Cred', icon: <CreditCard className="w-6 h-6" /> },
                                                               { id: 'ACCOUNT', label: 'A Cuenta', icon: <NotebookPen className="w-6 h-6" />, reqClient: true }
                                                        ].map(m => (
                                                               <button
                                                                      key={m.id}
                                                                      onClick={() => setSelectedMethod(m.id)}
                                                                      disabled={m.reqClient && !selectedClient}
                                                                      className={cn(
                                                                             "p-4 rounded-xl border font-bold text-sm transition-all flex flex-col items-center gap-2",
                                                                             selectedMethod === m.id
                                                                                    ? "bg-[#006FEE] border-[#006FEE] text-white"
                                                                                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10",
                                                                             m.reqClient && !selectedClient && "opacity-30 cursor-not-allowed"
                                                                      )}
                                                               >
                                                                      {m.icon}
                                                                      {m.label}
                                                               </button>
                                                        ))}
                                                 </div>

                                                 <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-2">Monto Recibido</label>
                                                        <div className="relative">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                               <input
                                                                      type="number"
                                                                      autoFocus
                                                                      className="w-full bg-[#111418] border border-white/20 rounded-xl py-3 pl-8 pr-4 text-white font-mono text-xl outline-none focus:border-[#006FEE]"
                                                                      placeholder={pendingToPay.toString()}
                                                                      value={receivedAmount}
                                                                      onChange={e => setReceivedAmount(e.target.value)}
                                                               />
                                                        </div>
                                                        {selectedMethod === 'CASH' && parseFloat(receivedAmount) > pendingToPay && (
                                                               <div className="mt-3 flex justify-between items-center bg-[#D4FF00]/10 p-3 rounded-lg border border-[#D4FF00]/20">
                                                                      <span className="text-[#D4FF00] font-bold text-xs uppercase">Vuelto a entregar</span>
                                                                      <span className="text-[#D4FF00] font-mono font-bold text-xl">${change}</span>
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>

                                          <div className="p-6 border-t border-white/10 bg-[#0B0D10]">
                                                 {pendingToPay > 0 && parseFloat(receivedAmount) > 0 && parseFloat(receivedAmount) < pendingToPay && (
                                                        <button
                                                               onClick={() => addPaymentLine(selectedMethod, parseFloat(receivedAmount))}
                                                               className="w-full mb-3 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
                                                        >
                                                               AGREGAR PAGO PARCIAL
                                                        </button>
                                                 )}
                                                 <button
                                                        onClick={handleFinalize}
                                                        disabled={processing || (paymentLines.length > 0 && pendingToPay > 0)}
                                                        className="w-full bg-[#D4FF00] hover:bg-[#b0d100] text-black font-black py-4 rounded-xl text-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                 >
                                                        {processing ? 'PROCESANDO...' : 'COMPLETAR COBRO'}
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}

                     {/* --- SUCCESS OVERLAY --- */}
                     {showSuccess && (
                            <div className="absolute inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                                   <div className="bg-[#D4FF00] rounded-full p-6 mb-6 shadow-[0_0_50px_rgba(212,255,0,0.5)] animate-in zoom-in duration-500">
                                          <Sparkles className="w-16 h-16 text-black" />
                                   </div>
                                   <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-2">¡Venta Exitosa!</h2>
                                   <p className="text-gray-400 mb-8">La transacción ha sido registrada correctamente.</p>

                                   <div className="flex flex-col w-full max-w-sm gap-3">
                                          <button
                                                 onClick={() => {
                                                        const phone = selectedClient?.phone?.replace(/\D/g, '')
                                                        if (phone) window.open(`https://wa.me/${phone}?text=Hola+${selectedClient?.name},+tu+compra+por+$${total}+en+MarketPadel+fue+registrada.+¡Muchas+Gracias!`, '_blank')
                                                        else toast.info("No hay cliente activo")
                                                 }}
                                                 className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
                                          >
                                                 <Smartphone size={20} />
                                                 Enviar Ticket por WhatsApp
                                          </button>
                                          <button
                                                 onClick={resetSale}
                                                 className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-xl transition-colors"
                                          >
                                                 NUEVA VENTA
                                          </button>
                                   </div>
                            </div>
                     )}

              </div>
       )
}
