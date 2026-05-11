'use client'

import React from 'react'
import { TrendingUp, Users, Clock, AlertTriangle, Ban, Receipt, CreditCard, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  method: string
  planName: string
  billingCycle: string
  issuedAt: string
  club: { name: string }
}

interface RevenueByMethod {
  method: string
  _sum: { amount: number | null }
}

interface BillingStats {
  active: number
  trial: number
  pendingValidation: number
  expiring7d: number
  expiring14d: number
  suspended: number
  mrr: number
  revenueByMethod: RevenueByMethod[]
  recentInvoices: Invoice[]
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function Stat({
  label,
  value,
  sub,
  icon: Icon,
  color = 'emerald',
  alert,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple'
  alert?: boolean
}) {
  const c = {
    emerald: { border: 'border-l-emerald-500', icon: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    blue: { border: 'border-l-blue-500', icon: 'text-blue-400', bg: 'bg-blue-500/10' },
    amber: { border: 'border-l-amber-500', icon: 'text-amber-400', bg: 'bg-amber-500/10' },
    red: { border: 'border-l-red-500', icon: 'text-red-400', bg: 'bg-red-500/10' },
    purple: { border: 'border-l-purple-500', icon: 'text-purple-400', bg: 'bg-purple-500/10' },
  }[color]

  return (
    <div className={cn('bg-[#0f172a] border border-white/[0.06] border-l-2 rounded-2xl p-5 flex flex-col gap-3', c.border)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon size={16} className={c.icon} />
        </div>
        {alert && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border bg-amber-500/15 text-amber-400 border-amber-500/20">
            Atención
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
        <div className="text-sm font-semibold text-slate-400 mt-1">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export default function BillingDashboard({ stats }: { stats: BillingStats }) {
  const transferRevenue = stats.revenueByMethod.find(r => r.method === 'TRANSFER')?._sum.amount ?? 0
  const mpRevenue = stats.revenueByMethod.find(r => r.method === 'MERCADOPAGO')?._sum.amount ?? 0
  const totalMonthRevenue = transferRevenue + mpRevenue

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-white">Panel de Facturación</h2>
        <p className="text-xs text-slate-500 mt-0.5">Estado del negocio en tiempo real</p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="MRR" value={formatARS(stats.mrr)} sub="Ingresos mensuales recurrentes" icon={TrendingUp} color="emerald" />
        <Stat label="Clubes activos" value={stats.active} sub="Suscripciones pagadas" icon={Users} color="blue" />
        <Stat
          label="Vencen en 7 días"
          value={stats.expiring7d}
          sub={`${stats.expiring14d} en 14 días`}
          icon={AlertTriangle}
          color="amber"
          alert={stats.expiring7d > 0}
        />
        <Stat
          label="Suspendidos"
          value={stats.suspended}
          sub="Sin pago tras período de gracia"
          icon={Ban}
          color={stats.suspended > 0 ? 'red' : 'emerald'}
        />
      </div>

      {/* Revenue breakdown */}
      <div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Ingresos este mes</p>
            <p className="text-2xl font-black text-white mt-1">{formatARS(totalMonthRevenue)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              Trial: {stats.trial} · Pendiente: {stats.pendingValidation}
            </span>
          </div>
        </div>

        {totalMonthRevenue > 0 && (
          <div className="space-y-2">
            {transferRevenue > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-emerald-400" />
                  <span className="text-slate-400">Transferencia bancaria</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{formatARS(transferRevenue)}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {Math.round((transferRevenue / totalMonthRevenue) * 100)}%
                  </span>
                </div>
              </div>
            )}
            {mpRevenue > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-blue-400" />
                  <span className="text-slate-400">MercadoPago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{formatARS(mpRevenue)}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {Math.round((mpRevenue / totalMonthRevenue) * 100)}%
                  </span>
                </div>
              </div>
            )}
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                style={{ width: `${totalMonthRevenue > 0 ? Math.min(100, (transferRevenue / (stats.mrr || 1)) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent invoices */}
      {stats.recentInvoices.length > 0 && (
        <div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.04] flex items-center gap-3">
            <Receipt size={16} className="text-slate-400" />
            <h3 className="text-sm font-black text-white">Últimas facturas</h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {stats.recentInvoices.slice(0, 8).map((inv) => (
              <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Receipt size={14} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{inv.club?.name ?? '—'}</p>
                    <p className="text-[10px] text-slate-500">
                      {inv.number} · {inv.planName} · {inv.billingCycle === 'yearly' ? 'Anual' : 'Mensual'} · {inv.method === 'TRANSFER' ? 'Transf.' : 'MP'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{formatARS(inv.amount)}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(inv.issuedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
