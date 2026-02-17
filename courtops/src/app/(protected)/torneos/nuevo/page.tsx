'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTournament } from '@/actions/tournaments'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Trophy, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export default function NewTournamentPage() {
       const router = useRouter()
       const { t } = useLanguage()
       const [loading, setLoading] = useState(false)
       const [formData, setFormData] = useState({
              name: '',
              startDate: new Date().toISOString().split('T')[0],
              endDate: ''
       })

       // Derived state for better UX
       const isFormValid = formData.name.trim().length > 0 && formData.startDate

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!isFormValid) return

              setLoading(true)

              try {
                     const res = await createTournament({
                            name: formData.name,
                            startDate: new Date(formData.startDate),
                            endDate: formData.endDate ? new Date(formData.endDate) : undefined
                     })

                     if (res.success && res.tournament) {
                            toast.success(t('success_creating_tournament'))
                            router.push(`/torneos/${res.tournament.id}`)
                     } else {
                            toast.error(t('error_creating_tournament') + ': ' + res.error)
                     }
              } catch (error) {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
                     <div className="w-full max-w-2xl space-y-8">

                            {/* Navigation */}
                            <div className="flex items-center">
                                   <Link
                                          href="/torneos"
                                          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                                   >
                                          <div className="p-2 rounded-full bg-card group-hover:bg-accent border border-border/50 group-hover:border-border transition-all">
                                                 <ArrowLeft size={16} />
                                          </div>
                                          {t('back_to_tournaments')}
                                   </Link>
                            </div>

                            {/* Main Card */}
                            <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-xl">
                                   {/* Header with Pattern */}
                                   <div className="relative h-32 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden flex items-center px-8">
                                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                          <div className="relative z-10 flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] backdrop-blur-sm border border-[var(--primary)]/20">
                                                        <Trophy size={24} />
                                                 </div>
                                                 <div>
                                                        <h1 className="text-2xl font-black text-white">{t('new_tournament')}</h1>
                                                        <p className="text-slate-400 text-sm">{t('new_tournament_desc')}</p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="p-8">
                                          <form onSubmit={handleSubmit} className="space-y-8">
                                                 {/* Name Input */}
                                                 <div className="space-y-2 group">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                                                               {t('tournament_name')}
                                                        </label>
                                                        <div className="relative">
                                                               <input
                                                                      required
                                                                      autoFocus
                                                                      type="text"
                                                                      value={formData.name}
                                                                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                      className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-4 text-lg font-bold outline-none focus:border-[var(--primary)] focus:bg-background transition-all placeholder:text-muted-foreground/30"
                                                                      placeholder={t('tournament_name_placeholder')}
                                                               />
                                                               <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 pointer-events-none" size={20} />
                                                        </div>
                                                 </div>

                                                 {/* Dates Grid */}
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div className="space-y-2 group">
                                                               <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                                                                      {t('start_date')}
                                                               </label>
                                                               <div className="relative">
                                                                      <input
                                                                             required
                                                                             type="date"
                                                                             value={formData.startDate}
                                                                             onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                                             className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)] focus:bg-background transition-all font-medium"
                                                                      />
                                                                      <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 pointer-events-none" size={18} />
                                                               </div>
                                                        </div>

                                                        <div className="space-y-2 group">
                                                               <div className="flex justify-between">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-[var(--primary)] transition-colors">
                                                                             {t('end_date')}
                                                                      </label>
                                                                      <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                                                                             {t('optional')}
                                                                      </span>
                                                               </div>
                                                               <div className="relative">
                                                                      <input
                                                                             type="date"
                                                                             min={formData.startDate}
                                                                             value={formData.endDate}
                                                                             onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                                             className="w-full bg-muted/30 border-2 border-border rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)] focus:bg-background transition-all font-medium"
                                                                      />
                                                                      <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 pointer-events-none" size={18} />
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Actions */}
                                                 <div className="pt-6 flex gap-4">
                                                        <Link
                                                               href="/torneos"
                                                               className="flex-1 py-4 flex items-center justify-center rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
                                                        >
                                                               {t('cancel')}
                                                        </Link>

                                                        <button
                                                               type="submit"
                                                               disabled={loading || !isFormValid}
                                                               className={cn(
                                                                      "flex-[2] bg-[var(--primary)] text-[#111] font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:brightness-110",
                                                               )}
                                                        >
                                                               {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                                               {t('create')}
                                                        </button>
                                                 </div>
                                          </form>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}

