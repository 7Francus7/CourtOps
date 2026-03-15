'use client'

import { useState, useEffect } from 'react'
import { getWaivers, createWaiver, updateWaiver, deleteWaiver, getWaiverSignatures } from '@/actions/waivers'
import { FileText, Plus, Trash2, Eye, Shield, PenTool, X } from 'lucide-react'
import { toast } from 'sonner'

type WaiverData = {
  id: string
  title: string
  content: string
  isActive: boolean
  isRequired: boolean
  _count: { signatures: number }
}

export default function WaiversTab({ clubId }: { clubId: string }) {
  const [waivers, setWaivers] = useState<WaiverData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', isRequired: true })
  const [viewingSignatures, setViewingSignatures] = useState<{ waiverId: string; title: string; sigs: any[] } | null>(null)

  const load = async () => {
    setLoading(true)
    const data = await getWaivers()
    setWaivers(data as WaiverData[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Completá título y contenido')
      return
    }

    if (editingId) {
      const res = await updateWaiver(editingId, form)
      if (res.success) toast.success('Documento actualizado')
      else toast.error(res.error)
    } else {
      const res = await createWaiver(form)
      if (res.success) toast.success('Documento creado')
    }

    setShowForm(false)
    setEditingId(null)
    setForm({ title: '', content: '', isRequired: true })
    load()
  }

  const handleDelete = async (id: string) => {
    const res = await deleteWaiver(id)
    if (res.success) {
      toast.success('Documento eliminado')
      load()
    }
  }

  const handleViewSignatures = async (waiverId: string, title: string) => {
    const sigs = await getWaiverSignatures(waiverId)
    setViewingSignatures({ waiverId, title, sigs })
  }

  const handleEdit = (w: WaiverData) => {
    setForm({ title: w.title, content: w.content, isRequired: w.isRequired })
    setEditingId(w.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Documentos Legales</h3>
          <p className="text-xs text-muted-foreground font-medium">Deslinde de responsabilidad y acuerdos que los jugadores deben firmar.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', content: '', isRequired: true }) }}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
        >
          <Plus size={14} />
          Nuevo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card/60 border border-border rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-foreground text-sm">{editingId ? 'Editar Documento' : 'Nuevo Documento Legal'}</h4>
          <input
            className="input-theme w-full"
            placeholder="Título (ej: Deslinde de Responsabilidad)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input-theme w-full min-h-[200px] resize-y"
            placeholder="Contenido del documento legal..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
              className="w-4 h-4 rounded border-input bg-card text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground font-medium">Obligatorio antes de reservar</span>
          </label>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn-primary text-sm px-4 py-2">
              {editingId ? 'Guardar Cambios' : 'Crear Documento'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="text-sm px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : waivers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Sin documentos legales</p>
          <p className="text-xs mt-1">Creá un deslinde de responsabilidad para que los jugadores firmen antes de jugar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {waivers.map((w) => (
            <div key={w.id} className="flex items-center justify-between p-5 bg-card/40 border border-border/50 rounded-2xl hover:border-border transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{w.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {w.isRequired && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-md">OBLIGATORIO</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      <PenTool size={10} className="inline mr-1" />{w._count.signatures} firmas
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleViewSignatures(w.id, w.title)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Ver firmas">
                  <Eye size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => handleEdit(w)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Editar">
                  <FileText size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(w.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Eliminar">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signatures Modal */}
      {viewingSignatures && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingSignatures(null)}>
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">{viewingSignatures.title}</h3>
              <button onClick={() => setViewingSignatures(null)} className="p-1 rounded-lg hover:bg-muted">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            {viewingSignatures.sigs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin firmas aún</p>
            ) : (
              <div className="space-y-2">
                {viewingSignatures.sigs.map((sig: any) => (
                  <div key={sig.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {sig.client?.name || sig.guestName || 'Anónimo'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(sig.signedAt).toLocaleDateString('es-AR')} {new Date(sig.signedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <PenTool size={14} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
