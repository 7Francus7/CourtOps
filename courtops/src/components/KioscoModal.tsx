'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { getProducts, processSale, SaleItem, Payment } from '@/actions/kiosco'
import { getClients } from '@/actions/clients'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

export default function KioscoModal({ isOpen, onClose }: Props) {
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
                                          toast.warning("Stock máximo alcanzado")
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
              if (confirm("¿Seguro que deseas vaciar el carrito?")) {
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
                     setShowSuccess(true)
                     toast.success("Venta realizada con éxito")
                     loadProducts()
              } catch (error: any) {
                     toast.error("Error: " + error.message)
              } finally {
                     setProcessing(false)
              }
       }

       if (!isOpen) return null

       return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
                     <div className="bg-[#111418] border-0 sm:border border-white/10 w-full max-w-7xl h-full sm:h-[90vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row animate-in zoom-in-95 duration-300 relative">

                            {/* --- Left: Product Browser --- */}
                            <div className="flex-1 flex flex-col min-w-0 bg-[#0B0D10]/40 border-r border-white/5">

                                   {/* Search & Header */}
                                   <div className="p-8 border-b border-white/5 space-y-6">
                                          <div className="flex justify-between items-center">
                                                 <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-brand-blue/20 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-brand-blue/20">
                                                               🏪
                                                        </div>
                                                        <div>
                                                               <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Market POS <span className="text-brand-blue opacity-30 text-xs font-mono ml-2">PRO</span></h2>
                                                               <div className="flex items-center gap-2 mt-2">
                                                                      {selectedClient ? (
                                                                             <div className="flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 px-3 py-1 rounded-full">
                                                                                    <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                                                                                    <span className="text-[10px] text-brand-green font-black uppercase">{selectedClient.name}</span>
                                                                                    <button onClick={() => setSelectedClient(null)} className="text-[10px] text-white/30 hover:text-white ml-2">✕</button>
                                                                             </div>
                                                                      ) : (
                                                                             <span className="text-[10px] text-white/20 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Consumidor Final</span>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <button onClick={onClose} className="sm:hidden text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full">✕</button>
                                          </div>

                                          <div className="flex flex-col sm:flex-row gap-4">
                                                 <div className="relative flex-1">
                                                        <input
                                                               type="text"
                                                               placeholder="Escribir nombre, bebida, pelota..."
                                                               className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-medium outline-none focus:border-brand-blue focus:ring-2 ring-brand-blue/10 transition-all placeholder:text-white/20"
                                                               value={searchTerm}
                                                               onChange={e => setSearchTerm(e.target.value)}
                                                        />
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-lg">🔍</span>
                                                 </div>

                                                 <div className="relative w-full sm:w-80 group">
                                                        <input
                                                               type="text"
                                                               placeholder="Buscar Cliente (Nombre/Tel)..."
                                                               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-brand-green transition-all"
                                                               value={clientSearch}
                                                               onChange={e => setClientSearch(e.target.value)}
                                                        />
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">👥</span>

                                                        {isClientDropdownOpen && clients.length > 0 && (
                                                               <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-4">
                                                                      {clients.slice(0, 5).map(c => (
                                                                             <button
                                                                                    key={c.id}
                                                                                    onClick={() => {
                                                                                           setSelectedClient(c)
                                                                                           setClientSearch('')
                                                                                           setIsClientDropdownOpen(false)
                                                                                    }}
                                                                                    className="w-full p-5 hover:bg-white/5 text-left border-b border-white/5 last:border-0 transition-colors flex justify-between items-center"
                                                                             >
                                                                                    <div>
                                                                                           <p className="text-sm font-bold text-white">{c.name}</p>
                                                                                           <p className="text-[10px] text-white/30 font-mono tracking-tighter">{c.phone}</p>
                                                                                    </div>
                                                                                    {c.membershipStatus === 'ACTIVE' && (
                                                                                           <span className="text-[8px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full font-black">SOCIO</span>
                                                                                    )}
                                                                             </button>
                                                                      ))}
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>

                                          {/* Quick Access Tiles */}
                                          {!searchTerm && selectedCategory === 'Todos' && quickAccessProducts.length > 0 && (
                                                 <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                                        {quickAccessProducts.map(p => (
                                                               <button
                                                                      key={p.id}
                                                                      onClick={() => addToCart(p)}
                                                                      className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                                                               >
                                                                      <span className="text-xl opacity-50">⚡</span>
                                                                      <div className="text-left">
                                                                             <p className="text-[10px] font-black text-white leading-none truncate w-24">{p.name}</p>
                                                                             <p className="text-[8px] font-mono text-brand-green font-black mt-1">${p.price}</p>
                                                                      </div>
                                                               </button>
                                                        ))}
                                                 </div>
                                          )}

                                          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar-all">
                                                 {categories.map(cat => (
                                                        <button
                                                               key={cat}
                                                               onClick={() => setSelectedCategory(cat)}
                                                               className={cn(
                                                                      "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border",
                                                                      selectedCategory === cat
                                                                             ? "bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/20 -translate-y-1"
                                                                             : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                                                               )}
                                                        >
                                                               {cat}
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Products Matrix */}
                                   <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 custom-scrollbar bg-black/20">
                                          {loading ? (
                                                 <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
                                                        <div className="w-16 h-16 border-4 border-white/10 border-t-brand-blue rounded-full animate-spin mb-6" />
                                                        <p className="font-black uppercase tracking-[0.4em] text-xs">Sincronizando Inventario</p>
                                                 </div>
                                          ) : filteredProducts.length === 0 ? (
                                                 <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20 text-center animate-in scale-95 transition-all">
                                                        <span className="text-8xl mb-6">📦</span>
                                                        <p className="font-black uppercase tracking-widest text-sm max-w-xs leading-relaxed">No encontramos lo que buscas por aquí</p>
                                                 </div>
                                          ) : filteredProducts.map(p => {
                                                 const isMember = selectedClient?.membershipStatus === 'ACTIVE'
                                                 const hasDiscount = isMember && p.memberPrice && p.memberPrice < p.price

                                                 return (
                                                        <button
                                                               key={p.id}
                                                               onClick={() => addToCart(p)}
                                                               disabled={p.stock === 0}
                                                               className={cn(
                                                                      "group relative flex flex-col bg-[#1A1F25]/40 border border-white/5 rounded-3xl p-5 transition-all hover:scale-[1.05] active:scale-95 text-left hover:border-brand-blue/40 hover:bg-zinc-800/80 shadow-lg",
                                                                      p.stock === 0 && "opacity-40 grayscale cursor-not-allowed"
                                                               )}
                                                        >
                                                               <div className="aspect-square bg-black/40 rounded-2xl mb-4 flex items-center justify-center text-4xl group-hover:bg-brand-blue/20 transition-all relative shadow-inner overflow-hidden border border-white/5">
                                                                      {p.category.toLowerCase().includes('bebida') ? '🥤' : p.category.toLowerCase().includes('snack') ? '🍟' : '🎾'}
                                                                      {hasDiscount && (
                                                                             <div className="absolute -top-1 -right-1 bg-brand-green text-bg-dark text-[8px] font-black px-2 py-1 rounded-bl-xl shadow-xl z-20">
                                                                                    MEMBER OFF
                                                                             </div>
                                                                      )}
                                                                      {p.stock <= 5 && p.stock > 0 && (
                                                                             <span className="absolute top-2 left-2 bg-orange-500/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-pulse">STOCK CRÍTICO</span>
                                                                      )}
                                                               </div>
                                                               <div className="flex-1">
                                                                      <h3 className="text-white/90 font-bold text-sm tracking-tight leading-snug h-10 line-clamp-2">{p.name}</h3>
                                                                      <div className="mt-4 flex flex-col justify-end">
                                                                             {hasDiscount ? (
                                                                                    <div className="flex items-center gap-2">
                                                                                           <span className="text-brand-green font-mono font-black text-xl">${p.memberPrice}</span>
                                                                                           <span className="text-[10px] text-white/20 line-through font-bold">${p.price}</span>
                                                                                    </div>
                                                                             ) : (
                                                                                    <span className="text-brand-green font-mono font-black text-xl">${p.price}</span>
                                                                             )}
                                                                             <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter mt-1">Stock: {p.stock} unid.</span>
                                                                      </div>
                                                               </div>
                                                               <div className="absolute inset-0 rounded-3xl border-2 border-brand-blue/0 group-hover:border-brand-blue/30 transition-all pointer-events-none" />
                                                        </button>
                                                 )
                                          })}
                                   </div>
                            </div>

                            {/* --- Right: Smart Cart Sidebar --- */}
                            <div className="w-full sm:w-[440px] bg-[#111418] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] z-10 border-l border-white/5">
                                   <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                          <div className="flex flex-col">
                                                 <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Checkpoint</span>
                                                 <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                                                        MI CARRITO
                                                        <span className="bg-brand-blue text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg shadow-brand-blue/30">
                                                               {cartCount}
                                                        </span>
                                                 </h3>
                                          </div>
                                          <div className="flex gap-2">
                                                 <button
                                                        onClick={clearCart}
                                                        disabled={cart.length === 0}
                                                        className="text-white/20 hover:text-red-400 transition-colors p-4 rounded-2xl hover:bg-red-500/10 border border-white/5 active:scale-90"
                                                 >
                                                        🗑️
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Cart Items Matrix */}
                                   <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                          {cart.length === 0 ? (
                                                 <div className="flex flex-col items-center justify-center h-full opacity-5 group py-20 translate-y-[-20%]">
                                                        <span className="text-[12rem] mb-6 group-hover:rotate-12 transition-transform duration-700">🛒</span>
                                                        <p className="font-black uppercase tracking-[0.4em] text-xs">Ready to scan products</p>
                                                 </div>
                                          ) : (
                                                 cart.map(item => (
                                                        <div key={item.id} className="group relative flex items-center gap-5 bg-white/[0.02] p-5 rounded-[2rem] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all animate-in slide-in-from-right-8">
                                                               <div className="w-14 h-14 rounded-2xl bg-black/60 flex items-center justify-center text-3xl shrink-0 shadow-xl border border-white/5 relative">
                                                                      {item.category.toLowerCase().includes('bebida') ? '🥤' : '🎾'}
                                                                      <span className="absolute -top-2 -left-2 w-6 h-6 bg-brand-blue text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#111418]">
                                                                             {item.quantity}
                                                                      </span>
                                                               </div>
                                                               <div className="flex-1 min-w-0">
                                                                      <p className="text-white font-bold text-sm truncate tracking-tight uppercase leading-tight">{item.name}</p>
                                                                      <div className="flex items-center gap-3 mt-1.5">
                                                                             <span className="text-brand-green font-mono text-sm font-black">${item.appliedPrice}</span>
                                                                             {item.appliedPrice < item.price && (
                                                                                    <span className="text-[9px] text-brand-blue font-black tracking-widest bg-brand-blue/10 px-2 py-0.5 rounded-full">Socio Off</span>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                               <div className="flex flex-col items-end gap-2">
                                                                      <div className="flex items-center gap-1 bg-black/50 rounded-xl p-1 border border-white/5 shadow-inner">
                                                                             <button
                                                                                    onClick={() => updateQuantity(item.id, -1)}
                                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white font-black hover:scale-110 active:scale-95 transition-all"
                                                                             >
                                                                                    -
                                                                             </button>
                                                                             <button
                                                                                    onClick={() => updateQuantity(item.id, 1)}
                                                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white font-black hover:scale-110 active:scale-95 transition-all"
                                                                             >
                                                                                    +
                                                                             </button>
                                                                      </div>
                                                                      <button
                                                                             onClick={() => removeFromCart(item.id)}
                                                                             className="text-[10px] text-red-500/40 hover:text-red-500 font-black uppercase tracking-widest px-2"
                                                                      >
                                                                             Eliminar
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ))
                                          )}
                                   </div>

                                   {/* Smart POS Control Panel */}
                                   <div className="p-10 bg-[#0B0D10] border-t border-white/10 space-y-8 shadow-[0_-30px_60px_rgba(0,0,0,0.6)] rounded-t-[3rem]">
                                          <div className="space-y-4">
                                                 <div className="flex justify-between items-center opacity-40">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Items Subtotal</span>
                                                        <span className="text-lg font-mono font-bold">${total.toLocaleString('es-AR')}</span>
                                                 </div>
                                                 <div className="h-px bg-white/5 w-full" />
                                                 <div className="flex flex-col gap-1 items-end pt-2">
                                                        <span className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Monto Neto a Cobrar</span>
                                                        <span className="text-6xl font-black text-brand-green tracking-tighter drop-shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
                                                               ${total.toLocaleString('es-AR')}
                                                        </span>
                                                 </div>
                                          </div>

                                          <div className="pt-2">
                                                 <button
                                                        onClick={() => setShowCheckout(true)}
                                                        disabled={cart.length === 0 || processing}
                                                        className="w-full bg-brand-blue text-white py-8 rounded-[2.5rem] font-black text-base uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-[1.03] active:scale-98 hover:bg-brand-blue-secondary transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-6 group relative overflow-hidden"
                                                 >
                                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                        <span className="relative">Confirmar Venta</span>
                                                        <span className="text-3xl relative group-hover:translate-x-3 transition-transform">💵</span>
                                                 </button>
                                          </div>
                                   </div>
                            </div>

                            {/* --- CHECKOUT OVERLAY --- */}
                            {showCheckout && (
                                   <div className="absolute inset-0 z-[120] bg-[#0B0D10]/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in zoom-in-105 duration-300">
                                          <div className="bg-[#111418] border border-white/10 w-full max-w-2xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col sm:flex-row h-[90vh] sm:h-auto border border-white/10">

                                                 <div className="flex-1 bg-white/[0.02] p-10 border-r border-white/5 space-y-10 flex flex-col">
                                                        <div>
                                                               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 block">Manifest</span>
                                                               <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">RESUMEN</h3>
                                                               <div className="space-y-5 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                                                      {cart.map(i => (
                                                                             <div key={i.id} className="flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                                                                                    <span className="text-xs text-white font-bold">{i.quantity}x {i.name}</span>
                                                                                    <span className="text-xs font-mono font-black">${i.appliedPrice * i.quantity}</span>
                                                                             </div>
                                                                      ))}
                                                               </div>
                                                        </div>

                                                        <div className="mt-auto pt-10 border-t border-white/10 space-y-6">
                                                               <div className="flex justify-between items-end">
                                                                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Saldo de Compra</span>
                                                                      <span className="text-5xl font-black text-white tracking-tighter">${total}</span>
                                                               </div>

                                                               {paymentLines.length > 0 && (
                                                                      <div className="bg-white/5 rounded-3xl p-6 space-y-3 border border-white/5 shadow-inner">
                                                                             <p className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-2">Asignaciones:</p>
                                                                             {paymentLines.map((p, idx) => (
                                                                                    <div key={idx} className="flex justify-between items-center text-xs font-bold bg-black/40 p-3 rounded-xl border border-white/5">
                                                                                           <span className="text-white/40 uppercase tracking-tighter">{p.method === 'ACCOUNT' ? 'A Cuenta' : p.method === 'CASH' ? 'Efectivo' : p.method}</span>
                                                                                           <div className="flex items-center gap-3">
                                                                                                  <span className="text-white font-mono font-black">${p.amount}</span>
                                                                                                  <button onClick={() => removePaymentLine(idx)} className="text-red-500 hover:scale-125 transition-transform p-1">✕</button>
                                                                                           </div>
                                                                                    </div>
                                                                             ))}
                                                                             <div className="pt-4 flex justify-between text-sm font-black border-t border-white/10 mt-4">
                                                                                    <span className="text-white/20 uppercase tracking-widest text-[10px]">Restante:</span>
                                                                                    <span className={cn("font-mono text-xl", pendingToPay <= 0 ? "text-brand-green" : "text-white")}>${pendingToPay}</span>
                                                                             </div>
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>

                                                 <div className="flex-1 p-10 space-y-10 bg-[#111418] overflow-y-auto">
                                                        <div className="flex justify-between items-center">
                                                               <h3 className="text-xl font-black text-white tracking-tighter uppercase">Asignar Pago</h3>
                                                               <button onClick={() => setShowCheckout(false)} className="text-white/20 hover:text-white transition-all text-sm font-black border border-white/5 px-4 py-2 rounded-xl">Cerrar</button>
                                                        </div>

                                                        <div className="space-y-8">
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      {[
                                                                             { id: 'CASH', label: 'Efectivo', icon: '💵' },
                                                                             { id: 'TRANSFER', label: 'Transf.', icon: '🏦' },
                                                                             { id: 'CREDIT', label: 'Deb/Cred', icon: '💳' },
                                                                             { id: 'ACCOUNT', label: 'A Cuenta', icon: '📝', reqClient: true }
                                                                      ].map(m => (
                                                                             <button
                                                                                    key={m.id}
                                                                                    onClick={() => setSelectedMethod(m.id)}
                                                                                    disabled={m.reqClient && !selectedClient}
                                                                                    className={cn(
                                                                                           "p-5 rounded-[2rem] border font-black text-[9px] uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-3 relative shadow-sm",
                                                                                           selectedMethod === m.id
                                                                                                  ? "bg-brand-blue/20 border-brand-blue text-brand-blue shadow-[0_10px_30px_rgba(59,130,246,0.2)] scale-105"
                                                                                                  : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10",
                                                                                           m.reqClient && !selectedClient && "opacity-20 grayscale"
                                                                                    )}
                                                                             >
                                                                                    <span className="text-3xl">{m.icon}</span>
                                                                                    {m.label}
                                                                                    {m.reqClient && !selectedClient && (
                                                                                           <span className="absolute -top-3 bg-zinc-900 border border-white/10 text-[6px] px-2 py-1 rounded-full z-10 shadow-xl">Precisa Cliente</span>
                                                                                    )}
                                                                             </button>
                                                                      ))}
                                                               </div>

                                                               <div className="space-y-5">
                                                                      <div className="space-y-3">
                                                                             <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-2">Asignar Monto</label>
                                                                             <div className="relative group">
                                                                                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 font-mono text-3xl font-black group-focus-within:text-brand-green transition-all">$</span>
                                                                                    <input
                                                                                           type="number"
                                                                                           autoFocus
                                                                                           className="w-full bg-black/80 border border-white/10 rounded-[2.5rem] p-8 pl-14 text-white font-mono text-4xl font-black outline-none focus:border-brand-green transition-all shadow-inner placeholder:text-white/5"
                                                                                           placeholder={pendingToPay.toString()}
                                                                                           value={receivedAmount}
                                                                                           onChange={e => setReceivedAmount(e.target.value)}
                                                                                    />
                                                                             </div>
                                                                      </div>

                                                                      {selectedMethod === 'CASH' && parseFloat(receivedAmount) > pendingToPay && (
                                                                             <div className="p-6 rounded-3xl bg-brand-green/10 border border-brand-green/20 flex justify-between items-center animate-in zoom-in-95 rotate-1">
                                                                                    <span className="font-black text-brand-green uppercase tracking-[0.2em] text-[10px]">Entregar Vuelto:</span>
                                                                                    <span className="text-3xl font-mono font-black text-brand-green tracking-tighter">
                                                                                           ${change}
                                                                                    </span>
                                                                             </div>
                                                                      )}

                                                                      <div className="flex flex-col gap-4 pt-4">
                                                                             {pendingToPay > 0 && (
                                                                                    <button
                                                                                           onClick={() => addPaymentLine(selectedMethod, parseFloat(receivedAmount) || pendingToPay)}
                                                                                           className="bg-white/5 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all border border-white/5 shadow-lg active:scale-95"
                                                                                    >
                                                                                           Añadir Parte del Pago
                                                                                    </button>
                                                                             )}
                                                                             <button
                                                                                    onClick={handleFinalize}
                                                                                    disabled={processing || pendingToPay > 0}
                                                                                    className="bg-brand-green text-bg-dark py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(34,197,94,0.3)] hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                                                                             >
                                                                                    {processing ? 'Finalizando...' : 'Completar Venta'}
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            )}

                            {/* --- GLOBAL SUCCESS SCREEN --- */}
                            {showSuccess && (
                                   <div className="absolute inset-0 z-[300] bg-[#0B0D10]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
                                          <div className="text-center space-y-10 max-w-sm">
                                                 <div className="relative group">
                                                        <div className="w-32 h-32 bg-brand-green/20 rounded-full flex items-center justify-center text-6xl mx-auto shadow-[0_0_100px_rgba(34,197,94,0.4)] border border-brand-green/30 animate-in zoom-in duration-700 bounce-in">
                                                               ✨
                                                        </div>
                                                        <div className="absolute inset-0 rounded-full animate-ping bg-brand-green/10 -z-10" />
                                                 </div>
                                                 <div className="space-y-4">
                                                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Venta Exitosa</h2>
                                                        <p className="text-white/30 font-bold text-sm tracking-[0.1em] uppercase">Transacción autorizada y registrada</p>
                                                 </div>

                                                 <div className="grid grid-cols-1 gap-5 pt-8 w-full">
                                                        <button
                                                               onClick={() => {
                                                                      const phone = selectedClient?.phone?.replace(/\D/g, '')
                                                                      if (phone) window.open(`https://wa.me/${phone}?text=Hola+${selectedClient?.name},+tu+compra+por+$${total}+en+MarketPadel+fue+registrada.+¡Muchas+Gracias!`, '_blank')
                                                                      else toast.info("No hay cliente activo")
                                                               }}
                                                               className="w-full py-6 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-4 group shadow-xl active:scale-95"
                                                        >
                                                               <span className="text-2xl group-hover:scale-125 transition-transform duration-500">📱</span> WhatsApp Ticket
                                                        </button>
                                                        <button
                                                               onClick={resetSale}
                                                               className="w-full py-8 rounded-[2.5rem] bg-brand-green text-bg-dark font-black text-base uppercase tracking-[0.3em] hover:bg-brand-green-variant transition-all shadow-[0_30px_70px_rgba(34,197,94,0.3)] active:scale-95"
                                                        >
                                                               Siguiente Venta
                                                        </button>
                                                        <button
                                                               onClick={onClose}
                                                               className="w-full py-4 text-white/20 font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-colors mt-4"
                                                        >
                                                               Salir de POS [ESC]
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            )}

                     </div>
              </div>
       )
}
