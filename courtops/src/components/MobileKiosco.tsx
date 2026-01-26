'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getProducts, processSale, getActiveBookings, SaleItem, Payment } from '@/actions/kiosco'
import { getClients } from '@/actions/clients'
import { upsertProduct } from '@/actions/settings'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
       Search,
       ScanBarcode,
       Plus,
       Minus,
       ShoppingCart,
       X,
       ChevronLeft,
       Clock,
       CreditCard,
       Banknote,
       PackagePlus,
       Save
} from 'lucide-react'
import { format } from 'date-fns'

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

type ActiveBooking = {
       id: number
       courtName: string
       clientName: string
       debt: number
       startTime: Date
       endTime: Date
}

type CartItem = Product & { quantity: number; appliedPrice: number }

type Props = {
       isOpen: boolean
       onClose: () => void
}

export default function MobileKiosco({ isOpen, onClose }: Props) {
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

       // Active Bookings
       const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([])

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
       // --- Callbacks ---
       const loadData = useCallback(async () => {
              setLoading(true)
              try {
                     const [productsData, bookingsData] = await Promise.all([
                            getProducts(),
                            getActiveBookings()
                     ])
                     setProducts(productsData as any)
                     setActiveBookings(bookingsData as any)
              } catch (error) {
                     toast.error("Error al cargar datos del kiosco")
              } finally {
                     setLoading(false)
              }
       }, [])

       const resetSale = useCallback(() => {
              setCart([])
              setReceivedAmount('')
              setPaymentLines([])
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
                     loadData()
                     resetSale()
              }
       }, [isOpen, loadData, resetSale])

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

              // Feedback toast
              toast.success(`${product.name} agregada`, {
                     duration: 1000,
                     position: 'top-center',
                     style: { background: '#22c55e', color: 'black' }
              })
       }

       const updateQuantity = (id: number, delta: number) => {
              setCart(prev => {
                     return prev.map(p => {
                            if (p.id === id) {
                                   const newQty = p.quantity + delta
                                   if (newQty <= 0) return { ...p, quantity: 0 } // Will be filtered out later or handled
                                   if (newQty > p.stock) {
                                          toast.warning("Stock máximo alcanzado")
                                          return p
                                   }
                                   return { ...p, quantity: newQty }
                            }
                            return p
                     }).filter(p => p.quantity > 0)
              })
       }

       const removeFromCart = (id: number) => {
              setCart(prev => prev.filter(p => p.id !== id))
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

       const popularProducts = useMemo(() => {
              return products.slice(0, 4)
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

       const handleFinalize = async () => {
              if (total === 0) return toast.error("Carrito vacío")
              const finalPayments = paymentLines.length > 0 ? paymentLines : [{ method: selectedMethod, amount: total }]
              setProcessing(true)
              try {
                     const saleItems: SaleItem[] = cart.map(i => ({
                            productId: i.id,
                            quantity: i.quantity,
                            price: i.appliedPrice
                     }))
                     await processSale(saleItems, finalPayments, selectedClient?.id || undefined)
                     setShowCheckout(false)
                     setShowSuccess(true)
                     toast.success("Venta realizada con éxito")
                     loadData()
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
                     loadData()
              } catch (error: any) {
                     toast.error(error.message)
              } finally {
                     setProcessing(false)
              }
       }

       if (!isOpen) return null

       return (
              <div className="fixed inset-0 z-[100] bg-bg-dark flex flex-col animate-in fade-in duration-200">
                     {/* HEADER */}
                     <header className="bg-bg-card px-4 py-3 shadow-sm z-20 flex items-center justify-between sticky top-0 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                   <button onClick={onClose} className="text-text-grey hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors">
                                          <ChevronLeft className="w-6 h-6" />
                                   </button>
                                   <div>
                                          <h1 className="font-bold text-lg text-white leading-tight tracking-tight flex items-center gap-2">
                                                 Market POS
                                                 <button
                                                        onClick={() => setIsCreateProductOpen(true)}
                                                        className="bg-brand-blue/20 text-brand-blue p-1 rounded-full hover:bg-brand-blue hover:text-white transition-colors"
                                                 >
                                                        <PackagePlus className="w-4 h-4" />
                                                 </button>
                                          </h1>
                                          <span className="text-[10px] text-brand-blue font-bold bg-brand-blue/10 px-2 py-0.5 rounded-full">PRO</span>
                                   </div>
                            </div>
                            <div className="flex items-center gap-2">
                                   {selectedClient ? (
                                          <div className="h-8 pr-3 pl-1 bg-brand-green/10 rounded-full flex items-center gap-2 border border-brand-green/20" onClick={() => setSelectedClient(null)}>
                                                 <div className="h-6 w-6 rounded-full bg-brand-green flex items-center justify-center text-[10px] font-bold text-bg-dark">
                                                        {selectedClient.name.substring(0, 2).toUpperCase()}
                                                 </div>
                                                 <span className="text-xs font-bold text-brand-green">{selectedClient.name}</span>
                                                 <X className="w-3 h-3 text-brand-green/50" />
                                          </div>
                                   ) : (
                                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-text-grey">
                                                 MP
                                          </div>
                                   )}
                            </div>
                     </header>

                     <main className="flex-1 overflow-y-auto pb-48 px-4 py-4 space-y-6">
                            {/* SEARCH */}
                            <div className="relative group">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                                   </div>
                                   <input
                                          className="block w-full pl-10 pr-10 py-3.5 bg-bg-card border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all shadow-sm outline-none"
                                          placeholder={selectedClient ? "Buscar producto..." : "Buscar producto (o Cliente por Nombre)..."}
                                          type="text"
                                          value={searchTerm || clientSearch}
                                          onChange={e => {
                                                 const val = e.target.value
                                                 setSearchTerm(val)
                                                 if (!selectedClient) setClientSearch(val)
                                          }}
                                   />
                                   {!selectedClient && isClientDropdownOpen && clients.length > 0 && (
                                          <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                 <div className="p-2 border-b border-white/5 text-[10px] text-gray-500 font-bold uppercase">Clientes encontrados</div>
                                                 {clients.slice(0, 3).map(c => (
                                                        <button
                                                               key={c.id}
                                                               onClick={() => {
                                                                      setSelectedClient(c)
                                                                      setClientSearch('')
                                                                      setSearchTerm('')
                                                                      setIsClientDropdownOpen(false)
                                                               }}
                                                               className="w-full text-left p-3 hover:bg-white/5 flex justify-between items-center"
                                                        >
                                                               <span className="text-white text-sm font-bold">{c.name}</span>
                                                               {c.membershipStatus === 'ACTIVE' && <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded">SOCIO</span>}
                                                        </button>
                                                 ))}
                                          </div>
                                   )}
                                   <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                                                 <ScanBarcode className="w-5 h-5" />
                                          </button>
                                   </div>
                            </div>

                            {/* CATEGORIES */}
                            <div>
                                   <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                          {categories.map(cat => (
                                                 <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={cn(
                                                               "flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors border",
                                                               selectedCategory === cat
                                                                      ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20"
                                                                      : "bg-bg-card border-white/5 text-text-grey hover:bg-white/5 hover:text-white"
                                                        )}
                                                 >
                                                        {cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* POPULAR / SEARCH RESULTS */}
                            <section>
                                   <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                          {searchTerm ? 'Resultados' : 'Populares'}
                                   </h2>
                                   <div className="grid grid-cols-2 gap-3">
                                          {(searchTerm ? filteredProducts : popularProducts).map(p => {
                                                 const isStockLow = p.stock <= 5
                                                 const icon = p.category.toLowerCase().includes('bebida') ? '🥤' : p.category.toLowerCase().includes('snack') ? '🍟' : p.category.toLowerCase().includes('alquiler') ? '👕' : '🎾'
                                                 const inCartItem = cart.find(i => i.id === p.id)

                                                 return (
                                                        <div
                                                               key={p.id}
                                                               onClick={() => {
                                                                      // If not in cart, add it. If in cart, do nothing (user must use controls)
                                                                      if (!inCartItem && p.stock > 0) addToCart(p)
                                                               }}
                                                               className={cn(
                                                                      "bg-bg-card p-3 rounded-2xl shadow-sm border transition-all relative overflow-hidden group",
                                                                      inCartItem ? "border-brand-blue ring-1 ring-brand-blue/50 bg-brand-blue/5" : "border-white/5 hover:border-brand-blue/50 active:scale-95 cursor-pointer"
                                                               )}
                                                        >
                                                               {p.stock >= 0 && (
                                                                      <div className={cn(
                                                                             "absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded",
                                                                             isStockLow ? "bg-orange-500/20 text-orange-500" : "bg-brand-green/10 text-brand-green"
                                                                      )}>
                                                                             {p.stock} u.
                                                                      </div>
                                                               )}
                                                               <div className="h-24 w-full bg-white/5 rounded-xl mb-3 flex items-center justify-center">
                                                                      <span className="text-4xl">{icon}</span>
                                                               </div>
                                                               <div>
                                                                      <h3 className="font-medium text-sm text-white leading-tight line-clamp-1">{p.name}</h3>
                                                                      <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>

                                                                      {inCartItem ? (
                                                                             <div className="mt-2 flex items-center justify-between bg-brand-blue/10 rounded-lg p-1 border border-brand-blue/20" onClick={e => e.stopPropagation()}>
                                                                                    <button
                                                                                           onClick={() => updateQuantity(p.id, -1)}
                                                                                           className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent hover:bg-brand-blue/20 text-brand-blue transition-colors"
                                                                                    >
                                                                                           <Minus className="w-4 h-4" />
                                                                                    </button>
                                                                                    <span className="font-bold text-brand-blue text-lg">{inCartItem.quantity}</span>
                                                                                    <button
                                                                                           onClick={() => updateQuantity(p.id, 1)}
                                                                                           className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent hover:bg-brand-blue/20 text-brand-blue transition-colors"
                                                                                    >
                                                                                           <Plus className="w-4 h-4" />
                                                                                    </button>
                                                                             </div>
                                                                      ) : (
                                                                             <div className="flex items-center justify-between mt-2">
                                                                                    <span className="font-bold text-brand-blue">${p.price}</span>
                                                                                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                                                                           <Plus className="w-4 h-4" />
                                                                                    </div>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 )
                                          })}
                                   </div>
                            </section>

                            {activeBookings.length > 0 && (
                                   <section className="pb-4">
                                          <div className="flex items-center justify-between mb-3">
                                                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Turno Actual</h2>
                                                 <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded font-medium animate-pulse">En juego</span>
                                          </div>
                                          {activeBookings.map(booking => (
                                                 <div key={booking.id} className="bg-bg-card rounded-xl p-4 border border-white/5 flex items-center justify-between mb-2">
                                                        <div>
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <span className="text-xs font-bold bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded">{booking.courtName}</span>
                                                                      <span className="text-xs text-gray-400">
                                                                             {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                                                                      </span>
                                                               </div>
                                                               <p className="font-medium text-sm text-white">{booking.clientName}</p>
                                                               {booking.debt > 0 ? (
                                                                      <p className="text-xs text-gray-500">Debe: <span className="text-red-500 font-bold">${booking.debt}</span></p>
                                                               ) : (
                                                                      <p className="text-xs text-gray-500">Pagado</p>
                                                               )}
                                                        </div>
                                                        <button
                                                               onClick={() => {
                                                                      toast.info("Función 'Cargar a Reserva' pronto")
                                                               }}
                                                               className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                                                        >
                                                               <ShoppingCart className="w-5 h-5" />
                                                        </button>
                                                 </div>
                                          ))}
                                   </section>
                            )}
                     </main>

                     {/* BOTTOM SHEET CART */}
                     <div className="fixed bottom-0 left-0 right-0 z-30">
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/90 to-transparent pointer-events-none h-full -top-10"></div>
                            <div className="relative bg-bg-card border-t border-white/5 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)] p-5 pb-8 safe-area-bottom">
                                   <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4" onClick={() => setShowCheckout(!showCheckout)}></div>

                                   <div className="flex items-start justify-between mb-4">
                                          <div className="flex flex-col">
                                                 <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                                                        Mi Carrito <span className="ml-1 bg-brand-blue text-white text-[9px] px-1.5 py-0.5 rounded-full">{cartCount}</span>
                                                 </span>
                                                 <div className="text-xs text-gray-300 space-y-1">
                                                        {cart.slice(0, 2).map(i => (
                                                               <div key={i.id} className="flex items-center gap-2">
                                                                      <span className="w-4 text-gray-500 text-[10px]">{i.quantity}x</span>
                                                                      <span>{i.name}</span>
                                                               </div>
                                                        ))}
                                                        {cart.length > 2 && <span className="text-[10px] text-gray-500">+{cart.length - 2} más...</span>}
                                                 </div>
                                          </div>
                                          <div className="text-right">
                                                 <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total</span>
                                                 <span className="text-3xl font-bold text-brand-green tracking-tight">${total.toLocaleString()}</span>
                                          </div>
                                   </div>

                                   {!showCheckout ? (
                                          <button
                                                 onClick={() => setShowCheckout(true)}
                                                 className="w-full bg-brand-blue hover:bg-brand-blue-secondary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-brand-blue/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                                          >
                                                 <span>CONFIRMAR COBRO</span>
                                                 <Banknote className="w-6 h-6" />
                                          </button>
                                   ) : (
                                          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                                 <div className="grid grid-cols-3 gap-2">
                                                        <button onClick={() => setSelectedMethod('CASH')} className={cn("p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1", selectedMethod === 'CASH' ? "bg-brand-blue/20 border-brand-blue text-brand-blue" : "border-white/10 text-gray-400")}>
                                                               <Banknote className="w-4 h-4" /> Efectivo
                                                        </button>
                                                        <button onClick={() => setSelectedMethod('TRANSFER')} className={cn("p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1", selectedMethod === 'TRANSFER' ? "bg-brand-blue/20 border-brand-blue text-brand-blue" : "border-white/10 text-gray-400")}>
                                                               <CreditCard className="w-4 h-4" /> Transf
                                                        </button>
                                                        <button disabled={!selectedClient} onClick={() => setSelectedMethod('ACCOUNT')} className={cn("p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1", selectedMethod === 'ACCOUNT' ? "bg-brand-blue/20 border-brand-blue text-brand-blue" : "border-white/10 text-gray-400 opacity-50")}>
                                                               <Clock className="w-4 h-4" /> A Cuenta
                                                        </button>
                                                 </div>
                                                 <button
                                                        onClick={handleFinalize}
                                                        disabled={processing}
                                                        className="w-full bg-brand-green text-bg-dark font-bold text-lg py-4 rounded-xl shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2"
                                                 >
                                                        {processing ? 'Procesando...' : 'FINALIZAR'}
                                                 </button>
                                          </div>
                                   )}

                                   <div className="mt-3 text-center">
                                          <button
                                                 onClick={() => setShowCheckout(!showCheckout)}
                                                 className="text-xs text-gray-500 underline decoration-dotted hover:text-white"
                                          >
                                                 {showCheckout ? 'Cancelar Cobro' : 'Ver detalle completo'}
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* CREATE PRODUCT MODAL */}
                     {isCreateProductOpen && (
                            <div className="absolute inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                                   <div className="bg-bg-card w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                                 <h3 className="font-bold text-white flex items-center gap-2">
                                                        <PackagePlus className="w-5 h-5 text-brand-blue" />
                                                        Nuevo Producto
                                                 </h3>
                                                 <button onClick={() => setIsCreateProductOpen(false)} className="bg-black/20 text-white/50 hover:text-white p-1 rounded-full"><X className="w-5 h-5" /></button>
                                          </div>
                                          <div className="p-4 space-y-4">
                                                 <div>
                                                        <label className="text-xs text-text-grey font-bold block mb-1">Nombre</label>
                                                        <input
                                                               value={newProduct.name}
                                                               onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                               className="w-full bg-bg-dark border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-brand-blue"
                                                               placeholder="Ej: Coca Cola"
                                                        />
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                               <label className="text-xs text-text-grey font-bold block mb-1">Precio Venta</label>
                                                               <input
                                                                      type="number"
                                                                      value={newProduct.price}
                                                                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                                      className="w-full bg-bg-dark border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-brand-blue"
                                                                      placeholder="$0"
                                                               />
                                                        </div>
                                                        <div>
                                                               <label className="text-xs text-text-grey font-bold block mb-1">Costo (Opcional)</label>
                                                               <input
                                                                      type="number"
                                                                      value={newProduct.cost}
                                                                      onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })}
                                                                      className="w-full bg-bg-dark border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-brand-blue"
                                                                      placeholder="$0"
                                                               />
                                                        </div>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                               <label className="text-xs text-text-grey font-bold block mb-1">Stock Inicial</label>
                                                               <input
                                                                      type="number"
                                                                      value={newProduct.stock}
                                                                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                                      className="w-full bg-bg-dark border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-brand-blue"
                                                                      placeholder="0"
                                                               />
                                                        </div>
                                                        <div>
                                                               <label className="text-xs text-text-grey font-bold block mb-1">Categoría</label>
                                                               <select
                                                                      value={newProduct.category}
                                                                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                                      className="w-full bg-bg-dark border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-brand-blue"
                                                               >
                                                                      {categories.filter(c => c !== 'Todos').map(c => (
                                                                             <option key={c} value={c}>{c}</option>
                                                                      ))}
                                                                      <option value="Varios">Varios</option>
                                                               </select>
                                                        </div>
                                                 </div>
                                                 <button
                                                        onClick={handleCreateProduct}
                                                        disabled={processing}
                                                        className="w-full bg-brand-green text-bg-dark font-bold py-3 rounded-xl hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2 mt-2"
                                                 >
                                                        {processing ? <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                                                        Guardar Producto
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
