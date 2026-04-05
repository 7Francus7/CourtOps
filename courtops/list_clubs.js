const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Listing all clubs in the database...');
    const clubs = await prisma.club.findMany({
        include: {
            _count: {
                select: {
                    bookings: true,
                    clients: true,
                    courts: true,
                    products: true,
                    users: true
                }
            }
        }
    });
    
    if (clubs.length === 0) {
        console.log('No clubs found.');
    } else {
        clubs.forEach(club => {
            console.log(`Club Name: ${club.name}`);
            console.log(`- Slug: ${club.slug}`);
            console.log(`- ID: ${club.id}`);
            console.log(`- Data Status:`);
            console.log(`  - Bookings: ${club._count.bookings}`);
            console.log(`  - Clients: ${club._count.clients}`);
            console.log(`  - Courts: ${club._count.courts}`);
            console.log(`  - Products: ${club._count.products}`);
            console.log(`  - Users: ${club._count.users}`);
            console.log('---------------------------');
        });
    }

    const totalUsers = await prisma.user.count();
    console.log(`Total users in system: ${totalUsers}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
