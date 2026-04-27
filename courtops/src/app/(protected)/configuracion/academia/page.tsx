'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, User, Phone, Mail, Trash2, Edit2, GraduationCap, ArrowLeft, Loader2, Calendar, Users, BookOpen, TrendingUp } from 'lucide-react'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, getAcademiaStats } from '@/actions/teachers'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AcademiaConfigPage() {
       const [teachers, setTeachers] = useState<any[]>([])
       const [stats, setStats] = useState<any>(null)
       const [isLoading, setIsLoading] = useState(true)
       const [isModalOpen, setIsModalOpen] = useState(false)
       const [editingTeacher, setEditingTeacher] = useState<any | null>(null)
       const [activeTab, setActiveTab] = useState<'profesores' | 'clases'>('profesores')
const [formData, setFormData] = useState({
               name: '',
               phone: ''
        })

        async function loadTeachers() {
               setIsLoading(true)
               const [teacherRes, statsRes] = await Promise.all([getTeachers(), getAcademiaStats()])
               if (teacherRes.success) setTeachers(teacherRes.data)
               if (statsRes.success) setStats(statsRes.data)
               setIsLoading(false)
        }

        useEffect(() => {
               loadTeachers()
        }, [])

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              const loadingToast = toast.loading(editingTeacher ? 'Actualizando...' : 'Guardando...')

              const payload = {
                     name: formData.name,
                     phone: formData.phone
              }

              const res = editingTeacher 
                     ? await updateTeacher(editingTeacher.id, payload)
                     : await createTeacher(payload)

              toast.dismiss(loadingToast)

              if (res.success) {
                     toast.success(editingTeacher ? 'Profesor actualizado' : 'Profesor creado')
                     setIsModalOpen(false)
                     setEditingTeacher(null)
                     setFormData({ name: '', phone: '' })
                     loadTeachers()
              } else {
                     toast.error('Error al guardar')
              }
       }

       async function handleDelete(id: string) {
              if (!confirm('¿Seguro que desea eliminar a este profesor?')) return
              const res = await deleteTeacher(id)
              if (res.success) {
                     toast.success('Profesor eliminado')
                     loadTeachers()
              }
       }

       return (
              <div className="min-h-screen bg-transparent p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
                     {/* Header Section */}
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                            <div className="space-y-4">
                                   <Link 
                                          href="/configuracion" 
                                          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all text-xs font-black uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-full border border-border/40"
                                   >
                                          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                          Volver a Configuración
                                   </Link>
                                   
                                   <div className="flex items-center gap-4">
                                          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 ring-4 ring-primary/10">
                                                 <GraduationCap size={32} />
                                          </div>
                                          <div>
                                                 <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Academia</h1>
                                                 <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                                        <span className="w-8 h-[2px] bg-primary/30 rounded-full" />
                                                        Gestión de Staff Deportivo
                                                 </p>
                                          </div>
                                   </div>
                            </div>

                            <button 
                                   onClick={() => { setEditingTeacher(null); setFormData({ name: '', phone: '' }); setIsModalOpen(true) }}
                                   className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/30 active:scale-95 border-b-4 border-primary/40"
                            >
                                   <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                   Agregar Instructor
                            </button>
                     </div>

                     {/* Stats Quick Look */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                   { label: 'Profesores', value: teachers.length, icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                   { label: 'Clases este mes', value: stats?.classesThisMonth ?? '---', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                   { label: 'Alumnos mes', value: stats?.studentsThisMonth ?? '---', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                   { label: 'Próximas clases', value: stats?.upcomingClasses?.length ?? '---', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            ].map((stat, i) => (
                                   <motion.div 
                                          key={i}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: i * 0.1 }}
                                          className="bg-card/50 backdrop-blur-sm border border-border/60 p-5 rounded-[2rem] flex flex-col gap-3"
                                   >
                                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                                                 <stat.icon size={20} />
                                          </div>
                                          <div>
                                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                                 <p className="text-2xl font-black">{stat.value}</p>
                                          </div>
                                   </motion.div>
                            ))}
                     </div>

                     {/* Tabs */}
                     <div className="flex gap-1 bg-secondary/30 p-1 rounded-2xl w-fit">
                            {(['profesores', 'clases'] as const).map(tab => (
                                   <button
                                          key={tab}
                                          onClick={() => setActiveTab(tab)}
                                          className={cn(
                                                 'px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                                                 activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                          )}
                                   >
                                          {tab === 'profesores' ? 'Profesores' : 'Próximas Clases'}
                                   </button>
                            ))}
                     </div>

                     {/* Content Section */}
                     {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-6">
                                   <div className="relative">
                                          <Loader2 size={60} className="text-primary animate-spin" />
                                          <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
                                   </div>
                                   <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Sincronizando Staff...</p>
                            </div>
                     ) : activeTab === 'clases' ? (
                            <div>
                                   {!stats?.upcomingClasses?.length ? (
                                          <div className="bg-card/30 border-2 border-dashed border-border/60 rounded-[3rem] p-16 text-center">
                                                 <Calendar size={48} className="mx-auto mb-4 text-muted-foreground/20" />
                                                 <h3 className="text-xl font-black">Sin clases programadas</h3>
                                                 <p className="text-sm text-muted-foreground mt-2">Creá reservas de tipo CLASE desde el calendario para verlas aquí.</p>
                                          </div>
                                   ) : (
                                          <div className="space-y-3">
                                                 {stats.upcomingClasses.map((booking: any) => (
                                                        <div key={booking.id} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center justify-between gap-4">
                                                               <div className="flex items-center gap-4">
                                                                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                                             <BookOpen size={22} />
                                                                      </div>
                                                                      <div>
                                                                             <p className="font-bold text-foreground">{booking.teacher?.name || 'Sin asignar'}</p>
                                                                             <p className="text-xs text-muted-foreground">
                                                                                    {format(new Date(booking.startTime), "EEEE d 'de' MMMM, HH:mm", { locale: es })} hs · {booking.court?.name}
                                                                             </p>
                                                                      </div>
                                                               </div>
                                                               <div className="text-right shrink-0">
                                                                      {booking.client?.name ? (
                                                                             <span className="text-xs font-bold bg-secondary px-3 py-1 rounded-lg">{booking.client.name}</span>
                                                                      ) : (
                                                                             <span className="text-xs text-muted-foreground">Sin alumno</span>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   )}
                            </div>
                     ) : teachers.length === 0 ? (
                            <motion.div 
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   className="bg-card/30 backdrop-blur-md border-2 border-dashed border-border/60 rounded-[3rem] p-24 text-center space-y-6"
                            >
                                   <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/30 rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground/20 shadow-inner">
                                          <GraduationCap size={48} />
                                   </div>
                                   <div className="max-w-xs mx-auto space-y-2">
                                          <h3 className="text-2xl font-black tracking-tight">Tu Academia está vacía</h3>
                                          <p className="text-muted-foreground font-medium text-sm">Registra a tus profesores para que tus alumnos puedan reservar clases directamente online.</p>
                                   </div>
                                   <button 
                                          onClick={() => setIsModalOpen(true)}
                                          className="text-primary font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8"
                                   >
                                          Registrar Primer Profesor
                                   </button>
                            </motion.div>
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                   {teachers.map((teacher, idx) => (
                                          <motion.div 
                                                 key={teacher.id}
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: idx * 0.05 }}
                                                 className="group relative bg-card border border-border/80 rounded-[2.5rem] p-8 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 overflow-hidden"
                                          >
                                                 {/* Background Accents */}
                                                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />
                                                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -ml-12 -mb-12" />

                                                 <div className="relative z-10 flex flex-col h-full">
                                                        <div className="flex items-start justify-between">
                                                               <div className="flex items-center gap-5">
                                                                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary text-2xl font-black shadow-inner border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                                                                             {teacher.name.charAt(0).toUpperCase()}
                                                                      </div>
                                                                      <div>
                                                                             <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{teacher.name}</h3>
                                                                             <div className="flex items-center gap-2 mt-1.5 focus:outline-none">
                                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                                                                                           Instructor Staff
                                                                                    </span>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="mt-8 space-y-4 flex-1">
                                                               <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40 group-hover:bg-primary/5 group-hover:border-primary/10 transition-all">
                                                                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm">
                                                                             <Phone size={14} />
                                                                      </div>
                                                                      <div className="flex flex-col">
                                                                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">WhatsApp / Cel</span>
                                                                             <span className="text-sm font-black">{teacher.phone || '---'}</span>
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40">
                                                                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-emerald-500 shadow-sm">
                                                                             <TrendingUp size={14} />
                                                                      </div>
                                                                      <div className="flex flex-col">
                                                                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Clases últimos 30d</span>
                                                                             <span className="text-sm font-black">{teacher.classesLast30 ?? 0} clases</span>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-border/60">
                                                               <div className="flex items-center gap-2">
                                                                      <button 
                                                                             onClick={() => { 
                                                                                    setEditingTeacher(teacher); 
                                                                                    setFormData({ name: teacher.name, phone: teacher.phone || '' }); 
                                                                                    setIsModalOpen(true) 
                                                                             }}
                                                                             className="p-3 bg-muted/50 hover:bg-primary text-muted-foreground hover:text-white rounded-xl transition-all duration-300"
                                                                      >
                                                                             <Edit2 size={18} />
                                                                      </button>
                                                                      <button 
                                                                             onClick={() => handleDelete(teacher.id)}
                                                                             className="p-3 bg-muted/50 hover:bg-red-500 text-muted-foreground hover:text-white rounded-xl transition-all duration-300"
                                                                      >
                                                                             <Trash2 size={18} />
                                                                      </button>
                                                               </div>

                                                               <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/40 px-3 py-1.5 rounded-lg">
                                                                      ID: {teacher.id.slice(0, 8)}
                                                               </div>
                                                        </div>
                                                 </div>
                                          </motion.div>
                                   ))}
                            </div>
                     )}

                     {/* Premium Modal */}
                     <AnimatePresence>
                            {isModalOpen && (
                                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                                          <motion.div 
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 onClick={() => setIsModalOpen(false)}
                                                 className="absolute inset-0 bg-background/60 backdrop-blur-xl" 
                                          />
                                          <motion.div 
                                                 initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                                 className="bg-card border border-border w-full max-w-xl rounded-[3.5rem] shadow-[0_64px_128px_-24px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden"
                                          >
                                                 {/* Modal Header */}
                                                 <div className="bg-gradient-to-r from-primary to-primary/80 p-8 sm:p-10 flex items-center justify-between text-primary-foreground relative overflow-hidden">
                                                        <div className="relative z-10">
                                                               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                                                                      <User size={24} />
                                                               </div>
                                                               <h2 className="text-3xl font-black tracking-tight">{editingTeacher ? 'Actualizar Staff' : 'Ingresar Staff'}</h2>
                                                               <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">Completa el perfil del instructor</p>
                                                        </div>
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                                 </div>

                                                 <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                                                        <div className="space-y-6">
                                                               {/* Input Field */}
                                                               <div className="space-y-2 group">
                                                                      <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">Nombre del Profesional</label>
                                                                      <div className="relative">
                                                                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                                                                    <User size={18} />
                                                                             </div>
                                                                             <input 
                                                                                    required
                                                                                    type="text" 
                                                                                    placeholder="Ej: Nicolás López"
                                                                                    value={formData.name}
                                                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                                    className="w-full bg-muted/50 border-2 border-transparent p-5 pl-14 rounded-[1.5rem] text-base font-black focus:bg-background focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 shadow-inner" 
                                                                             />
                                                                      </div>
                                                               </div>

                                                               {/* Input Field */}
                                                               <div className="space-y-2 group">
                                                                      <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">Teléfono Personal (WhatsApp)</label>
                                                                      <div className="relative">
                                                                             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                                                                    <Phone size={18} />
                                                                             </div>
                                                                             <input 
                                                                                    type="tel" 
                                                                                    placeholder="Ej: 351234567"
                                                                                    value={formData.phone}
                                                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                                    className="w-full bg-muted/50 border-2 border-transparent p-5 pl-14 rounded-[1.5rem] text-base font-black focus:bg-background focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 shadow-inner" 
                                                                             />
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                               <button 
                                                                      type="button"
                                                                      onClick={() => setIsModalOpen(false)}
                                                                      className="flex-1 p-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                                                               >
                                                                      Descartar
                                                               </button>
                                                               <button 
                                                                      type="submit"
                                                                      className="flex-[1.5] p-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-primary/20"
                                                               >
                                                                      {editingTeacher ? 'Guardar Cambios' : 'Confirmar Registro'}
                                                               </button>
                                                        </div>
                                                 </form>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </div>
       )
}
