'use client'

import { useState } from 'react'
import { Building2, Link2, Unlink, ChevronDown, ChevronRight } from 'lucide-react'
import { linkClubAsBranch, unlinkBranch } from '@/actions/super-admin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type ClubNode = {
  id: string
  name: string
  slug: string
  parentClubId: string | null
  subscriptionStatus: string
  plan: string
  _count: { bookings: number; clients: number }
}

type Network = ClubNode & { branches: ClubNode[] }

export default function SedesManager({
  networks,
  allClubs,
}: {
  networks: Network[]
  allClubs: ClubNode[]
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [linking, setLinking] = useState(false)
  const [branchId, setBranchId] = useState('')
  const [parentId, setParentId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    if (!branchId || !parentId) return
    setLoading(true)
    const res = await linkClubAsBranch(branchId, parentId)
    setLoading(false)
    if (res.success) {
      toast.success('Sucursal vinculada')
      setBranchId(''); setParentId(''); setLinking(false)
      window.location.reload()
    } else {
      toast.error(res.error ?? 'Error al vincular')
    }
  }

  async function handleUnlink(clubId: string, name: string) {
    if (!confirm(`¿Desvincular ${name} como sucursal?`)) return
    const res = await unlinkBranch(clubId)
    if (res.success) { toast.success('Sucursal desvinculada'); window.location.reload() }
    else toast.error(res.error ?? 'Error')
  }

  const linkedBranchIds = new Set(allClubs.filter(c => c.parentClubId).map(c => c.id))
  const standaloneClubs = allClubs.filter(c => !c.parentClubId && !networks.some(n => n.id === c.id && networks.find(nn => nn.id === c.id)?.branches.length))

  return (
    <div className="bg-[#0f172a] border border-white/[0.06] rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-none">Red de Sedes</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Multi-sucursal y jerarquías</p>
          </div>
        </div>
        <button
          onClick={() => setLinking(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-black uppercase tracking-widest hover:bg-violet-500/20 transition-colors"
        >
          <Link2 size={12} />
          Vincular
        </button>
      </div>

      {/* Link form */}
      {linking && (
        <form onSubmit={handleLink} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vincular sucursal a club principal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Sucursal (branch)</label>
              <select value={branchId} onChange={e => setBranchId(e.target.value)} required
                className="w-full bg-[#0a0f1e] border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-violet-500 transition-colors">
                <option value="">Seleccionar club...</option>
                {allClubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.slug})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Club principal (parent)</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} required
                className="w-full bg-[#0a0f1e] border border-white/10 text-white text-xs p-3 rounded-xl outline-none focus:border-violet-500 transition-colors">
                <option value="">Seleccionar club...</option>
                {allClubs.filter(c => !c.parentClubId && c.id !== branchId).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.slug})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLinking(false)}
              className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-[1.5] py-2 rounded-xl bg-violet-500 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-400 disabled:opacity-50 transition-colors">
              {loading ? 'Vinculando...' : 'Confirmar vínculo'}
            </button>
          </div>
        </form>
      )}

      {/* Networks */}
      {networks.length === 0 && allClubs.length === 0 ? (
        <p className="text-center text-slate-600 text-sm py-8">No hay clubes registrados.</p>
      ) : networks.filter(n => n.branches.length > 0).length === 0 ? (
        <p className="text-center text-slate-600 text-sm py-6">
          No hay redes configuradas. Vinculá clubes para crear una jerarquía de sedes.
        </p>
      ) : (
        <div className="space-y-3">
          {networks.filter(n => n.branches.length > 0).map(network => (
            <div key={network.id} className="border border-white/[0.06] rounded-xl overflow-hidden">
              {/* Root club */}
              <button
                onClick={() => setExpanded(p => ({ ...p, [network.id]: !p[network.id] }))}
                className="w-full flex items-center gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left"
              >
                {expanded[network.id] ? <ChevronDown size={14} className="text-slate-500 shrink-0" /> : <ChevronRight size={14} className="text-slate-500 shrink-0" />}
                <Building2 size={16} className="text-violet-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{network.name}</p>
                  <p className="text-[10px] text-slate-500">{network.slug} · {network.branches.length} sucursal{network.branches.length !== 1 ? 'es' : ''}</p>
                </div>
                <span className={cn('text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest',
                  network.subscriptionStatus === 'authorized' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400')}>
                  {network.subscriptionStatus}
                </span>
              </button>

              {/* Branches */}
              {expanded[network.id] && (
                <div className="border-t border-white/[0.06]">
                  {network.branches.map(branch => (
                    <div key={branch.id} className="flex items-center gap-3 p-3 pl-10 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{branch.name}</p>
                        <p className="text-[10px] text-slate-600">{branch.slug} · {branch._count.clients} clientes · {branch._count.bookings} reservas</p>
                      </div>
                      <button
                        onClick={() => handleUnlink(branch.id, branch.name)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-600 transition-colors"
                        title="Desvincular sucursal"
                      >
                        <Unlink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
