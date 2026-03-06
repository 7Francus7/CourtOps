import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { getPublicAvailability } from './src/actions/public-booking'

async function run() {
       console.log("Current time:", new Date().toISOString());
       const club = await prisma.club.findFirst();
       if (!club) {
              console.log("No club found");
              return;
       }
       console.log("Testing for club:", club.id);

       // Simulate what the client sends from startOfToday() in Argentina (-3)
       // At March 5, start of day local is 2026-03-05T00:00:00-03:00 in UTC which is 03:00:00Z
       const dt = new Date('2026-03-05T03:00:00.000Z');

       console.log("Testing with date:", dt.toISOString());

       const slots = await getPublicAvailability(club.id, dt);
       console.log("Available slots times:", slots.map((s: any) => s.time));
}
run().catch(console.error).finally(() => process.exit(0));
