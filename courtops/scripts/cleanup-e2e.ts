// Borra los clubes creados por la suite E2E (emails *@courtops-e2e.test).
// Uso: npx tsx scripts/cleanup-e2e.ts
import prisma from '../src/lib/db'

async function main() {
	const users = await prisma.user.findMany({
		where: { email: { endsWith: '@courtops-e2e.test' } },
		select: { clubId: true, email: true },
	})
	const clubIds = [...new Set(users.map(u => u.clubId).filter((id): id is string => !!id))]

	if (clubIds.length === 0) {
		console.log('Sin clubes E2E para borrar.')
		return
	}

	console.log(`Borrando ${clubIds.length} club(es) E2E...`)
	const res = await prisma.club.deleteMany({ where: { id: { in: clubIds } } })
	console.log(`Listo: ${res.count} club(es) eliminados (relaciones via cascade).`)
}

main().finally(() => prisma.$disconnect())
