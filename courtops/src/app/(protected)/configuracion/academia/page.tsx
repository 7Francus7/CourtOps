'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, User, Phone, Mail, Trash2, Edit2, GraduationCap, ArrowLeft, Loader2 } from 'lucide-react'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/actions/teachers'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AcademiaConfigPage() {
       const [teachers, setTeachers] = useState<any[]>([])
       const [isLoading, setIsLoading] = useState(true)
       const [isModalOpen, setIsModalOpen] = useState(false)
       const [editingTeacher, setEditingTeacher] = useState<any | null>(null)
       const [formData, setFormData] = useState({
              name: '',
              email: '',
              phone: '',
              specialization: ''
       })

       useEffect(() => {
              loadTeachers()
       }, [])

       async function loadTeachers() {
              setIsLoading(true)
              const res = await getTeachers()
              if (res.success) setTeachers(res.data)
              setIsLoading(false)
       }

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              const loadingToast = toast.loading(editingTeacher ? 'Actualizando...' : 'Guardando...')

              const res = editingTeacher 
                     ? await updateTeacher(editingTeacher.id, formData)
                     : await createTeacher(formData)

              toast.dismiss(loadingToast)

              if (res.success) {
                     toast.success(editingTeacher ? 'Profesor actualizado' : 'Profesor creado')
                     setIsModalOpen(false)
                     setEditingTeacher(null)
                     setFormData({ name: '', email: '', phone: '', specialization: '' })
                     loadTeachers()
              } else {
                     toast.error('Error al guardar')
              }
       }

       async function handleDelete(id: number) {
              if (!confirm('¿Seguro que desea eliminar a este profesor?')) return
              const res = await deleteTeacher(id)
              if (res.success) {
                     toast.success('Profesor eliminado')
                     loadTeachers()
              }
       }

       return (
              <div className="min-h-screen bg-transparent p-4 sm:p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
                     {/* Header */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                   <Link href="/configuracion" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold mb-2">
                                          <ArrowLeft size={14} />
                                          Configuración
                                   </Link>
                                   <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                 <GraduationCap size={24} />
                                          </div>
                                          <div>
                                                 <h1 className="text-3xl font-black tracking-tight text-foreground">Academia</h1>
                                                 <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.1em]">Gestión de Profesores e Instructores</p>
                                          </div>
                                   </div>
                            </div>
                            <button 
                                   onClick={() => { setEditingTeacher(null); setFormData({ name: '', email: '', phone: '', specialization: '' }); setIsModalOpen(true) }}
                                   className="group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
                            >
                                   <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                   Agregar Profesor
                            </button>
                     </div>

                     {/* Content */}
                     {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                   <Loader2 size={40} className="text-primary animate-spin" />
                                   <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Cargando Academia...</p>
                            </div>
                     ) : teachers.length === 0 ? (
                            <div className="bg-card border-2 border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
                                   <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto text-muted-foreground/30">
                                          <GraduationCap size={40} />
                                   </div>
                                   <div className="space-y-1">
                                          <h3 className="text-xl font-black">No hay profesores</h3>
                                          <p className="text-muted-foreground font-medium">Comience agregando instructores para su academia</p>
                                   </div>
                            </div>
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {teachers.map((teacher, idx) => (
                                          <motion.div 
                                                 key={teacher.id}
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: idx * 0.05 }}
                                                 className="group bg-card border border-border/60 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all relative overflow-hidden"
                                          >
                                                 <div className="flex items-start justify-between relative z-10">
                                                        <div className="flex items-center gap-4">
                                                               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black">
                                                                      {teacher.name.charAt(0).toUpperCase()}
                                                               </div>
                                                               <div>
                                                                      <h3 className="text-lg font-black">{teacher.name}</h3>
                                                                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                                                             {teacher.specialization || 'Instructor General'}
                                                                      </span>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="mt-6 space-y-3 relative z-10">
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                                                               <Phone size={14} className="text-primary" />
                                                               {teacher.phone || '---'}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                                                               <Mail size={14} className="text-primary" />
                                                               {teacher.email || '---'}
                                                        </div>
                                                 </div>

                                                 <div className="mt-8 flex items-center justify-end gap-2 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                               onClick={() => { setEditingTeacher(teacher); setFormData({ name: teacher.name, email: teacher.email || '', phone: teacher.phone || '', specialization: teacher.specialization || '' }); setIsModalOpen(true) }}
                                                               className="p-2.5 bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all"
                                                        >
                                                               <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                               onClick={() => handleDelete(teacher.id)}
                                                               className="p-2.5 bg-muted/50 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all"
                                                        >
                                                               <Trash2 size={16} />
                                                        </button>
                                                 </div>

                                                 <div className="absolute top-0 right-0 w-24 h-24 blur-3xl bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors" />
                                          </motion.div>
                                   ))}
                            </div>
                     )}

                     {/* Modal */}
                     <AnimatePresence>
                            {isModalOpen && (
                                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                          <motion.div 
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 onClick={() => setIsModalOpen(false)}
                                                 className="absolute inset-0 bg-background/80 backdrop-blur-md" 
                                          />
                                          <motion.div 
                                                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                 className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                                          >
                                                 <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                                        <div className="flex items-center gap-4 mb-2">
                                                               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                                      <User size={24} />
                                                               </div>
                                                               <div>
                                                                      <h2 className="text-xl font-black">{editingTeacher ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
                                                                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completa los datos del instructor</p>
                                                               </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                               <div className="space-y-1.5">
                                                                      <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Nombre Completo</label>
                                                                      <input 
                                                                             required
                                                                             type="text" 
                                                                             placeholder="Ej: Marcelo Díaz"
                                                                             value={formData.name}
                                                                             onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                             className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 border-border/60" 
                                                                      />
                                                               </div>

                                                               <div className="space-y-1.5">
                                                                      <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Especialidad</label>
                                                                      <input 
                                                                             type="text" 
                                                                             placeholder="Ej: Padel Adultos, Academia Niños"
                                                                             value={formData.specialization}
                                                                             onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                                                             className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 border-border/60" 
                                                                      />
                                                               </div>

                                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                      <div className="space-y-1.5">
                                                                             <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Teléfono</label>
                                                                             <input 
                                                                                    type="tel" 
                                                                                    placeholder="Ej: 351..."
                                                                                    value={formData.phone}
                                                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                                    className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 border-border/60" 
                                                                             />
                                                                      </div>
                                                                      <div className="space-y-1.5">
                                                                             <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Email</label>
                                                                             <input 
                                                                                    type="email" 
                                                                                    placeholder="instructor@..."
                                                                                    value={formData.email}
                                                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                                    className="w-full bg-muted/40 border border-border p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 border-border/60" 
                                                                             />
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="flex gap-3 pt-4">
                                                               <button 
                                                                      type="button"
                                                                      onClick={() => setIsModalOpen(false)}
                                                                      className="flex-1 p-4 bg-muted text-muted-foreground rounded-2xl font-black text-sm hover:bg-muted/80 transition-all"
                                                               >
                                                                      Cancelar
                                                               </button>
                                                               <button 
                                                                      type="submit"
                                                                      className="flex-2 p-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 px-8"
                                                               >
                                                                      {editingTeacher ? 'Actualizar Profesor' : 'Crear Profesor'}
                                                               </button>
                                                        </div>
                                                 </form>
                                          </motion.div>
                                   </div>
                            ) }
                     </AnimatePresence>
              </div>
       )
}
