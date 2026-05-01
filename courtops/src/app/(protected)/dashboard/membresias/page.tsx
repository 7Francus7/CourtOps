'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, Users, TrendingUp, AlertCircle, Plus, Search,
  ChevronRight, X, Check, Loader2, Ban, Calendar
} from 'lucide-react'
import { getMembershipsOverview, getActiveMembers, subscribeClient, cancelClientMembership } from '@/actions/memberships'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Plan = { id: string; name: string; price: number; durationDays: number; activeSubscribers: number }
type Member = {
  id: string
  clientId: number
  startDate: string | Date
  endDate: string | Date
  pricePaid: number
  status: string
  isExpiringSoon: boolean
  client: { id: number; name: string; phone: string; email: string | null }
  plan: { id: string; name: string; price: number; durationDays: number }
}
type Overview = { plans: Plan[]; activeCount: number; expiredCount: number; monthlyRevenue: number }

export default function MembresiasPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ov, mem] = await Promise.all([getMembershipsOverview(), getActiveMembers()])
      setOverview(ov as Overview)
      setMembers(mem as Member[])
    } catch { /* redirect handled by server */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = members.filter(m => {
    const matchSearch = m.client.name.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'all' || m.plan.id === filterPlan
    return matchSearch && matchPlan
  })

  async function handleCancel(membershipId: string, clientName: string) {
    if (!confirm(`¿Cancelar membresía de ${clientName}?`)) return
    const res = await cancelClientMembership(membershipId)
    if (res.success) { toast.success('Membresía cancelada'); load() }
    else toast.error(res.error ?? 'Error al cancelar')
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Crown size={20} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Membresías</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Gestioná suscripciones y planes activos del club</p>
        </div>
        <button
          onClick={() => setShowSubscribeModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          Suscribir Cliente
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Activos', value: overview?.activeCount ?? 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Vencidos', value: overview?.expiredCount ?? 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
              { label: 'Planes activos', value: overview?.plans.length ?? 0, icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Ingresos activos', value: `$${(overview?.monthlyRevenue ?? 0).toLocaleString('es-AR')}`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-3xl p-5 flex flex-col gap-3"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg, s.color)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  <p className="text-2xl font-black">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Plans summary */}
          {(overview?.plans.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview!.plans.map(plan => (
                <div key={plan.id} className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-black">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">${plan.price.toLocaleString('es-AR')}/mes · {plan.durationDays}d</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{plan.activeSubscribers}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">activos</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-sm font-medium outline-none focus:border-primary transition-colors"
              />
            </div>
            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-card border border-border text-sm font-medium outline-none focus:border-primary transition-colors"
            >
              <option value="all">Todos los planes</option>
              {overview?.plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Members list */}
          {filtered.length === 0 ? (
            <div className="bg-card border-2 border-dashed border-border rounded-3xl p-16 text-center">
              <Crown size={40} className="mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="font-black text-lg">Sin membresías activas</h3>
              <p className="text-sm text-muted-foreground mt-2">Suscribí clientes a un plan para verlos aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((m, i) => {
                const daysLeft = differenceInDays(new Date(m.endDate), new Date())
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'bg-card border rounded-2xl p-4 flex items-center gap-4',
                      m.isExpiringSoon ? 'border-amber-500/40 bg-amber-500/5' : 'border-border'
                    )}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg shrink-0">
                      {m.client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black truncate">{m.client.name}</p>
                      <p className="text-xs text-muted-foreground">{m.client.phone}</p>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{m.plan.name}</p>
                      <p className="text-sm font-bold">${m.pricePaid.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="text-center">
                      <p className={cn('text-xs font-black uppercase tracking-widest', daysLeft <= 7 ? 'text-amber-500' : daysLeft <= 0 ? 'text-red-500' : 'text-emerald-500')}>
                        {daysLeft <= 0 ? 'Vencido' : `${daysLeft}d`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(m.endDate), 'd MMM', { locale: es })}</p>
                    </div>
                    <button
                      onClick={() => handleCancel(m.id, m.client.name)}
                      className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors"
                      title="Cancelar membresía"
                    >
                      <Ban size={16} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Subscribe modal */}
      <AnimatePresence>
        {showSubscribeModal && (
          <SubscribeModal
            plans={overview?.plans ?? []}
            onClose={() => setShowSubscribeModal(false)}
            onSuccess={() => { setShowSubscribeModal(false); load() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SubscribeModal({ plans, onClose, onSuccess }: { plans: Plan[]; onClose: () => void; onSuccess: () => void }) {
  const [clientSearch, setClientSearch] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [saving, setSaving] = useState(false)
  const [clientId, setClientId] = useState<number | null>(null)
  const [clients, setClients] = useState<{ id: number; name: string; phone: string }[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  useEffect(() => {
    if (clientSearch.length < 2) { setClients([]); return }
    const timer = setTimeout(async () => {
      setLoadingClients(true)
      const { getClients } = await import('@/actions/clients')
      const res = await getClients(clientSearch)
      if (res.success) setClients(res.data as { id: number; name: string; phone: string }[])
      setLoadingClients(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [clientSearch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId || !selectedPlan) return
    setSaving(true)
    const res = await subscribeClient(clientId, selectedPlan, paymentMethod)
    setSaving(false)
    if (res.success) { toast.success('Membresía activada'); onSuccess() }
    else toast.error(res.error ?? 'Error al suscribir')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-background/70 backdrop-blur-xl" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-black">Suscribir Cliente</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client search */}
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Cliente</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setClientId(null) }}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            {loadingClients && <p className="text-xs text-muted-foreground px-1">Buscando...</p>}
            {clients.length > 0 && !clientId && (
              <div className="border border-border rounded-2xl overflow-hidden">
                {clients.slice(0, 5).map(c => (
                  <button key={c.id} type="button"
                    onClick={() => { setClientId(c.id); setClientSearch(c.name); setClients([]) }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-black shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                    {clientId === c.id && <Check size={14} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plan */}
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Plan</label>
            <div className="space-y-2">
              {plans.map(p => (
                <button key={p.id} type="button"
                  onClick={() => setSelectedPlan(p.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left',
                    selectedPlan === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}>
                  <div>
                    <p className="font-black text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.durationDays} días</p>
                  </div>
                  <p className="font-black text-primary">${p.price.toLocaleString('es-AR')}</p>
                </button>
              ))}
              {plans.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay planes configurados. Creá uno en Configuración.</p>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Método de pago</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm outline-none focus:border-primary transition-colors">
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="CARD">Tarjeta</option>
              <option value="MP">MercadoPago</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-border font-black text-sm hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!clientId || !selectedPlan || saving}
              className="flex-[1.5] py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Confirmar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
