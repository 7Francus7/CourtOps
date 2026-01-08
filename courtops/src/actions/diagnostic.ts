'use server'

import prisma from '@/lib/db'

export async function diagnosticDatabase() {
       try {
              // 1. Check connection
              await prisma.$queryRaw`SELECT 1`

              // 2. Check if tables exist
              const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
              const names = tables.map((t: any) => t.table_name)

              return {
                     success: true,
                     message: "Conexión exitosa",
                     tables: names,
                     provider: (prisma as any)._activeProvider || 'postgres'
              }
       } catch (error: any) {
              console.error("Diagnostic Error:", error)
              return {
                     success: false,
                     error: error.message
              }
       }
}

export async function repairDatabase() {
       try {
              // Attempt to manually create the BookingItem table if it's missing
              // Casing must match TitleCase singular since we removed @@map
              await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BookingItem" (
        "id" SERIAL PRIMARY KEY,
        "bookingId" INTEGER NOT NULL,
        "productId" INTEGER,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
        CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
        CONSTRAINT "BookingItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL
      )
    `)

              return { success: true, message: "Comando de reparación ejecutado. Verifique si la tabla ahora existe." }
       } catch (error: any) {
              console.error("Repair Error:", error)
              return { success: false, error: error.message }
       }
}
