
import { getServerSession } from "next-auth/next"
import { authOptions, isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import GodModeHeader from "@/components/super-admin/GodModeHeader"

export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user || !isSuperAdmin(session.user)) {
			redirect('/login')
		}

		return (
			<div className="min-h-screen bg-[#020617] text-slate-100">
				<GodModeHeader />
				<div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-20">
					{children}
				</div>
			</div>
		)
	} catch (error) {
		console.error("Layout Error:", error)
		return (
			<div className="min-h-screen bg-[#020617] flex items-center justify-center">
				<p className="text-slate-500 text-sm">Error cargando sesión administrativa.</p>
			</div>
		)
	}
}
