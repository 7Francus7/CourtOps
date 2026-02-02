/**
 * Ultra-safe serializer for Next.js 16 Server Actions
 * Handles: Dates, BigInt, undefined, circular references, etc.
 */
export function ultraSafeSerialize<T>(data: T): T {
       return JSON.parse(
              JSON.stringify(data, (key, value) => {
                     // Convert Date objects to ISO strings
                     if (value instanceof Date) {
                            return value.toISOString()
                     }

                     // Convert BigInt to string
                     if (typeof value === 'bigint') {
                            return value.toString()
                     }

                     // Convert undefined to null
                     if (value === undefined) {
                            return null
                     }

                     // Remove functions
                     if (typeof value === 'function') {
                            return undefined
                     }

                     return value
              })
       )
}

/**
 * Clean Prisma objects by removing internal fields
 */
export function cleanPrismaObject<T extends Record<string, any>>(obj: T): T {
       if (!obj || typeof obj !== 'object') return obj

       const cleaned: any = Array.isArray(obj) ? [] : {}

       for (const key in obj) {
              // Skip Prisma internal fields
              if (key.startsWith('_') || key.startsWith('$')) {
                     continue
              }

              const value: any = obj[key]

              if (value !== null && typeof value === 'object' && value instanceof Date) {
                     cleaned[key] = value.toISOString()
              } else if (Array.isArray(value)) {
                     cleaned[key] = value.map((item: any) =>
                            typeof item === 'object' ? cleanPrismaObject(item) : item
                     )
              } else if (value !== null && typeof value === 'object') {
                     cleaned[key] = cleanPrismaObject(value)
              } else {
                     cleaned[key] = value
              }
       }

       return cleaned as T
}
