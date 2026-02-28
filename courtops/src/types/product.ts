export type Product = {
       id?: number
       name: string
       category: string
       cost: number
       price: number
       memberPrice?: number | null
       stock: number
       minStock?: number
       imageUrl?: string | null
       isActive?: boolean
       clubId?: string
}
