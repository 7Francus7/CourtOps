import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Product } from '../types/product'

type Props = {
       initialData?: Product | null
       onSave: (product: Product) => void
       isOpen: boolean
}

export function useProductForm({ initialData, onSave, isOpen }: Props) {
       const [formData, setFormData] = useState<Product>({
              name: '',
              category: 'Bebidas',
              cost: 0,
              price: 0,
              memberPrice: null,
              stock: 0,
              minStock: 5,
              imageUrl: null
       })

       const [suggestedImages, setSuggestedImages] = useState<string[]>([])
       const [isSearchingImage, setIsSearchingImage] = useState(false)

       useEffect(() => {
              if (initialData) {
                     setFormData(initialData)
              } else {
                     setFormData({
                            name: '',
                            category: 'Bebidas',
                            cost: 0,
                            price: 0,
                            memberPrice: null,
                            stock: 0,
                            minStock: 5,
                            imageUrl: null
                     })
              }
       }, [initialData, isOpen])

       const searchImages = async () => {
              if (!formData.name) {
                     toast.error("Escribe el nombre del producto primero")
                     return
              }
              setIsSearchingImage(true)
              try {
                     const res = await fetch(`/api/images/search?q=${encodeURIComponent(formData.name)}`)
                     const data = await res.json()
                     if (data.images && data.images.length > 0) {
                            setSuggestedImages(data.images)
                            if (!formData.imageUrl) setFormData((p: Product) => ({ ...p, imageUrl: data.images[0] }))
                            toast.success("¡Imágenes encontradas!")
                     } else {
                            toast.error("No se encontraron imágenes")
                     }
              } catch (err) {
                     toast.error("Error al buscar imágenes")
              } finally {
                     setIsSearchingImage(false)
              }
       }

       const handleSubmit = (e?: React.FormEvent) => {
              if (e) e.preventDefault()
              onSave(formData)
       }

       const updateField = (field: keyof Product, value: any) => {
              setFormData((prev: Product) => ({ ...prev, [field]: value }))
       }

       return {
              formData,
              setFormData,
              updateField,
              suggestedImages,
              setSuggestedImages,
              isSearchingImage,
              searchImages,
              handleSubmit
       }
}
