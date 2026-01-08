import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
       console.log("Checking database tables...")
       try {
              const result: any = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
              console.log("Tables in public schema:", result.map((r: any) => r.table_name || r.TABLE_NAME))
       } catch (e: any) {
              console.log("Error querying information_schema (maybe not postgres?):", e.message)
              try {
                     const sqliteResult: any = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table'")
                     console.log("Tables in SQLite database:", sqliteResult.map((r: any) => r.name))
              } catch (e2: any) {
                     console.log("Error querying sqlite_master:", e2.message)
              }
       }
}

main()
       .then(() => prisma.$disconnect())
       .catch(e => { console.error(e); prisma.$disconnect() })
