import { useState, useEffect, useMemo, useCallback } from 'react'
import { getProducts, processSale, SaleItem, Payment } from '@/actions/kiosco'
import { getClubSettings } from '@/actions/dashboard'
import { getClients } from '@/actions/clients'
import { toast } from 'sonner'
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
                                          setClients(res.data)
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
                                   toast.warning("Stock insuficiente")
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

              toast.success(`${product.name} +1`, { duration: 800, position: 'bottom-center' })
       }

       const updateQuantity = (id: number, delta: number) => {
              setCart(prev => prev.map(p => {
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
              }))
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

                     toast.success("Venta realizada con éxito")
                     setCart([])
                     setSelectedClient(null)
                     refresh()
                     return true
              } catch (error: unknown) {
                     toast.error("Error: " + (error instanceof Error ? error.message : 'Unknown error'))
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
