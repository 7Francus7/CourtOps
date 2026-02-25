'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getProducts, processSale, getActiveBookings, restockProduct, SaleItem, Payment } from '@/actions/kiosco'
import { getClients } from '@/actions/clients'
import { getClubSettings } from '@/actions/dashboard'
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
import { formatInArg } from '@/lib/client-date-utils'
import { KioscoSuccessOverlay } from './kiosco/KioscoSuccessOverlay'

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

       const [allowCredit, setAllowCredit] = useState(true)

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
                     const [productsData, bookingsData, settingsData] = await Promise.all([
                            getProducts(),
                            getActiveBookings(),
                            getClubSettings()
                     ])
                     setProducts((productsData as any)?.success ? (productsData as any).data : [])
                     setActiveBookings((bookingsData as any)?.success ? (bookingsData as any).data : [])
                     if (settingsData) {
                            setAllowCredit(settingsData.allowCredit ?? true)
                     }
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
                            getClients(clientSearch).then((res: any) => {
                                   if (res.success && Array.isArray(res.data)) {
                                          setClients(res.data)
                                          setIsClientDropdownOpen(true)
                                   } else {
                                          setClients([])
                                          setIsClientDropdownOpen(false)
                                   }
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
                     const res = await processSale(saleItems, finalPayments, selectedClient?.id || undefined)

                     if (!res.success) throw new Error(res.error)

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
                     const res = await upsertProduct({
                            name: newProduct.name,
                            category: newProduct.category,
                            price: parseFloat(newProduct.price),
                            cost: parseFloat(newProduct.cost) || 0,
                            stock: parseInt(newProduct.stock) || 0
                     })

                     if (!res.success) throw new Error(res.error)

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

       const handleRestock = async (product: Product) => {
              const qty = prompt(`Agregar Stock a ${product.name}:`, '0')
              if (qty && parseInt(qty) > 0) {
                     try {
                            const res = await restockProduct(product.id, parseInt(qty))
                            if (res.success) {
                                   toast.success("Stock actualizado")
                                   loadData()
                            } else {
                                   toast.error(res.error || "Error al actualizar stock")
                            }
                     } catch (error) {
                            toast.error("Error de conexión")
                     }
              }
       }

       if (!isOpen) return null

       return (
              <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-200">
                     {/* HEADER */}
                     <header className="bg-background/80 backdrop-blur-xl px-4 py-4 z-40 flex items-center justify-between sticky top-0 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                   <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 bg-muted/50 hover:bg-muted rounded-full transition-colors active:scale-90">
                                          <ChevronLeft className="w-5 h-5" />
                                   </button>
                                   <div>
                                          <h1 className="font-black text-xl text-foreground leading-tight tracking-tight flex items-center gap-2">
                                                 Kiosco
                                                 <span className="text-[9px] text-white bg-gradient-to-r from-brand-blue to-teal-400 px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                                                        PRO
                                                 </span>
                                          </h1>
                                   </div>
                            </div>
                            <div className="flex items-center gap-3">
                                   <button
                                          onClick={() => setIsCreateProductOpen(true)}
                                          className="p-2 text-brand-blue bg-brand-blue/10 rounded-full hover:bg-brand-blue hover:text-white transition-all active:scale-90 shadow-sm"
                                   >
                                          <PackagePlus className="w-5 h-5" />
                                   </button>
                                   {selectedClient ? (
                                          <div className="h-9 pr-3 pl-1 bg-brand-green/10 rounded-full flex items-center gap-2 border border-brand-green/20" onClick={() => setSelectedClient(null)}>
                                                 <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-green to-emerald-400 flex items-center justify-center text-xs font-black text-white shadow-sm">
                                                        {selectedClient.name.substring(0, 2).toUpperCase()}
                                                 </div>
                                                 <span className="text-xs font-bold text-brand-green">{selectedClient.name}</span>
                                                 <X className="w-3.5 h-3.5 text-brand-green/60" />
                                          </div>
                                   ) : (
                                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-muted to-muted/80 flex items-center justify-center text-xs font-bold text-muted-foreground shadow-inner border border-border/50">
                                                 MP
                                          </div>
                                   )}
                            </div>
                     </header>

                     <main className="flex-1 overflow-y-auto pb-48 px-4 py-4 space-y-6">
                            {/* SEARCH */}
                            <div className="relative group">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-brand-blue transition-colors" />
                                   </div>
                                   <input
                                          className="block w-full pl-10 pr-10 py-3.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all shadow-sm outline-none"
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
                                          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                                                 <div className="p-2 border-b border-border text-[10px] text-gray-500 font-bold uppercase">Clientes encontrados</div>
                                                 {clients.slice(0, 3).map(c => (
                                                        <button
                                                               key={c.id}
                                                               onClick={() => {
                                                                      setSelectedClient(c)
                                                                      setClientSearch('')
                                                                      setSearchTerm('')
                                                                      setIsClientDropdownOpen(false)
                                                               }}
                                                               className="w-full text-left p-3 hover:bg-muted flex justify-between items-center"
                                                        >
                                                               <span className="text-foreground text-sm font-bold">{c.name}</span>
                                                               {c.membershipStatus === 'ACTIVE' && <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded">SOCIO</span>}
                                                        </button>
                                                 ))}
                                          </div>
                                   )}
                                   <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                          <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
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
                                                               "flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border",
                                                               selectedCategory === cat
                                                                      ? "bg-gradient-to-tr from-brand-blue to-teal-400 text-white border-transparent shadow-lg shadow-brand-blue/30 scale-[1.02]"
                                                                      : "bg-card border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95 shadow-sm"
                                                        )}
                                                 >
                                                        {cat}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* POPULAR / SEARCH RESULTS */}
                            <section>
                                   <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
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
                                                                      "bg-card p-4 rounded-3xl shadow-sm border transition-all relative overflow-hidden group",
                                                                      inCartItem ? "border-brand-blue ring-2 ring-brand-blue/20 bg-brand-blue/5" : "border-border/60 hover:border-brand-blue/40 active:scale-[0.98] cursor-pointer"
                                                               )}
                                                        >
                                                               {p.stock >= 0 && (
                                                                      <div className={cn(
                                                                             "absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm z-10 backdrop-blur-md",
                                                                             isStockLow ? "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20" : "bg-brand-green/10 text-brand-green border border-brand-green/20"
                                                                      )}>
                                                                             {p.stock} u.
                                                                      </div>
                                                               )}
                                                               <div className="h-28 w-full bg-gradient-to-br from-muted/40 to-muted/80 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 border border-white/5 dark:border-white/5 relative overflow-hidden">
                                                                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent mix-blend-overlay"></div>
                                                                      <span className="text-5xl drop-shadow-md relative z-10">{icon}</span>
                                                               </div>
                                                               <div>
                                                                      <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-1">{p.name}</h3>
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
                                                                             <div className="flex items-center justify-between mt-3">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                           <span className="font-black text-brand-blue text-lg tracking-tight">${p.price}</span>
                                                                                           <button
                                                                                                  onClick={(e) => {
                                                                                                         e.stopPropagation()
                                                                                                         handleRestock(p)
                                                                                                  }}
                                                                                                  className="text-muted-foreground hover:text-brand-blue p-1.5 active:scale-90 transition-all outline-none rounded-full hover:bg-brand-blue/10"
                                                                                                  title="Agregar stock"
                                                                                           >
                                                                                                  <PackagePlus className="w-3.5 h-3.5" />
                                                                                           </button>
                                                                                    </div>
                                                                                    <div className="h-8 w-8 rounded-full bg-brand-blue text-white shadow-md shadow-brand-blue/30 flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all">
                                                                                           <Plus className="w-4 h-4" strokeWidth={3} />
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
                                                 <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Turno Actual</h2>
                                                 <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded font-medium animate-pulse">En juego</span>
                                          </div>
                                          {activeBookings.map(booking => (
                                                 <div key={booking.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between mb-2">
                                                        <div>
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <span className="text-xs font-bold bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded">{booking.courtName}</span>
                                                                      <span className="text-xs text-muted-foreground">
                                                                             {formatInArg(booking.startTime, 'HH:mm')} - {formatInArg(booking.endTime, 'HH:mm')}
                                                                      </span>
                                                               </div>
                                                               <p className="font-medium text-sm text-foreground">{booking.clientName}</p>
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
                                                               className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-foreground transition-colors"
                                                        >
                                                               <ShoppingCart className="w-5 h-5" />
                                                        </button>
                                                 </div>
                                          ))}
                                   </section>
                            )}
                     </main>

                     {/* BOTTOM SHEET CART */}
                     <div className={cn("fixed bottom-0 left-0 right-0 z-[110] transition-transform duration-500 ease-out transform", showCheckout ? "translate-y-0" : cartCount > 0 ? "translate-y-0" : "translate-y-full")}>
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none h-[150%] -top-[50%]"></div>
                            <div className="relative bg-card/80 backdrop-blur-3xl border-t border-border/40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 pb-8 safe-area-bottom">
                                   <div className="w-14 h-1.5 bg-muted/80 rounded-full mx-auto mb-5 cursor-pointer hover:bg-muted transition-colors" onClick={() => setShowCheckout(!showCheckout)}></div>

                                   <div className="flex items-start justify-between mb-5">
                                          <div className="flex flex-col">
                                                 <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-1.5">
                                                        Mi Carrito <span className="ml-1.5 bg-brand-blue text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm shadow-brand-blue/30">{cartCount}</span>
                                                 </span>
                                                 <div className={cn("text-xs text-muted-foreground font-medium space-y-1.5 transition-all duration-300", !showCheckout ? "max-h-12 overflow-hidden" : "max-h-48 overflow-y-auto custom-scrollbar pr-2")}>
                                                        {cart.map(i => (
                                                               <div key={i.id} className="flex items-center gap-2">
                                                                      <span className="w-4 text-gray-500 text-[10px]">{i.quantity}x</span>
                                                                      <span>{i.name}</span>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                          <div className="text-right flex flex-col items-end">
                                                 <span className="block text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-0.5">Total</span>
                                                 <span className="text-3xl font-black text-brand-green tracking-tighter drop-shadow-sm">${total.toLocaleString()}</span>
                                          </div>
                                   </div>

                                   {!showCheckout ? (
                                          <button
                                                 onClick={() => setShowCheckout(true)}
                                                 className="w-full bg-gradient-to-r from-brand-blue to-teal-400 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-white/10"
                                          >
                                                 <span>CONFIRMAR COBRO</span>
                                                 <Banknote className="w-6 h-6" />
                                          </button>
                                   ) : (
                                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pb-safe">
                                                 <div className="grid grid-cols-3 gap-3">
                                                        <button onClick={() => setSelectedMethod('CASH')} className={cn("p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all", selectedMethod === 'CASH' ? "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-sm" : "bg-card border-border/50 text-muted-foreground hover:bg-muted/50")}>
                                                               <Banknote className="w-5 h-5" /> Efectivo
                                                        </button>
                                                        <button onClick={() => setSelectedMethod('TRANSFER')} className={cn("p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all", selectedMethod === 'TRANSFER' ? "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-sm" : "bg-card border-border/50 text-muted-foreground hover:bg-muted/50")}>
                                                               <CreditCard className="w-5 h-5" /> Transf.
                                                        </button>
                                                        {allowCredit && (
                                                               <button disabled={!selectedClient} onClick={() => setSelectedMethod('ACCOUNT')} className={cn("p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all", selectedMethod === 'ACCOUNT' ? "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-sm" : "bg-card border-border/50 text-muted-foreground hover:bg-muted/50", !selectedClient && "opacity-40 cursor-not-allowed")}>
                                                                      <Clock className="w-5 h-5" /> A Cuenta
                                                               </button>
                                                        )}
                                                 </div>
                                                 <button
                                                        onClick={handleFinalize}
                                                        disabled={processing}
                                                        className="w-full bg-gradient-to-r from-brand-green to-emerald-400 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-brand-green/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                                 >
                                                        {processing ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : 'FINALIZAR VENTA'}
                                                 </button>
                                          </div>
                                   )}

                                   <div className="mt-3 text-center">
                                          <button
                                                 onClick={() => setShowCheckout(!showCheckout)}
                                                 className="text-xs text-gray-500 underline decoration-dotted hover:text-foreground"
                                          >
                                                 {showCheckout ? 'Cancelar Cobro' : 'Ver detalle'}
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* --- SUCCESS OVERLAY --- */}
                     {showSuccess && <KioscoSuccessOverlay onReset={resetSale} />}

                     {/* CREATE PRODUCT MODAL */}
                     {isCreateProductOpen && (
                            <div className="absolute inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                                   <div className="bg-card w-full max-w-sm rounded-2xl border border-border overflow-hidden shadow-2xl">
                                          <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
                                                 <h3 className="font-bold text-foreground flex items-center gap-2">
                                                        <PackagePlus className="w-5 h-5 text-brand-blue" />
                                                        Nuevo Producto
                                                 </h3>
                                                 <button onClick={() => setIsCreateProductOpen(false)} className="bg-black/20 text-foreground/50 hover:text-foreground p-1 rounded-full"><X className="w-5 h-5" /></button>
                                          </div>
                                          <div className="p-4 space-y-4">
                                                 <div>
                                                        <label className="text-xs text-text-grey font-bold block mb-1">Nombre</label>
                                                        <input
                                                               value={newProduct.name}
                                                               onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                               className="w-full bg-background border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-brand-blue"
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
                                                                      className="w-full bg-background border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-brand-blue"
                                                                      placeholder="$0"
                                                               />
                                                        </div>
                                                        <div>
                                                               <label className="text-xs text-text-grey font-bold block mb-1">Costo (Opcional)</label>
                                                               <input
                                                                      type="number"
                                                                      value={newProduct.cost}
                                                                      onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })}
                                                                      className="w-full bg-background border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-brand-blue"
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
                                                                      className="w-full bg-background border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-brand-blue"
                                                                      placeholder="0"
                                                               />
                                                        </div>
                                                        <div>
                                                               <label className="text-xs text-text-grey font-bold block mb-1">Categoría</label>
                                                               <select
                                                                      value={newProduct.category}
                                                                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                                      className="w-full bg-background border border-border rounded-lg p-2 text-foreground text-sm outline-none focus:border-brand-blue"
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
                                                        className="w-full bg-brand-green text-background font-bold py-3 rounded-xl hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2 mt-2"
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
