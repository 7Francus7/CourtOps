export type Product = {
       id: number
       name: string
       price: number
       memberPrice?: number | null
       stock: number
       category: string
}

export type CartItem = Product & { quantity: number; appliedPrice: number }

export type Client = {
       id: number
       name: string
       phone: string
       membershipStatus?: string
}
