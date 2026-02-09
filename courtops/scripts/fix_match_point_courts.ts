
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
       console.log('Fixing Match Point courts...')

       // 1. Get Match Point club
       const club = await prisma.club.findUnique({
              where: { slug: 'match-point' }
       })

       if (!club) {
              console.error('Club Match Point not found')
              return
       }

       console.log('Found club:', club.id)

       // 2. Find courts
       const courts = await prisma.court.findMany({
              where: { clubId: club.id },
              orderBy: { sortOrder: 'asc' }
       })

       console.log('Found courts:', courts.length)

       if (courts.length >= 2) {
              // Court A -> Football, 60 min
              const courtA = courts[0]
              console.log(`Updating Court A (${courtA.id}) to FOOTBALL / 60 min`)
              await prisma.court.update({
                     where: { id: courtA.id },
                     data: {
                            sport: 'FOOTBALL',
                            duration: 60
                     }
              })

              // Court B -> Padel, 90 min (Ensure it is set)
              const courtB = courts[1]
              console.log(`Updating Court B (${courtB.id}) to PADEL / 90 min`)
              await prisma.court.update({
                     where: { id: courtB.id },
                     data: {
                            sport: 'PADEL',
                            duration: 90
                     }
              })
       } else {
              console.log('Not enough courts to update')
       }

       // 3. Update Club slotDuration to 60 or 90?
       // User asked for mixed. The Club slotDuration mainly affects the grid generation in the current implementation.
       // If we leave it at 90, the grid will be 90-min slots.
       // Court A (60 min) will look weird.
       // If we set it to 30, we get more granularity.
       // Let's set Club slotDuration to 30 to allow finer grid control?
       // But wait, the TurneroGrid uses `config.slotDuration`.
       // If I change it to 30, the grid will have slots every 30 mins.
       // Then a 90 min booking takes 3 slots.
       // BUT `TurneroGrid` (as I read it) renders `DraggableBookingCard` inside a single slot div.
       // It does NOT seem to support spanning multiple slots visually (no `rowSpan` logic seen).
       // It iterates `TIME_SLOTS` and for each court, finds a booking that matches the time.
       // `const booking = bookingsByCourtAndTime.get(${court.id}-${label})`
       // If a booking is 90 mins, it matches the start time.
       // It will be rendered in the start slot.
       // The subsequent slots (e.g. start+30, start+60) will be empty (no booking starting there).
       // So they will show as "Available" (+) buttons?
       // This is a UI UX problem. "Blocking" slots occupied by a long booking.
       // If I change the granularity to 30 mins, the user will see:
       // 14:00 [Booking 90min]
       // 14:30 [+] (Free?) - NO, it should be blocked.
       // The current `TurneroGrid` does NOT seem to handle "blocking" of intermediate slots.
       // It only checks `bookingsByCourtAndTime.get`.
       // It does NOT check "is there a booking overlapping this slot".
       // This is a limitation of the current grid.
       // To support mixed durations properly, the Grid needs to check overlaps.

       // FOR NOW:
       // I will Update courts to correct data.
       // I will NOT change Club `slotDuration` significantly unless I fix the Grid logic.
       // If Court A is 60 and Court B is 90, and Grid is 90...
       // Court A 14:00 (60 min) -> Booking fits visually. 30 min gap?
       // Next slot 15:30.
       // 15:00 is NOT a slot on the grid if duration is 90.
       // So you can't book at 15:00.
       // This essentially forces Court A to behave like 90 min slots (with 30 min dead time) OR I must change Club Duration.

       // If I change Club Duration to 30:
       // Grid has 14:00, 14:30, 15:00, 15:30...
       // Booking 90 min at 14:00.
       // 14:30 slot -> shows (+). User clicks -> overlaps!
       // Database/Backend likely prevents overlap (Prisma check).
       // Visuals will be confusing (looks free).

       // User just showed me the screenshots.
       // I will correct the DATA Labels first.
       // I will mention the grid limitation or start fixing it.
       // Given the "User Request" was empty, I'll fix the obvious (Labels/Data) and see.
}

main()
       .catch(e => {
              console.error(e)
              process.exit(1)
       })
       .finally(async () => {
              await prisma.$disconnect()
       })
