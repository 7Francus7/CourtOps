'use client'

import { useState } from 'react'
import {
	deleteClub,
	updateClub,
	updateClubAdminPassword,
	generateImpersonationToken,
	seedClubData,
	toggleClubFeature,
	cleanClubData,
	activateClubSubscription,
} from '@/actions/super-admin'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Flag, DatabaseZap, Edit, Key, LogIn, Trash2, Eraser, CreditCard } from 'lucide-react'

type Club = {
	id: string
	name: string
	slug: string
	platformPlan?: { name: string; price: number } | null
	subscriptionStatus: string
	nextBillingDate: Date | null
	_count: {
		courts: number
		users: number
		bookings: number
	}
	users: { email: string }[]
	hasKiosco: boolean
	hasOnlinePayments: boolean
	hasAdvancedReports: boolean
	hasCustomDomain: boolean
	hasTournaments: boolean
}

export default function ClubList({ clubs }: { clubs: Club[] }) {
	const [editingClubId, setEditingClubId] = useState<string | null>(null)
	const [editForm, setEditForm] = useState({ name: '', slug: '' })

	const [changePasswordId, setChangePasswordId] = useState<string | null>(null)
	const [passwordForm, setPasswordForm] = useState({ newPassword: '' })

	const [featuresClubId, setFeaturesClubId] = useState<string | null>(null)
	const [loadingId, setLoadingId] = useState<string | null>(null)
	const router = useRouter()

	async function handleClean(clubId: string) {
		if (!confirm('⚠️ PELIGRO: Esto borrará TODOS los datos operativos del club (Reservas, Clientes, Caja, Torneos).\n\n¿Estás seguro de que quieres limpiar este club para entregarlo desde 0?')) return
		if (!confirm('Confirmación doble: Esta acción NO se puede deshacer. ¿Proceder?')) return
		setLoadingId(clubId)
		const res = await cleanClubData(clubId)
		if (res.success) { alert(res.message); router.refresh() }
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	async function handleImpersonate(clubId: string) {
		if (!confirm('¿Estás seguro de que quieres entrar como ADMIN de este club?')) return
		setLoadingId(clubId)
		const res = await generateImpersonationToken(clubId)
		if (res.success && res.token) {
			await signIn('credentials', { impersonateToken: res.token, callbackUrl: '/dashboard' })
		} else {
			alert('Error al generar acceso: ' + res.error)
			setLoadingId(null)
		}
	}

	async function handleSeed(clubId: string) {
		if (!confirm('Esto creará clientes y reservas falsas. ¿Continuar?')) return
		setLoadingId(clubId)
		const res = await seedClubData(clubId)
		if (res.success) { alert(res.message); router.refresh() }
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	async function handleToggleFeature(clubId: string, feature: string, currentValue: boolean) {
		const res = await toggleClubFeature(clubId, feature, !currentValue)
		if (!res.success) alert('Error al cambiar feature: ' + res.error)
		else router.refresh()
	}

	async function handleActivate(clubId: string) {
		const months = parseInt(prompt('¿Por cuántos meses activar la suscripción?', '1') || '0')
		if (months <= 0) return
		const planName = prompt('Nombre del Plan (Base, Pro, Max):', 'Pro') || 'Pro'
		setLoadingId(clubId)
		const res = await activateClubSubscription(clubId, planName, months)
		if (res.success) { alert(res.message); router.refresh() }
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	function handleEditClick(club: Club) {
		setEditingClubId(club.id)
		setEditForm({ name: club.name, slug: club.slug })
		setChangePasswordId(null)
		setFeaturesClubId(null)
	}

	function handlePasswordClick(club: Club) {
		setChangePasswordId(club.id)
		setPasswordForm({ newPassword: '' })
		setEditingClubId(null)
		setFeaturesClubId(null)
	}

	function handleFeaturesClick(club: Club) {
		setFeaturesClubId(featuresClubId === club.id ? null : club.id)
		setEditingClubId(null)
		setChangePasswordId(null)
	}

	async function handleSave(clubId: string) {
		setLoadingId(clubId)
		const formData = new FormData()
		formData.append('clubId', clubId)
		formData.append('name', editForm.name)
		formData.append('slug', editForm.slug)
		const res = await updateClub(formData)
		if (res.success) { setEditingClubId(null); router.refresh() }
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	async function handlePasswordSave(clubId: string) {
		setLoadingId(clubId)
		const formData = new FormData()
		formData.append('clubId', clubId)
		formData.append('newPassword', passwordForm.newPassword)
		const res = await updateClubAdminPassword(formData)
		if (res.success) { setChangePasswordId(null); alert('Contraseña actualizada'); router.refresh() }
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	async function handleDelete(clubId: string) {
		if (!confirm('¿Seguro que quieres eliminar este club? Se borrarán todas sus canchas, usuarios y reservas. ESTA ACCIÓN ES IRREVERSIBLE.')) return
		setLoadingId(clubId)
		const formData = new FormData()
		formData.append('clubId', clubId)
		const res = await deleteClub(formData)
		if (res.success) router.refresh()
		else alert('Error: ' + res.error)
		setLoadingId(null)
	}

	function getStatusStyle(status: string) {
		switch (status) {
			case 'authorized':
			case 'ACTIVE':
				return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
			case 'pending':
			case 'in_process':
			case 'TRIAL':
				return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
			case 'cancelled':
				return 'bg-red-500/10 text-red-400 border-red-500/20'
			default:
				return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
		}
	}

	const inputClass = 'w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-700 focus:border-emerald-500/40 focus:ring-0 outline-none transition-colors'

	return (
		<div className="grid gap-2.5">
			{clubs.map(club => (
				<div
					key={club.id}
					className="bg-[#0f172a] hover:bg-[#111827] transition-all duration-200 border border-white/[0.06] hover:border-white/10 rounded-2xl p-4 md:p-5 flex flex-col gap-3 group"
				>
					<div className="flex justify-between items-start gap-3">
						<div className="flex-1 min-w-0">

							{/* Edit Mode */}
							{editingClubId === club.id ? (
								<div className="space-y-2.5 p-3 bg-black/30 rounded-xl border border-white/[0.06]">
									<input
										className={inputClass}
										value={editForm.name}
										onChange={e => setEditForm({ ...editForm, name: e.target.value })}
										placeholder="Nombre del Club"
									/>
									<input
										className={`${inputClass} font-mono text-xs`}
										value={editForm.slug}
										onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
										placeholder="slug-url"
									/>
									<div className="flex gap-2">
										<button onClick={() => handleSave(club.id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black transition-colors cursor-pointer">
											Guardar
										</button>
										<button onClick={() => setEditingClubId(null)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black transition-colors cursor-pointer">
											Cerrar
										</button>
									</div>
								</div>

							/* Password Mode */
							) : changePasswordId === club.id ? (
								<div className="space-y-2.5 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
									<h4 className="text-red-400 text-[10px] font-black uppercase tracking-widest">
										Cambiar Clave: {club.name}
									</h4>
									<input
										className={`${inputClass} border-red-500/20 focus:border-red-400/40`}
										value={passwordForm.newPassword}
										onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
										placeholder="Nueva contraseña"
										type="text"
									/>
									<div className="flex gap-2">
										<button onClick={() => handlePasswordSave(club.id)} className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-black transition-colors cursor-pointer">
											Actualizar
										</button>
										<button onClick={() => setChangePasswordId(null)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black transition-colors cursor-pointer">
											Cerrar
										</button>
									</div>
								</div>

							/* Default View */
							) : (
								<>
									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-black text-base text-white group-hover:text-emerald-400 transition-colors tracking-tight truncate">
											{club.name}
										</h3>
										<span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border tracking-widest shrink-0 ${getStatusStyle(club.subscriptionStatus)}`}>
											{club.subscriptionStatus === 'authorized' ? 'Suscrito' : club.subscriptionStatus}
										</span>
									</div>
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
											Plan: <span className="text-slate-400">{club.platformPlan?.name || 'CUSTOM'}</span>
										</span>
										{club.nextBillingDate && (
											<>
												<span className="text-white/10">·</span>
												<span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
													Vence: {new Date(club.nextBillingDate).toLocaleDateString()}
												</span>
											</>
										)}
									</div>
									<div className="flex items-center gap-2 mt-1.5">
										<span className="text-[10px] text-slate-700 font-mono bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-lg">
											{club.id.slice(0, 8)}…
										</span>
										<span className="text-[10px] text-emerald-500 font-bold">/{club.slug}</span>
									</div>
								</>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex flex-wrap items-center gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end max-w-[192px] shrink-0">
							{[
								{ icon: Flag, label: 'Features', onClick: () => handleFeaturesClick(club), active: featuresClubId === club.id, cls: featuresClubId === club.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10' },
								{ icon: DatabaseZap, label: 'Seed Demo', onClick: () => handleSeed(club.id), cls: 'bg-white/5 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10' },
								{ icon: Edit, label: 'Editar', onClick: () => handleEditClick(club), cls: 'bg-white/5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10' },
								{ icon: Key, label: 'Admin Pass', onClick: () => handlePasswordClick(club), cls: 'bg-white/5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10' },
								{ icon: LogIn, label: 'Impersonar', onClick: () => handleImpersonate(club.id), cls: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' },
								{ icon: Eraser, label: 'Reset', onClick: () => handleClean(club.id), cls: 'bg-white/5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10' },
								{ icon: CreditCard, label: 'Activar', onClick: () => handleActivate(club.id), cls: 'bg-white/5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10' },
								{ icon: Trash2, label: 'Borrar', onClick: () => handleDelete(club.id), cls: 'bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10' },
							].map(({ icon: Icon, label, onClick, cls }) => (
								<button
									key={label}
									onClick={onClick}
									disabled={loadingId === club.id}
									title={label}
									className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-40 ${cls}`}
								>
									<Icon size={13} />
								</button>
							))}
						</div>
					</div>

					{/* Features Panel */}
					{featuresClubId === club.id && (
						<div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-2.5">
							{[
								{ key: 'hasKiosco', label: 'Punto de Venta' },
								{ key: 'hasOnlinePayments', label: 'Pagos MP' },
								{ key: 'hasAdvancedReports', label: 'Reportes Pro' },
								{ key: 'hasTournaments', label: 'Torneos' },
								{ key: 'hasCustomDomain', label: 'Dominio Propio' },
							].map(f => (
								<label
									key={f.key}
									className={`flex items-center gap-2 cursor-pointer p-2 rounded-xl transition-colors ${
										club[f.key as keyof Club]
											? 'bg-emerald-500/10 text-emerald-400'
											: 'text-slate-600 hover:bg-white/[0.03] hover:text-slate-400'
									}`}
								>
									<input
										type="checkbox"
										checked={!!club[f.key as keyof Club]}
										onChange={() => handleToggleFeature(club.id, f.key, !!club[f.key as keyof Club])}
										className="accent-emerald-500"
									/>
									<span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span>
								</label>
							))}
						</div>
					)}

					{/* Stats Row */}
					{!editingClubId && !changePasswordId && !featuresClubId && (
						<div className="flex items-center gap-4 border-t border-white/[0.04] pt-3">
							<div className="flex items-center gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider flex-1">
								<span>
									<strong className="text-white text-sm font-black">{club._count.courts}</strong> canchas
								</span>
								<span>
									<strong className="text-white text-sm font-black">{club._count.users}</strong> staff
								</span>
								<span className="flex items-center gap-1.5">
									<strong className="text-emerald-400 text-sm font-black">{club._count.bookings.toLocaleString()}</strong>
									<span>reservas</span>
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								</span>
							</div>
							{club.platformPlan && (
								<span className="text-[10px] font-bold text-slate-700 shrink-0">
									${club.platformPlan.price?.toLocaleString()}/mes
								</span>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	)
}
