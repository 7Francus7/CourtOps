import { useState, useEffect, useMemo, useCallback } from 'react'
import { getProducts, processSale, SaleItem, Payment } from '@/actions/kiosco'
import { getClubSettings } from '@/actions/dashboard'
import { getClients } from '@/actions/clients'
import { t } from '@/lib/toast'
import { Product, CartItem, Client } from '../components/kiosco/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useKiosk() {
       const queryClient = useQueryClient()

       const { data: products = [], isLoading: loading } = useQuery<Product[]>({
              queryKey: ['kiosco-products'],
              queryFn: async () => {
                     const res = await getProducts()
                     return res.success ? (res as { success: true; data: Product[] }).data : []
              },
              staleTime: 60000,
       })

       const { data: clubSettings } = useQuery({
              queryKey: ['club-settings'],
              queryFn: () => getClubSettings(),
              staleTime: 300000,
       })

       const [cart, setCart] = useState<CartItem[]>([])
       const [processing, setProcessing] = useState(false)
       const [searchTerm, setSearchTerm] = useState('')
       const [selectedCategory, setSelectedCategory] = useState('Todos')
       const [selectedClient, setSelectedClient] = useState<Client | null>(null)
       const [clientSearch, setClientSearch] = useState('')
       const [clients, setClients] = useState<Client[]>([])
       const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)

       const allowCredit = clubSettings?.allowCredit ?? true
       const [suggestedProduct, setSuggestedProduct] = useState<Product | null>(null)

       const refresh = useCallback(() => {
              queryClient.invalidateQueries({ queryKey: ['kiosco-products'] })
       }, [queryClient])

       useEffect(() => {
              const timer = setTimeout(() => {
                     if (clientSearch.length >= 2) {
                            getClients(clientSearch).then((res: { success: boolean; data?: Client[] }) => {
                                   if (res.success) {
                                          setClients(res.data || [])
                                          setIsClientDropdownOpen(true)
                                   }
                            })
                     } else {
                            setIsClientDropdownOpen(false)
                     }
              }, 300)
              return () => clearTimeout(timer)
       }, [clientSearch])

       useEffect(() => {
              setCart(prev => prev.map(item => ({
                     ...item,
                     appliedPrice: (selectedClient?.membershipStatus === 'ACTIVE' && item.memberPrice) ? item.memberPrice : item.price
              })))
       }, [selectedClient])

       const addToCart = (product: Product) => {
              const appliedPrice = (selectedClient?.membershipStatus === 'ACTIVE' && product.memberPrice) ? product.memberPrice : product.price

              setCart(prev => {
                     const existing = prev.find(p => p.id === product.id)
                     if (existing) {
                            if (existing.quantity + 1 > product.stock) {
                                   t.sale.stockWarning()
                                   return prev
                            }
                            return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1, appliedPrice } : p)
                     }
                     return [...prev, { ...product, quantity: 1, appliedPrice }]
              })

              if (product.category === 'Bebidas') {
                     const snack = products.find(p => p.category === 'Snacks' && p.stock > 0 && !cart.some(c => c.id === p.id))
                     if (snack) setSuggestedProduct(snack)
              } else if (product.category === 'Pelotas') {
                     const acc = products.find(p => p.category === 'Accesorios' && p.stock > 0 && !cart.some(c => c.id === p.id))
                     if (acc) setSuggestedProduct(acc)
              }

              t.sale.quickAdd(product.name)
       }

       const updateQuantity = (id: number, delta: number) => {
              setCart(prev => {
                     const updated = prev.map(p => {
                            if (p.id === id) {
                                   const newQty = p.quantity + delta
                                   if (newQty > p.stock) {
                                          t.sale.stockMax()
                                          return p
                                   }
                                   return { ...p, quantity: newQty }
                            }
                            return p
                     })
                     return updated.filter(p => p.quantity > 0)
              })
       }

       const handleFinalizeSale = async (payments: Payment[]) => {
              setProcessing(true)
              try {
                     const saleItems: SaleItem[] = cart.map(i => ({
                            productId: i.id,
                            quantity: i.quantity,
                            price: i.appliedPrice
                     }))
                     const res = await processSale(saleItems, payments, selectedClient?.id || undefined)
                     if (!res.success) throw new Error(res.error)

                     t.sale.completed(cart.reduce((s, i) => s + i.appliedPrice * i.quantity, 0))
                     setCart([])
                     setSelectedClient(null)
                     refresh()
                     return true
              } catch (error: unknown) {
                     t.fail('Error al procesar venta', error instanceof Error ? error.message : undefined)
                     return false
              } finally {
                     setProcessing(false)
              }
       }

       const filteredProducts = useMemo(() => {
              return products.filter(p => {
                     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
                     const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory
                     return matchesSearch && matchesCat
              })
       }, [products, searchTerm, selectedCategory])

       const categories = useMemo(() => {
              const cats = new Set(products.map(p => p.category))
              return ['Todos', ...Array.from(cats)]
       }, [products])

       const cartTotal = cart.reduce((sum, item) => sum + (item.appliedPrice * item.quantity), 0)

       return {
              products,
              loading,
              cart,
              setCart,
              addToCart,
              updateQuantity,
              cartTotal,
              searchTerm,
              setSearchTerm,
              selectedCategory,
              setSelectedCategory,
              categories,
              filteredProducts,
              selectedClient,
              setSelectedClient,
              clientSearch,
              setClientSearch,
              clients,
              isClientDropdownOpen,
              setIsClientDropdownOpen,
              processing,
              handleFinalizeSale,
              allowCredit,
              suggestedProduct,
              setSuggestedProduct,
              refresh
       }
}
