'use client'

import { signOut } from 'next-auth/react'
import GodModeSearch from './GodModeSearch'
import { LogOut, ShieldCheck } from 'lucide-react'

export default function GodModeHeader() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/[0.06]">
			<div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

				{/* Logo */}
				<div className="flex items-center gap-3 shrink-0">
					<div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20">
						<div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-emerald-500" />
						<div className="absolute inset-0 flex items-center justify-center">
							<ShieldCheck size={17} className="text-white drop-shadow" />
						</div>
					</div>
					<div className="flex flex-col leading-none gap-0.5">
						<span className="text-sm font-black tracking-tight text-white">
							GOD<span className="text-emerald-400">MODE</span>
						</span>
						<div className="flex items-center gap-1.5">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse" />
							<span className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-600">
								SISTEMA ACTIVO
							</span>
						</div>
					</div>
				</div>

				{/* Search */}
				<div className="flex-1 flex justify-center max-w-xl mx-auto">
					<GodModeSearch />
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 shrink-0">
					<button
						onClick={() => signOut({ callbackUrl: '/login' })}
						className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors duration-200 cursor-pointer"
					>
						<LogOut size={13} />
						Salir
					</button>
					<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/10 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
						AD
					</div>
				</div>

			</div>
		</header>
	)
}
