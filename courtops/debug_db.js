const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
       const users = await prisma.user.findMany({
              where: { name: { contains: 'Fabricio', mode: 'insensitive' } },
              include: { club: { include: { courts: true } } }
       });
       console.log(JSON.stringify(users, null, 2));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
