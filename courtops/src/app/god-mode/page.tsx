import { getAllClubs, getPlatformPlans, getGodModeStats, getSystemNotifications } from '@/actions/super-admin'
import CreateClubForm from '@/components/super-admin/CreateClubForm'
import ClubList from '@/components/super-admin/ClubList'
import DiagnosticTool from '@/components/super-admin/DiagnosticTool'
import BroadcastForm from '@/components/super-admin/BroadcastForm'
import PlanManager from '@/components/super-admin/PlanManager'
import GodModeTutorial from '@/components/super-admin/GodModeTutorial'
import SqlExplorer from '@/components/super-admin/SqlExplorer'
import { DatabaseZap, Users, Calendar, Activity, Building2, CreditCard, Plus, TrendingUp } from 'lucide-react'
import { getServerSession } from "next-auth"
import { authOptions, isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

function StatCard({
	title,
	value,
	subtext,
	icon: Icon,
	trend,
	color = 'emerald',
}: {
	title: string
	value: string | number
	subtext: string
	icon: React.ElementType
	trend?: string
	color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'red'
}) {
	const accents = {
		emerald: {
			border: 'border-l-emerald-500',
			icon: 'text-emerald-400',
			bg: 'bg-emerald-500/10',
			badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
		},
		blue: {
			border: 'border-l-blue-500',
			icon: 'text-blue-400',
			bg: 'bg-blue-500/10',
			badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
		},
		amber: {
			border: 'border-l-amber-500',
			icon: 'text-amber-400',
			bg: 'bg-amber-500/10',
			badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
		},
		purple: {
			border: 'border-l-purple-500',
			icon: 'text-purple-400',
			bg: 'bg-purple-500/10',
			badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
		},
		red: {
			border: 'border-l-red-500',
			icon: 'text-red-400',
			bg: 'bg-red-500/10',
			badge: 'bg-red-500/15 text-red-400 border-red-500/20',
		},
	}
	const a = accents[color]

	return (
		<div
			className={`bg-[#0f172a] border border-white/[0.06] border-l-2 ${a.border} rounded-2xl p-5 flex flex-col gap-3 hover:border-white/10 transition-all duration-200 cursor-default`}
		>
			<div className="flex items-start justify-between">
				<div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center`}>
					<Icon size={16} className={a.icon} />
				</div>
				{trend && (
					<span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${a.badge}`}>
						{trend}
					</span>
				)}
			</div>
			<div>
				<div className="text-3xl font-black text-white tracking-tighter leading-none tabular-nums">
					{value}
				</div>
				<div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
					{title}
				</div>
				<div className="text-[10px] text-slate-600 font-medium mt-0.5">
					{subtext}
				</div>
			</div>
		</div>
	)
}

export default async function GodModePage() {
	const session = await getServerSession(authOptions)

	if (!session?.user || !isSuperAdmin(session.user)) {
		redirect('/login')
	}

	const [clubs, plans, stats, notifications] = await Promise.all([
		getAllClubs(),
		getPlatformPlans(),
		getGodModeStats(),
		getSystemNotifications(),
	])

	const fmt = (val: number) =>
		new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS',
			maximumFractionDigits: 0,
		}).format(val)

	const trialClubs = clubs.filter(
		(c: any) => c.subscriptionStatus === 'TRIAL' || c.subscriptionStatus === 'pending'
	).length
	const activeClubs = clubs.filter((c: any) => c.subscriptionStatus === 'authorized').length
	const conversionRate = Math.round((activeClubs / Math.max(stats.totalClubs, 1)) * 100)

	return (
		<div className="space-y-8 pt-6">

			{/* ── Hero ─────────────────────────────────────────────────── */}
			<div className="relative bg-[#0f172a] border border-white/[0.06] rounded-2xl overflow-hidden">
				{/* Grid texture */}
				<div
					className="absolute inset-0 opacity-[0.025] pointer-events-none"
					style={{
						backgroundImage:
							'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
						backgroundSize: '48px 48px',
					}}
				/>
				{/* Ambient glows */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.06] blur-[120px] rounded-full pointer-events-none" />
				<div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

				<div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
					{/* Left: title */}
					<div>
						<div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
								Super Admin Panel
							</span>
						</div>
						<h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.95]">
							Panel de<br />
							<span className="text-emerald-400">Control</span>
						</h1>
						<p className="text-slate-500 text-sm mt-3 max-w-sm leading-relaxed">
							Gestión centralizada de clubes, planes y suscripciones CourtOps.
						</p>
					</div>

					{/* Right: metric cards */}
					<div className="flex items-stretch gap-3 flex-wrap">
						<div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4 min-w-[130px]">
							<p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">MRR</p>
							<p className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight tabular-nums leading-none">
								{fmt(stats.mrr)}
							</p>
							<p className="text-[10px] text-slate-600 font-medium mt-1.5">
								{activeClubs} clubes activos
							</p>
						</div>
						<div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4 min-w-[130px] hidden sm:block">
							<p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">ARR</p>
							<p className="text-2xl md:text-3xl font-black text-white tracking-tight tabular-nums leading-none">
								{fmt(stats.mrr * 12)}
							</p>
							<div className="flex items-center gap-1 mt-1.5">
								<TrendingUp size={10} className="text-emerald-500" />
								<p className="text-[10px] text-slate-600 font-medium">proyección anual</p>
							</div>
						</div>
						<div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4 min-w-[100px] hidden md:block">
							<p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">HOY</p>
							<p className="text-2xl md:text-3xl font-black text-white tracking-tight tabular-nums leading-none">
								{stats.bookingsToday}
							</p>
							<p className="text-[10px] text-slate-600 font-medium mt-1.5">nuevas reservas</p>
						</div>
					</div>
				</div>
			</div>

			{/* ── Stats Grid ───────────────────────────────────────────── */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				<StatCard
					title="Clubes Totales"
					value={stats.totalClubs}
					subtext={`${activeClubs} activos · ${trialClubs} trial`}
					icon={Building2}
					color="purple"
				/>
				<StatCard
					title="Suscripciones"
					value={activeClubs}
					subtext={`${conversionRate}% conversión`}
					icon={CreditCard}
					trend={`${activeClubs}/${stats.totalClubs}`}
					color="emerald"
				/>
				<StatCard
					title="Usuarios"
					value={stats.totalUsers}
					subtext="admins + empleados"
					icon={Users}
					color="blue"
				/>
				<StatCard
					title="Reservas Hoy"
					value={stats.bookingsToday}
					subtext={`${stats.totalBookings.toLocaleString()} históricas`}
					icon={Calendar}
					trend="Live"
					color="amber"
				/>
				<StatCard
					title="Planes"
					value={plans.length}
					subtext="planes activos"
					icon={Activity}
					color="purple"
				/>
			</div>

			{/* ── Main Content ─────────────────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

				{/* Left — Club List */}
				<div className="lg:col-span-8 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-2.5">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
							Clubes ({clubs.length})
						</h2>
						<span className="text-[9px] font-bold text-slate-600 bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full uppercase tracking-widest">
							v4.2.0
						</span>
					</div>

					{clubs.length === 0 ? (
						<div className="p-16 border border-dashed border-white/[0.08] rounded-2xl text-slate-600 text-center flex flex-col items-center gap-4">
							<DatabaseZap size={40} className="opacity-20" />
							<p className="text-sm font-medium">No hay clubes registrados todavía.</p>
						</div>
					) : (
						<ClubList clubs={clubs as Parameters<typeof ClubList>[0]['clubs']} />
					)}
				</div>

				{/* Right — Tools Sidebar */}
				<div className="lg:col-span-4 space-y-5">

					{/* Create Club */}
					<div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-5">
						<div className="flex items-center gap-3 mb-5">
							<div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
								<Plus size={16} className="text-white" />
							</div>
							<div>
								<h2 className="text-sm font-black text-white leading-none">Nuevo Club</h2>
								<p className="text-[10px] text-slate-500 mt-0.5">Desplegar tenant</p>
							</div>
						</div>
						<CreateClubForm plans={plans} />
					</div>

					{/* Plan Manager */}
					<PlanManager plans={plans} />

					{/* Broadcast */}
					<BroadcastForm notifications={notifications} />

					{/* Diagnostics */}
					<div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-5">
						<DiagnosticTool />
					</div>

				</div>
			</div>

			{/* ── SQL Explorer ─────────────────────────────────────────── */}
			<SqlExplorer />

			<div className="pt-2">
				<GodModeTutorial />
			</div>

		</div>
	)
}
