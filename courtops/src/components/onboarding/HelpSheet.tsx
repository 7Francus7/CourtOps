'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
       X,
       HelpCircle,
       BookOpen,
       Keyboard,
       MousePointer2,
       PlayCircle,
       MessageSquare,
       ChevronRight,
       Search,
       Zap,
       Calendar,
       Store,
       BarChart3,
       Settings,
       FileText,
       ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpSheetProps {
       isOpen: boolean
       onClose: () => void
       onRestartTutorial: () => void
}

const SHORTCUTS = [
       { key: 'N', label: 'Nueva Reserva' },
       { key: 'T', label: 'Ver Hoy (Calendario)' },
       { key: 'K', label: 'Abrir Kiosco' },
       { key: 'R', label: 'Ver Reportes' },
       { key: 'C', label: 'Vista Calendario' },
       { key: 'I', label: 'Vista Dashboard' },
       { key: 'L', label: 'Copiar Link Público' },
       { key: 'Ctrl + K', label: 'Buscador Global' },
]

const FAQS = [
       {
              q: '¿Cómo creo una reserva rápida?',
              a: 'En la grilla del calendario, haz clic en cualquier espacio vacío o presiona la tecla "N".',
              icon: Calendar,
              color: 'text-blue-500'
       },
       {
              q: '¿Cómo agrego productos a un turno?',
              a: 'Haz clic en una reserva existente y selecciona "Ventas" o usa el botón "Kiosco" para ventas directas.',
              icon: Store,
              color: 'text-purple-500'
       },
       {
              q: '¿Puedo usarlo en mi celular?',
              a: 'Sí, CourtOps es una PWA. Ábrelo en Chrome/Safari y selecciona "Agregar a pantalla de inicio".',
              icon: Zap,
              color: 'text-amber-500'
       },
       {
              q: '¿Dónde veo lo que vendí hoy?',
              a: 'Ve a la sección de "Reportes" o revisa el widget de "Caja" en el Dashboard.',
              icon: BarChart3,
              color: 'text-emerald-500'
       }
]

export default function HelpSheet({ isOpen, onClose, onRestartTutorial }: HelpSheetProps) {
       const [activeTab, setActiveTab] = useState<'guides' | 'shortcuts'>('guides')

       // Prevent body scroll when open
       useEffect(() => {
              if (isOpen) {
                     document.body.style.overflow = 'hidden'
              } else {
                     document.body.style.overflow = 'auto'
              }
              return () => {
                     document.body.style.overflow = 'auto'
              }
       }, [isOpen])

       return (
              <AnimatePresence>
                     {isOpen && (
                            <>
                                   {/* Backdrop */}
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          onClick={onClose}
                                          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]"
                                   />

                                   {/* Premium Help Drawer */}
                                   <motion.div
                                          initial={{ x: '100%', borderRadius: '3rem 0 0 3rem' }}
                                          animate={{ x: 0, borderRadius: '0' }}
                                          exit={{ x: '100%', borderRadius: '3rem 0 0 3rem' }}
                                          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
                                          className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-background shadow-[0_0_100px_rgba(0,0,0,0.4)] z-[1000] flex flex-col font-sans overflow-hidden border-l border-white/5"
                                   >
                                          {/* Immersive Header */}
                                          <div className="relative px-8 pt-10 pb-6 shrink-0 border-b border-white/5 bg-gradient-to-br from-card to-background">
                                                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-primary">
                                                        <HelpCircle size={120} />
                                                 </div>

                                                 <div className="relative z-10 flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Asistencia</p>
                                                               <h2 className="text-3xl font-black text-foreground tracking-tighter">Centro de Ayuda</h2>
                                                        </div>
                                                        <button
                                                               onClick={onClose}
                                                               className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all border border-white/5 shadow-inner"
                                                        >
                                                               <X size={24} />
                                                        </button>
                                                 </div>

                                                 <div className="mt-8 flex gap-2">
                                                        <button
                                                               onClick={() => setActiveTab('guides')}
                                                               className={cn(
                                                                      "flex-1 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                                                                      activeTab === 'guides'
                                                                             ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                                             : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                                                               )}
                                                        >
                                                               <BookOpen size={14} /> Guías Rápidas
                                                        </button>
                                                        <button
                                                               onClick={() => setActiveTab('shortcuts')}
                                                               className={cn(
                                                                      "flex-1 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                                                                      activeTab === 'shortcuts'
                                                                             ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                                             : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                                                               )}
                                                        >
                                                               <Keyboard size={14} /> Atajos
                                                        </button>
                                                 </div>
                                          </div>

                                          {/* Scrollable Content */}
                                          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar bg-background">
                                                 {activeTab === 'guides' ? (
                                                        <div className="space-y-6">
                                                               <div className="space-y-4">
                                                                      <div className="flex items-center gap-3">
                                                                             <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Preguntas Frecuentes</span>
                                                                             <div className="h-px bg-white/5 flex-1" />
                                                                      </div>

                                                                      {FAQS.map((faq, i) => (
                                                                             <motion.div
                                                                                    key={i}
                                                                                    initial={{ opacity: 0, y: 10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    transition={{ delay: i * 0.05 }}
                                                                                    className="group p-5 bg-card border border-white/5 rounded-[2rem] hover:border-primary/20 transition-all"
                                                                             >
                                                                                    <div className="flex gap-4">
                                                                                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shrink-0 bg-white/5", faq.color)}>
                                                                                                  <faq.icon size={20} />
                                                                                           </div>
                                                                                           <div className="space-y-1">
                                                                                                  <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors">{faq.q}</h4>
                                                                                                  <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">{faq.a}</p>
                                                                                           </div>
                                                                                    </div>
                                                                             </motion.div>
                                                                      ))}
                                                               </div>

                                                               <div className="space-y-4">
                                                                      <div className="flex items-center gap-3">
                                                                             <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Recurso Adicional</span>
                                                                             <div className="h-px bg-white/5 flex-1" />
                                                                      </div>

                                                                      <button
                                                                             onClick={() => {
                                                                                    onRestartTutorial()
                                                                                    onClose()
                                                                             }}
                                                                             className="w-full group p-5 bg-primary/10 border border-primary/20 rounded-[2rem] hover:bg-primary/20 transition-all flex items-center justify-between"
                                                                      >
                                                                             <div className="flex items-center gap-4">
                                                                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                                                           <PlayCircle size={24} />
                                                                                    </div>
                                                                                    <div className="text-left">
                                                                                           <h4 className="text-sm font-black text-white">Reiniciar Tour</h4>
                                                                                           <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Ver la introducción de nuevo</p>
                                                                                    </div>
                                                                             </div>
                                                                             <ChevronRight className="text-primary group-hover:translate-x-1 transition-transform" size={20} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <div className="space-y-6">
                                                               <div className="space-y-4">
                                                                      <div className="flex items-center gap-3">
                                                                             <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Teclado Maestro</span>
                                                                             <div className="h-px bg-white/5 flex-1" />
                                                                      </div>
                                                                      <p className="text-xs font-medium text-zinc-400 text-center bg-white/5 p-4 rounded-2xl italic">
                                                                             Domina el sistema como un profesional usando estos atajos rápidos desde el Dashboard.
                                                                      </p>

                                                                      <div className="grid grid-cols-1 gap-2">
                                                                             {SHORTCUTS.map((shortcut, i) => (
                                                                                    <div key={i} className="flex items-center justify-between p-4 bg-card border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                                                                           <span className="text-xs font-bold text-zinc-300">{shortcut.label}</span>
                                                                                           <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-primary min-w-[32px] text-center shadow-inner uppercase">
                                                                                                  {shortcut.key}
                                                                                           </kbd>
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Footer Actions */}
                                          <div className="p-8 border-t border-white/5 bg-card/50 flex flex-col gap-3 pb-safe">
                                                 <button
                                                        onClick={onClose}
                                                        className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 text-zinc-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all border border-white/5 shadow-inner"
                                                 >
                                                        <ArrowLeft size={16} />
                                                        Cerrar Centro de Ayuda
                                                 </button>
                                          </div>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}
