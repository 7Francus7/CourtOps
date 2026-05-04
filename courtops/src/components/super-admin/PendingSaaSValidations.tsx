'use client'

import React, { useState } from 'react'
import { Check, X, Clock, ExternalLink, Shield, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { validateSaaSTransfer } from '@/actions/super-admin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PendingClub {
    id: string
    name: string
    subscriptionReference?: string | null
    subscriptionReceiptUrl?: string | null
    pendingBillingCycle?: string | null
    targetPlan?: {
        name: string
    } | null
    users: { email: string }[]
}

export default function PendingSaaSValidations({ initialPending }: { initialPending: PendingClub[] }) {
    const [pending, setPending] = useState<PendingClub[]>(initialPending)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleAction = async (clubId: string, action: 'approve' | 'reject') => {
        setLoadingId(clubId)
        try {
            const res = await validateSaaSTransfer(clubId, action)
            if (res.success) {
                toast.success(res.message)
                setPending(prev => prev.filter(c => c.id !== clubId))
            } else {
                toast.error(res.error || "Error al procesar")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setLoadingId(null)
        }
    }

    if (pending.length === 0) return null

    return (
        <div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-6 space-y-6 overflow-hidden relative mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.05] blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Shield className="text-blue-400 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white leading-tight">Validaciones SaaS</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Transferencias pendientes</p>
                    </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{pending.length} Pendientes</span>
                </div>
            </div>

            <div className="grid gap-4 relative z-10">
                {pending.map((club) => (
                    <div key={club.id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                                <Building2 className="text-slate-400 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base">{club.name}</h3>
                                <p className="text-xs text-slate-500">{club.users[0]?.email || 'Sin email'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase">
                                        Plan: {club.targetPlan?.name || 'Pro'}
                                    </span>
                                    <span className="text-[10px] font-black bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded uppercase">
                                        {club.pendingBillingCycle === 'yearly' ? 'Anual' : 'Mensual'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 px-4 border-l border-white/[0.05]">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Referencia</p>
                            <p className="text-sm font-mono text-blue-400">{club.subscriptionReference || 'Sin ref'}</p>
                            {club.subscriptionReceiptUrl && (
                                <a 
                                    href={club.subscriptionReceiptUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-white underline flex items-center gap-1 mt-1"
                                >
                                    Ver Comprobante <ExternalLink size={10} />
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAction(club.id, 'reject')}
                                disabled={!!loadingId}
                                className="flex-1 md:flex-none h-10 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={16} />
                                <span className="md:hidden lg:inline text-xs font-bold">Rechazar</span>
                            </button>
                            <button
                                onClick={() => handleAction(club.id, 'approve')}
                                disabled={!!loadingId}
                                className="flex-1 md:flex-none h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                            >
                                {loadingId === club.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                <span className="md:hidden lg:inline text-xs font-bold">Aprobar y Activar</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
