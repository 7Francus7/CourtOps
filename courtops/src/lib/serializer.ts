
/**
 * Ultra-safe serializer for Next.js 16 Server Actions
 * Handles: Dates, BigInt, Decimal, undefined, circular references, etc.
 * 
 * Replaces JSON.parse(JSON.stringify()) with a robust recursive traversal
 */

export function ultraSafeSerialize<T>(data: T): T {
       return serializeRecursive(data, new WeakSet())
}

function serializeRecursive(value: any, visited: WeakSet<any>): any {
       // Primitives
       if (value === null || value === undefined) {
              return null
       }

       if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              return value
       }

       if (typeof value === 'bigint') {
              return value.toString()
       }

       if (typeof value === 'function') {
              return undefined // Functions cannot be serialized
       }

       if (typeof value === 'symbol') {
              return value.toString()
       }

       // Objects
       if (typeof value === 'object') {
              // Dates
              if (value instanceof Date) {
                     return value.toISOString()
              }

              // Decimal (Prisma) - check for Decimal-like structure or .toFixed
              // Using simple duck typing for Decimal.js
              if (value && typeof value.toFixed === 'function' && typeof value.toNumber === 'function') {
                     return value.toNumber()
              }
              // Also check standard Decimal/BigDecimal objects if strict check needed, 
              // but usually checking .d (internal coefficients) is safer or toString
              if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'Decimal') {
                     return Number(value.toString())
              }

              // Circular Reference Check
              if (visited.has(value)) {
                     return null // Or "[Circular]" if debugging
              }
              visited.add(value)

              // Arrays
              if (Array.isArray(value)) {
                     return value.map(item => serializeRecursive(item, visited))
              }

              // Plain Objects
              const copy: any = {}
              for (const key in value) {
                     // Skip prototype properties and Prisma internals
                     if (Object.prototype.hasOwnProperty.call(value, key)) {
                            if (key.startsWith('_') || key.startsWith('$')) continue;

                            const serializedVal = serializeRecursive(value[key], visited);
                            if (serializedVal !== undefined) {
                                   copy[key] = serializedVal
                            }
                     }
              }
              return copy
       }

       return value // Fallback for things like RegExp (serialized to {}) usually
}

export function cleanPrismaObject<T extends Record<string, any>>(obj: T): T {
       return ultraSafeSerialize(obj);
}
