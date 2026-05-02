'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, User, Phone, Trash2, Edit2, GraduationCap, ArrowLeft,
  Loader2, Calendar, Users, BookOpen, TrendingUp, Clock, X,
  ChevronDown, UserPlus, UserMinus, Check
} from 'lucide-react'
import {
  getTeachers, createTeacher, updateTeacher, deleteTeacher, getAcademiaStats,
  getClassSchedules, createClassSchedule, updateClassSchedule, deleteClassSchedule,
  getClassEnrollments, enrollClient, unenrollClient
} from '@/actions/teachers'
import { getClients } from '@/actions/clients'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type Teacher = { id: string; name: string; phone: string | null; classesLast30?: number }
type ClassSchedule = {
  id: string; name: string; description: string | null; dayOfWeek: number
  startTime: string; endTime: string; maxStudents: number; price: number; isActive: boolean
  teacher: { id: string; name: string }
  court: { id: number; name: string } | null
  enrollments: { id: string }[]
}
type Enrollment = { id: string; client: { id: number; name: string; phone: string } }
type Client = { id: number; name: string; phone: string }

type ScheduleFormData = {
  name: string; teacherId: string; courtId: string; description: string
  dayOfWeek: number; startTime: string; endTime: string; maxStudents: number; price: number
}

const defaultScheduleForm: ScheduleFormData = {
  name: '', teacherId: '', courtId: '', description: '',
  dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxStudents: 6, price: 0
}

export default function AcademiaConfigPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profesores' | 'horarios' | 'clases'>('profesores')

  // Teacher modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [teacherForm, setTeacherForm] = useState({ name: '', phone: '' })

  // Schedule modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null)
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>(defaultScheduleForm)

  // Enrollment panel
  const [enrollmentScheduleId, setEnrollmentScheduleId] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])

  const load = useCallback(async () => {
    setIsLoading(true)
    const [teacherRes, statsRes, schedulesRes] = await Promise.all([
      getTeachers(), getAcademiaStats(), getClassSchedules()
    ])
    if (teacherRes.success) setTeachers(teacherRes.data as Teacher[])
    if (statsRes.success) setStats(statsRes.data as Record<string, unknown>)
    if (schedulesRes.success) setSchedules(schedulesRes.data as ClassSchedule[])
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Client search for enrollment
  useEffect(() => {
    if (clientSearch.length < 2) { setClientResults([]); return }
    const timer = setTimeout(async () => {
      const res = await getClients(clientSearch)
      if (res.success) setClientResults(res.data as Client[])
    }, 300)
    return () => clearTimeout(timer)
  }, [clientSearch])

  // Load enrollments when panel opens
  useEffect(() => {
    if (!enrollmentScheduleId) { setEnrollments([]); return }
    setEnrollmentLoading(true)
    getClassEnrollments(enrollmentScheduleId).then(res => {
      if (res.success) setEnrollments(res.data as Enrollment[])
      setEnrollmentLoading(false)
    })
  }, [enrollmentScheduleId])

  // Teacher handlers
  async function handleTeacherSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = toast.loading(editingTeacher ? 'Actualizando...' : 'Guardando...')
    const res = editingTeacher
      ? await updateTeacher(editingTeacher.id, teacherForm)
      : await createTeacher(teacherForm)
    toast.dismiss(t)
    if (res.success) {
      toast.success(editingTeacher ? 'Profesor actualizado' : 'Profesor creado')
      setIsTeacherModalOpen(false); setEditingTeacher(null); setTeacherForm({ name: '', phone: '' }); load()
    } else { toast.error('Error al guardar') }
  }

  async function handleDeleteTeacher(id: string) {
    if (!confirm('¿Eliminar este profesor?')) return
    const res = await deleteTeacher(id)
    if (res.success) { toast.success('Profesor eliminado'); load() }
  }

  // Schedule handlers
  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = toast.loading(editingSchedule ? 'Actualizando...' : 'Guardando...')
    const payload = {
      ...scheduleForm,
      courtId: scheduleForm.courtId ? Number(scheduleForm.courtId) : undefined,
      maxStudents: Number(scheduleForm.maxStudents),
      price: Number(scheduleForm.price),
      dayOfWeek: Number(scheduleForm.dayOfWeek)
    }
    const res = editingSchedule
      ? await updateClassSchedule(editingSchedule.id, payload)
      : await createClassSchedule(payload)
    toast.dismiss(t)
    if (res.success) {
      toast.success(editingSchedule ? 'Horario actualizado' : 'Horario creado')
      setIsScheduleModalOpen(false); setEditingSchedule(null); setScheduleForm(defaultScheduleForm); load()
    } else { toast.error(res.error ?? 'Error al guardar') }
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm('¿Eliminar este horario?')) return
    const res = await deleteClassSchedule(id)
    if (res.success) { toast.success('Horario eliminado'); load() }
  }

  // Enrollment handlers
  async function handleEnroll(clientId: number) {
    if (!enrollmentScheduleId) return
    const res = await enrollClient(enrollmentScheduleId, clientId)
    if (res.success) {
      toast.success('Alumno inscripto')
      setClientSearch(''); setClientResults([])
      const enRes = await getClassEnrollments(enrollmentScheduleId)
      if (enRes.success) setEnrollments(enRes.data as Enrollment[])
    } else { toast.error(res.error ?? 'Error al inscribir') }
  }

  async function handleUnenroll(enrollmentId: string) {
    const res = await unenrollClient(enrollmentId)
    if (res.success) {
      toast.success('Alumno dado de baja')
      if (enrollmentScheduleId) {
        const enRes = await getClassEnrollments(enrollmentScheduleId)
        if (enRes.success) setEnrollments(enRes.data as Enrollment[])
      }
    } else { toast.error(res.error ?? 'Error') }
  }

  const activeEnrollmentSchedule = schedules.find(s => s.id === enrollmentScheduleId)

  return (
    <div className="bg-transparent p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-4">
          <Link href="/configuracion"
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all text-xs font-black uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-full border border-border/40">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver a Configuración
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 ring-4 ring-primary/10">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Academia</h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-primary/30 rounded-full" />
                Gestión de Staff Deportivo
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'profesores') {
              setEditingTeacher(null); setTeacherForm({ name: '', phone: '' }); setIsTeacherModalOpen(true)
            } else {
              setEditingSchedule(null); setScheduleForm(defaultScheduleForm); setIsScheduleModalOpen(true)
            }
          }}
          className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/30 active:scale-95 border-b-4 border-primary/40"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          {activeTab === 'profesores' ? 'Agregar Instructor' : 'Nuevo Horario'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Profesores', value: teachers.length, icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Horarios activos', value: schedules.length, icon: Clock, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Clases este mes', value: (stats?.classesThisMonth as number) ?? '---', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Alumnos mes', value: (stats?.studentsThisMonth as number) ?? '---', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-border/60 p-5 rounded-[2rem] flex flex-col gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg, stat.color)}>
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
        {(['profesores', 'horarios', 'clases'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {tab === 'profesores' ? 'Profesores' : tab === 'horarios' ? 'Horarios' : 'Próximas Clases'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 size={60} className="text-primary animate-spin" />
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Cargando Academia...</p>
        </div>
      ) : activeTab === 'clases' ? (
        // Upcoming classes tab
        <div>
          {!(stats?.upcomingClasses as unknown[])?.length ? (
            <div className="bg-card/30 border-2 border-dashed border-border/60 rounded-[3rem] p-16 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-xl font-black">Sin clases programadas</h3>
              <p className="text-sm text-muted-foreground mt-2">Las reservas de tipo CLASE aparecen aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats!.upcomingClasses as Array<{
                id: number; startTime: string | Date
                teacher?: { name: string }; court?: { name: string }; client?: { name: string }
              }>).map(booking => (
                <div key={booking.id} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <p className="font-bold">{booking.teacher?.name || 'Sin asignar'}</p>
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
      ) : activeTab === 'horarios' ? (
        // Class schedules tab
        <div>
          {schedules.length === 0 ? (
            <div className="bg-card/30 border-2 border-dashed border-border/60 rounded-[3rem] p-16 text-center">
              <Clock size={48} className="mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-xl font-black">Sin horarios configurados</h3>
              <p className="text-sm text-muted-foreground mt-2">Creá horarios fijos de clases con profesor, día y cupo máximo.</p>
              <button onClick={() => { setEditingSchedule(null); setScheduleForm(defaultScheduleForm); setIsScheduleModalOpen(true) }}
                className="mt-6 text-primary font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                Crear Primer Horario
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS.map((day, dayIdx) => {
                const daySchedules = schedules.filter(s => s.dayOfWeek === dayIdx)
                if (daySchedules.length === 0) return null
                return (
                  <div key={dayIdx}>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1 mb-2">{day}</p>
                    <div className="space-y-2">
                      {daySchedules.map(schedule => (
                        <div key={schedule.id}
                          className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                            <GraduationCap size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black">{schedule.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {schedule.startTime} – {schedule.endTime} · {schedule.teacher.name}
                              {schedule.court ? ` · ${schedule.court.name}` : ''}
                            </p>
                          </div>
                          <div className="text-center shrink-0">
                            <p className="text-lg font-black text-primary">{schedule.enrollments.length}/{schedule.maxStudents}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">alumnos</p>
                          </div>
                          {schedule.price > 0 && (
                            <div className="hidden sm:block text-center shrink-0">
                              <p className="text-sm font-black">${schedule.price.toLocaleString('es-AR')}</p>
                              <p className="text-[10px] text-muted-foreground">por clase</p>
                            </div>
                          )}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEnrollmentScheduleId(schedule.id)}
                              className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                              title="Gestionar alumnos">
                              <Users size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSchedule(schedule)
                                setScheduleForm({
                                  name: schedule.name, teacherId: schedule.teacher.id,
                                  courtId: schedule.court?.id?.toString() ?? '',
                                  description: schedule.description ?? '',
                                  dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime,
                                  endTime: schedule.endTime, maxStudents: schedule.maxStudents, price: schedule.price
                                })
                                setIsScheduleModalOpen(true)
                              }}
                              className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteSchedule(schedule.id)}
                              className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        // Teachers tab
        teachers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card/30 backdrop-blur-md border-2 border-dashed border-border/60 rounded-[3rem] p-24 text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/30 rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground/20 shadow-inner">
              <GraduationCap size={48} />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Tu Academia está vacía</h3>
              <p className="text-muted-foreground font-medium text-sm">Registrá profesores para que los alumnos puedan reservar clases online.</p>
            </div>
            <button onClick={() => setIsTeacherModalOpen(true)}
              className="text-primary font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
              Registrar Primer Profesor
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teachers.map((teacher, idx) => (
              <motion.div key={teacher.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="group relative bg-card border border-border/80 rounded-[2.5rem] p-8 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-primary text-2xl font-black shadow-inner border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{teacher.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">Instructor Staff</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4 flex-1">
                    <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm">
                        <Phone size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">WhatsApp / Cel</span>
                        <span className="text-sm font-black">{teacher.phone || '---'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-emerald-500 shadow-sm">
                        <TrendingUp size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Clases últimos 30d</span>
                        <span className="text-sm font-black">{teacher.classesLast30 ?? 0} clases</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-violet-500 shadow-sm">
                        <Clock size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Horarios asignados</span>
                        <span className="text-sm font-black">{schedules.filter(s => s.teacher.id === teacher.id).length} horarios</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingTeacher(teacher); setTeacherForm({ name: teacher.name, phone: teacher.phone || '' }); setIsTeacherModalOpen(true) }}
                        className="p-3 bg-muted/50 hover:bg-primary text-muted-foreground hover:text-white rounded-xl transition-all duration-300">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteTeacher(teacher.id)}
                        className="p-3 bg-muted/50 hover:bg-red-500 text-muted-foreground hover:text-white rounded-xl transition-all duration-300">
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
        )
      )}

      {/* Teacher Modal */}
      <AnimatePresence>
        {isTeacherModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTeacherModalOpen(false)} className="absolute inset-0 bg-background/60 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-card border border-border w-full max-w-xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-8 sm:p-10 flex items-center justify-between text-primary-foreground relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4"><User size={24} /></div>
                  <h2 className="text-3xl font-black tracking-tight">{editingTeacher ? 'Actualizar Staff' : 'Ingresar Staff'}</h2>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">Perfil del instructor</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              </div>
              <form onSubmit={handleTeacherSubmit} className="p-8 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-[0.2em]">Nombre del Profesional</label>
                  <div className="relative">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input required type="text" placeholder="Ej: Nicolás López" value={teacherForm.name}
                      onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      className="w-full bg-muted/50 border-2 border-transparent p-5 pl-14 rounded-[1.5rem] text-base font-black focus:bg-background focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-foreground ml-1 uppercase tracking-[0.2em]">Teléfono (WhatsApp)</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" placeholder="Ej: 351234567" value={teacherForm.phone}
                      onChange={e => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="w-full bg-muted/50 border-2 border-transparent p-5 pl-14 rounded-[1.5rem] text-base font-black focus:bg-background focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button type="button" onClick={() => setIsTeacherModalOpen(false)}
                    className="flex-1 p-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-muted transition-all active:scale-95">
                    Descartar
                  </button>
                  <button type="submit"
                    className="flex-[1.5] p-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-3">
                    {editingTeacher ? 'Guardar Cambios' : 'Confirmar Registro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)} className="absolute inset-0 bg-background/60 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-card border border-border w-full max-w-xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden my-4">
              <div className="bg-gradient-to-r from-violet-600 to-violet-500 p-8 flex items-center justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4"><Clock size={24} /></div>
                  <h2 className="text-3xl font-black">{editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}</h2>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">Clase recurrente semanal</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              </div>
              <form onSubmit={handleScheduleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nombre de la clase</label>
                    <input required type="text" placeholder="Ej: Padel iniciantes" value={scheduleForm.name}
                      onChange={e => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl text-sm font-bold focus:bg-background focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Profesor</label>
                    <select required value={scheduleForm.teacherId} onChange={e => setScheduleForm({ ...scheduleForm, teacherId: e.target.value })}
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl text-sm font-bold focus:bg-background focus:border-primary outline-none transition-all">
                      <option value="">Seleccionar profesor</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Día de la semana</label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_SHORT.map((d, i) => (
                        <button key={i} type="button" onClick={() => setScheduleForm({ ...scheduleForm, dayOfWeek: i })}
                          className={cn('py-2 rounded-xl text-xs font-black transition-all',
                            scheduleForm.dayOfWeek === i ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Inicio</label>
                    <input required type="time" value={scheduleForm.startTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl text-sm font-bold focus:bg-background focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Fin</label>
                    <input required type="time" value={scheduleForm.endTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl text-sm font-bold focus:bg-background focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Cupo máximo</label>
                    <input required type="number" min={1} max={30} value={scheduleForm.maxStudents}
                      onChange={e => setScheduleForm({ ...scheduleForm, maxStudents: Number(e.target.value) })}
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl text-sm font-bold focus:bg-background focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Precio por clase</label>
                    <input type="number" min={0} step={100} value={scheduleForm.price}
                      onChange={e => setScheduleForm({ ...scheduleForm, price: Number(e.target.value) })}
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl text-sm font-bold focus:bg-background focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setIsScheduleModalOpen(false)}
                    className="flex-1 p-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-muted transition-all active:scale-95">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-[1.5] p-4 bg-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    {editingSchedule ? 'Guardar Cambios' : 'Crear Horario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enrollment Panel (slide-over) */}
      <AnimatePresence>
        {enrollmentScheduleId && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setEnrollmentScheduleId(null); setClientSearch(''); setClientResults([]) }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-black text-lg">Alumnos inscritos</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeEnrollmentSchedule?.name} · {activeEnrollmentSchedule ? DAYS[activeEnrollmentSchedule.dayOfWeek] : ''}</p>
                </div>
                <button onClick={() => { setEnrollmentScheduleId(null); setClientSearch(''); setClientResults([]) }}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"><X size={18} /></button>
              </div>

              {/* Capacity bar */}
              {activeEnrollmentSchedule && (
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex justify-between text-xs font-black mb-2">
                    <span className="text-muted-foreground uppercase tracking-widest">Cupo</span>
                    <span>{enrollments.length}/{activeEnrollmentSchedule.maxStudents}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', enrollments.length >= activeEnrollmentSchedule.maxStudents ? 'bg-red-500' : 'bg-primary')}
                      style={{ width: `${Math.min(100, (enrollments.length / activeEnrollmentSchedule.maxStudents) * 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Add student */}
              <div className="px-6 py-4 border-b border-border">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Inscribir alumno</p>
                <input type="text" placeholder="Buscar por nombre..." value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm outline-none focus:border-primary transition-colors" />
                {clientResults.length > 0 && (
                  <div className="mt-2 border border-border rounded-2xl overflow-hidden">
                    {clientResults.slice(0, 4).map(c => {
                      const alreadyEnrolled = enrollments.some(e => e.client.id === c.id)
                      return (
                        <button key={c.id} type="button" disabled={alreadyEnrolled}
                          onClick={() => handleEnroll(c.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 disabled:opacity-40 transition-colors text-left">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-black shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.phone}</p>
                          </div>
                          {alreadyEnrolled ? (
                            <Check size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <UserPlus size={14} className="text-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Enrolled list */}
              <div className="flex-1 overflow-y-auto p-6">
                {enrollmentLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-10">
                    <Users size={32} className="mx-auto mb-3 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Sin alumnos inscritos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrollments.map(en => (
                      <div key={en.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black shrink-0">
                          {en.client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{en.client.name}</p>
                          <p className="text-xs text-muted-foreground">{en.client.phone}</p>
                        </div>
                        <button onClick={() => handleUnenroll(en.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors">
                          <UserMinus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
