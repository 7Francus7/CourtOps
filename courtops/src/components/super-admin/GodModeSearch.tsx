'use client'

import { useState, useEffect } from 'react'
import { searchGodMode } from '@/actions/super-admin'
import { Search } from 'lucide-react'

export default function GodModeSearch() {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<any>(null)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length >= 3) {
				const res = await searchGodMode(query)
				if (res.success) {
					setResults(res.results)
					setIsOpen(true)
				}
			} else {
				setResults(null)
				setIsOpen(false)
			}
		}, 500)
		return () => clearTimeout(timer)
	}, [query])

	return (
		<div className="relative w-full max-w-md">
			<div className="relative group">
				<Search
					size={15}
					className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors pointer-events-none"
				/>
				<input
					type="text"
					placeholder="Buscar club, usuario o email..."
					className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] placeholder:text-slate-600 transition-all"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => query.length >= 3 && setIsOpen(true)}
					onBlur={() => setTimeout(() => setIsOpen(false), 200)}
				/>
				{query.length > 0 && query.length < 3 && (
					<div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-700 tracking-tighter">
						Min 3
					</div>
				)}
			</div>

			{isOpen && results && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden divide-y divide-white/[0.04] animate-in fade-in slide-in-from-top-2 duration-200">
					{results.clubs.length > 0 && (
						<div className="p-2">
							<h4 className="text-[9px] font-black text-slate-600 uppercase px-3 py-2 tracking-widest">
								Clubes
							</h4>
							{results.clubs.map((club: any) => (
								<div
									key={club.id}
									className="px-3 py-2.5 hover:bg-white/[0.04] rounded-xl cursor-pointer group transition-colors"
								>
									<div className="flex justify-between items-center">
										<div>
											<div className="font-black text-sm text-white group-hover:text-emerald-400 transition-colors">
												{club.name}
											</div>
											<div className="text-[10px] font-bold text-slate-600">/{club.slug}</div>
										</div>
										<div className="text-[9px] bg-white/5 px-2 py-0.5 rounded-lg text-slate-600 font-mono">
											#{club.id.substring(0, 5)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{results.users.length > 0 && (
						<div className="p-2">
							<h4 className="text-[9px] font-black text-slate-600 uppercase px-3 py-2 tracking-widest">
								Usuarios
							</h4>
							{results.users.map((user: any) => (
								<div
									key={user.id}
									className="px-3 py-2.5 hover:bg-white/[0.04] rounded-xl cursor-pointer group transition-colors"
								>
									<div className="flex justify-between items-center">
										<div>
											<div className="font-black text-sm text-white group-hover:text-purple-400 transition-colors">
												{user.email}
											</div>
											<div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
												{user.name} · <span className="text-emerald-500">{user.role}</span>
											</div>
										</div>
										{user.club && (
											<div className="text-[9px] font-black text-slate-700 uppercase text-right max-w-[80px] truncate">
												{user.club.name}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{results.clubs.length === 0 && results.users.length === 0 && (
						<div className="p-6 text-center">
							<div className="text-xs font-bold text-slate-600">
								Sin resultados para &ldquo;{query}&rdquo;
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
