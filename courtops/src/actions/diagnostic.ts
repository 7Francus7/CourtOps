'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

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
                     tables: names
              }
       } catch (error: any) {
              console.error("Diagnostic Error:", error)
              return {
                     success: false,
                     error: error.message,
                     stack: error.stack
              }
       }
}

export async function forceSyncDatabase() {
       // Note: We can't easily run 'prisma db push' from within the app
       // but we can try to at least trigger some prisma activity or log more.
       try {
              const clubCount = await prisma.club.count()
              return { success: true, count: clubCount }
       } catch (error: any) {
              return { success: false, error: error.message }
       }
}
