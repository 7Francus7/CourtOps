'use client'

import React, { useState, useMemo } from 'react'
import { Search, ShoppingCart, User, Store, Users, DollarSign, RefreshCw, Wallet, Beer, Pizza, Trophy, X, Package, Plus, Minus, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export type Product = {
	id: number
	name: string
	price: number
	stock: number
	category: string
}

interface KioskItem {
	id: number
	productId?: number
	product?: { name: string }
	quantity: number
	unitPrice: number
	playerName?: string
}

interface KioskPlayer {
	id: string
	name: string
	amount: number
	isPaid: boolean
}

interface KioskTabProps {
	products: Product[]
	items: KioskItem[]
	loading: boolean
	onAddItem: (productId: number, quantity: number, playerName?: string) => void
	onRemoveItem: (itemId: number) => void
	onRecalculate?: () => void
	onCollectPayment?: (player: KioskPlayer) => void
	players: KioskPlayer[]
}

export function KioskTab({ products, items, loading, onAddItem, onRemoveItem, onRecalculate, onCollectPayment, players }: KioskTabProps) {
	const { t } = useLanguage()
	const [search, setSearch] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string>("all")
	const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>(undefined)

	const categories = useMemo(
		() => ["all", ...Array.from(new Set(products.map(p => p.category || 'Varios')))],
		[products]
	)

	const filteredProducts = useMemo(() => products.filter(p => {
		const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
		const matchesCategory = selectedCategory === "all" || (p.category || 'Varios') === selectedCategory
		return matchesSearch && matchesCategory
	}), [products, search, selectedCategory])

	// Total quantity per product across all items (for badge)
	const productCartCounts = useMemo(() => {
		const map = new Map<number, number>()
		items.forEach(item => {
			if (item.productId) {
				map.set(item.productId, (map.get(item.productId) || 0) + item.quantity)
			}
		})
		return map
	}, [items])

	// Last item id for a product (used by minus stepper)
	const getLastItemId = (productId: number): number | undefined => {
		return [...items].reverse().find(i => i.productId === productId)?.id
	}

	const getCategoryIcon = (category: string) => {
		const cat = category?.toLowerCase() || ''
		if (cat.includes('bebi')) return <Beer size={15} />
		if (cat.includes('comi') || cat.includes('snack')) return <Pizza size={15} />
		if (cat.includes('pelota') || cat.includes('acces') || cat.includes('grip') || cat.includes('indum')) return <Trophy size={15} />
		return <Store size={15} />
	}

	const generalTotal = items
		.filter(i => !i.playerName || i.playerName === 'General' || i.playerName === t('everyone'))
		.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)

	const itemsTotal = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0)

	return (
		<div className="space-y-4">
			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600" size={15} />
				<input
					type="text"
					placeholder={t('search_placeholder_kiosk')}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full h-10 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
				/>
				{search && (
					<button
						onClick={() => setSearch("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
					>
						<X size={13} />
					</button>
				)}
			</div>

			{/* Player Selector + Categories */}
			<div className="space-y-2.5">
				<div>
					<span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">¿Quién consume?</span>
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
						<button
							onClick={() => setSelectedPlayer(undefined)}
							className={cn(
								"px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0",
								!selectedPlayer
									? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
									: "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.06] hover:bg-slate-50"
							)}
						>
							<Users size={11} />
							General
							{!selectedPlayer && <Check size={10} className="ml-0.5" />}
						</button>
						{players.map(player => (
							<button
								key={player.id}
								onClick={() => setSelectedPlayer(prev => prev === player.name ? undefined : player.name)}
								className={cn(
									"px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 shrink-0",
									selectedPlayer === player.name
										? "bg-primary text-primary-foreground border-primary shadow-sm"
										: "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.06] hover:bg-slate-50"
								)}
							>
								<User size={11} />
								{player.name}
								{selectedPlayer === player.name && <Check size={10} className="ml-0.5" />}
							</button>
						))}
					</div>
				</div>

				{categories.length > 2 && (
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
						{categories.map(cat => (
							<button
								key={cat}
								onClick={() => setSelectedCategory(cat)}
								className={cn(
									"px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap border shrink-0",
									selectedCategory === cat
										? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
										: "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.06] hover:bg-slate-50"
								)}
							>
								{cat === "all" ? "Todos" : cat}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Main layout: products (2/3) | cart+summary (1/3) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

				{/* Product Grid */}
				<div className="lg:col-span-2">
					{filteredProducts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
							<div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
								<Package size={20} className="text-slate-300 dark:text-zinc-700" />
							</div>
							<p className="text-sm font-medium text-slate-400 dark:text-zinc-600">
								{search ? 'Sin resultados' : 'Sin productos'}
							</p>
							<p className="text-[11px] text-slate-300 dark:text-zinc-700 mt-1">
								{search ? `No hay productos con "${search}"` : 'Agregá productos desde Configuración'}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[calc(90vh-300px)] overflow-y-auto custom-scrollbar pt-2 pr-3">
							{filteredProducts.map(product => {
								const count = productCartCounts.get(product.id) || 0
								const isOutOfStock = product.stock <= 0
								const lastItemId = getLastItemId(product.id)

								return (
									<div
										key={product.id}
										className={cn(
											"relative bg-white dark:bg-white/[0.02] border rounded-xl p-3.5 transition-all flex flex-col",
											isOutOfStock
												? "opacity-40 border-slate-200/40 dark:border-white/[0.02] cursor-not-allowed"
												: count > 0
													? "border-primary/40 bg-primary/[0.015] dark:border-primary/25 shadow-sm"
													: "border-slate-200/60 dark:border-white/[0.04]"
										)}
									>
										{/* Quantity badge */}
										{count > 0 && (
											<div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md z-10">
												{count}
											</div>
										)}

										{/* Header: icon + price */}
										<div className="flex items-start justify-between mb-2.5">
											<div className={cn(
												"w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
												count > 0
													? "bg-primary/10 text-primary"
													: "bg-slate-50 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-600"
											)}>
												{getCategoryIcon(product.category)}
											</div>
											<span className="text-sm font-bold text-primary tracking-tight">${product.price.toLocaleString()}</span>
										</div>

										{/* Name */}
										<p className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 line-clamp-2 leading-tight mb-2 flex-1">{product.name}</p>

										{/* Stock warning */}
										{isOutOfStock ? (
											<p className="text-[9px] text-red-400 font-semibold mb-2">Sin stock</p>
										) : product.stock <= 5 ? (
											<p className="text-[9px] text-amber-500 font-medium mb-2">Stock: {product.stock}</p>
										) : null}

										{/* Add / Stepper */}
										{count > 0 ? (
											<div className="flex items-center gap-1 mt-auto">
												<button
													onClick={() => lastItemId !== undefined && onRemoveItem(lastItemId)}
													disabled={loading}
													className="flex-1 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/[0.1] active:scale-95 transition-all disabled:opacity-40"
												>
													<Minus size={11} />
												</button>
												<span className="text-xs font-bold text-slate-800 dark:text-white w-6 text-center tabular-nums">{count}</span>
												<button
													onClick={() => !isOutOfStock && onAddItem(product.id, 1, selectedPlayer)}
													disabled={loading || isOutOfStock}
													className="flex-1 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
												>
													<Plus size={11} />
												</button>
											</div>
										) : (
											<button
												onClick={() => !isOutOfStock && onAddItem(product.id, 1, selectedPlayer)}
												disabled={loading || isOutOfStock}
												className="w-full h-7 mt-auto rounded-lg bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-500 border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-medium"
											>
												<Plus size={11} />
												Agregar
											</button>
										)}
									</div>
								)
							})}
						</div>
					)}
				</div>

				{/* Right panel */}
				<div className="flex flex-col gap-3">

					{/* Cart */}
					<div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
							<div className="flex items-center gap-2">
								<div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
									<ShoppingCart size={12} />
								</div>
								<span className="text-[12px] font-semibold text-slate-700 dark:text-white">Consumos</span>
							</div>
							{items.length > 0 && (
								<span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
									{items.length}
								</span>
							)}
						</div>

						{items.length === 0 ? (
							<div className="py-8 flex flex-col items-center text-center px-4">
								<ShoppingCart size={18} className="mb-2 text-slate-300 dark:text-zinc-700" />
								<p className="text-[11px] font-medium text-slate-400 dark:text-zinc-600">Vacío</p>
								<p className="text-[10px] text-slate-300 dark:text-zinc-700 mt-0.5">Tocá un producto para agregar</p>
							</div>
						) : (
							<>
								<div className="divide-y divide-slate-100 dark:divide-white/[0.03] max-h-[220px] overflow-y-auto custom-scrollbar">
									{items.map((item) => (
										<div key={item.id} className="flex items-center gap-2.5 px-4 py-2.5 group hover:bg-white/70 dark:hover:bg-white/[0.02] transition-colors">
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-1.5">
													<span className="text-[11px] font-medium text-slate-700 dark:text-white truncate">{item.product?.name || 'Producto'}</span>
													<span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">x{item.quantity}</span>
												</div>
												{item.playerName && item.playerName !== 'General' && (
													<div className="flex items-center gap-1 mt-0.5">
														<User size={8} className="text-slate-400 dark:text-zinc-600 shrink-0" />
														<span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 truncate">{item.playerName}</span>
													</div>
												)}
											</div>
											<div className="flex items-center gap-1.5 shrink-0">
												<span className="text-[12px] font-semibold text-slate-800 dark:text-white tabular-nums">
													${(item.unitPrice * item.quantity).toLocaleString()}
												</span>
												<button
													onClick={() => onRemoveItem(item.id)}
													disabled={loading}
													className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40 shrink-0"
												>
													<X size={12} />
												</button>
											</div>
										</div>
									))}
								</div>

								<div className="px-4 py-2.5 bg-white dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.04] flex justify-between items-center">
									<span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Total kiosco</span>
									<span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">${itemsTotal.toLocaleString()}</span>
								</div>
							</>
						)}
					</div>

					{/* Per-Person Summary */}
					<div className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-xl overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
							<div className="flex items-center gap-2">
								<DollarSign size={12} className="text-slate-400 dark:text-zinc-500" />
								<span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Por persona</span>
							</div>
							{onRecalculate && (
								<button
									onClick={onRecalculate}
									disabled={loading}
									className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-95 transition-all disabled:opacity-40"
								>
									<RefreshCw size={10} />
									Recalcular
								</button>
							)}
						</div>

						<div className="divide-y divide-slate-100 dark:divide-white/[0.03]">
							{generalTotal > 0 && (
								<div className="flex justify-between items-center px-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-500/[0.03]">
									<div>
										<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">Compartido</span>
										<span className="text-[9px] text-slate-400 dark:text-zinc-600">General</span>
									</div>
									<span className="text-[12px] font-bold text-slate-800 dark:text-white tabular-nums">${generalTotal.toLocaleString()}</span>
								</div>
							)}

							{players.map(p => (
								<div key={p.id} className="flex items-center justify-between px-4 py-2.5">
									<div className="min-w-0">
										<span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block truncate">{p.name}</span>
										<span className={cn(
											"text-[9px] font-semibold",
											p.isPaid ? "text-emerald-500" : p.amount > 0 ? "text-amber-500" : "text-slate-400 dark:text-zinc-600"
										)}>
											{p.isPaid ? '✓ Pagado' : p.amount > 0 ? 'Pendiente' : 'Sin consumo'}
										</span>
									</div>

									<div className="flex items-center gap-2 shrink-0 ml-3">
										{p.isPaid ? (
											<div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
												<Check size={10} className="text-emerald-500" />
												<span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">${(p.amount || 0).toLocaleString()}</span>
											</div>
										) : p.amount > 0 && onCollectPayment ? (
											<button
												onClick={() => onCollectPayment(p)}
												className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-all active:scale-95 shadow-sm"
											>
												<Wallet size={10} />
												Cobrar ${p.amount.toLocaleString()}
											</button>
										) : (
											<span className="text-[12px] font-semibold text-slate-400 dark:text-zinc-600 tabular-nums">
												${(p.amount || 0).toLocaleString()}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
