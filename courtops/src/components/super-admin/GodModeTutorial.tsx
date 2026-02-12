
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
       X,
       ChevronRight,
       ChevronLeft,
       Zap,
       Radio,
       Layers,
       BarChart3,
       Activity,
       ShieldAlert,
       DatabaseZap,
       Globe
} from 'lucide-react'

const GOD_MODE_STEPS = [
       {
              title: "Omni Control Center ⚡",
              description: "Bienvenido al núcleo de CourtOps. Esta interfaz te otorga control absoluto sobre cada instancia del sistema.",
              icon: ShieldAlert,
              color: "text-amber-500",
              highlight: "Panel Principal"
       },
       {
              title: "Métricas Globales 🌍",
              description: "Monitorea la salud del ecosistema en tiempo real: Clubes Activos, Usuarios Totales y Reservas Diarias agregadas.",
              icon: Globe,
              color: "text-blue-500",
              highlight: "Tarjetas superiores (KPIs)"
       },
       {
              title: "Inyección de Tenants 💉",
              description: "Despliega nuevos entornos de club en milisegundos. El sistema aprovisiona base de datos, usuario admin y configuración inicial automáticamente.",
              icon: DatabaseZap,
              color: "text-emerald-500",
              highlight: "Formulario 'Nuevo Club'"
       },
       {
              title: "Gestión de Planes 💳",
              description: "Controla la economía de la plataforma. Ajusta los precios de las suscripciones (Start, Pro, Enterprise) y propaga los cambios instantáneamente.",
              icon: Activity,
              color: "text-rose-500",
              highlight: "Sección 'Planes del Sistema'"
       },
       {
              title: "Sistema de Broadcast 📢",
              description: "¿Mantenimiento crítico? Envía notificaciones push a todos los administradores o usuarios finales con un solo clic.",
              icon: Radio,
              color: "text-purple-500",
              highlight: "Panel de Notificaciones"
       },
       {
              title: "Diagnóstico y Logs 🛠️",
              description: "Accede a herramientas de depuración avanzadas y visualiza los logs del sistema para resolver incidencias rápidamente.",
              icon: Layers,
              color: "text-zinc-400",
              highlight: "Herramientas de Diagnóstico"
       }
]

export default function GodModeTutorial() {
       const [isOpen, setIsOpen] = useState(false)
       const [currentStep, setCurrentStep] = useState(0)

       useEffect(() => {
              const hasSeen = localStorage.getItem('courtops_godmode_v2')
              if (!hasSeen) {
                     setIsOpen(true)
              }
       }, [])

       const handleClose = () => {
              localStorage.setItem('courtops_godmode_v2', 'true')
              setIsOpen(false)
       }

       const nextStep = () => {
              if (currentStep < GOD_MODE_STEPS.length - 1) {
                     setCurrentStep(currentStep + 1)
              } else {
                     handleClose()
              }
       }

       const prevStep = () => {
              if (currentStep > 0) {
                     setCurrentStep(currentStep - 1)
              }
       }

       if (!isOpen) return null

       const step = GOD_MODE_STEPS[currentStep]
       const Icon = step.icon

       return (
              <AnimatePresence>
                     <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.95 }}
                                   transition={{ type: "spring", bounce: 0.4 }}
                                   className="bg-black border border-amber-500/30 rounded-[2rem] w-full max-w-2xl shadow-[0_0_150px_rgba(245,158,11,0.2)] overflow-hidden relative"
                            >
                                   {/* Background effects */}
                                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                          <Zap className="w-96 h-96 text-amber-500 rotate-12" />
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[400px]">
                                          {/* Left: Graphic */}
                                          <div className="bg-zinc-900/50 p-8 flex items-center justify-center relative border-r border-white/5">
                                                 <motion.div
                                                        key={currentStep}
                                                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                                        className={`relative z-10 p-8 rounded-3xl bg-black border border-white/10 ${step.color} shadow-2xl group`}
                                                 >
                                                        <div className={`absolute inset-0 ${step.color.replace('text-', 'bg-')}/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
                                                        <Icon size={80} strokeWidth={1} className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                                 </motion.div>
                                          </div>

                                          {/* Right: Content */}
                                          <div className="p-8 flex flex-col justify-center relative">
                                                 <button
                                                        onClick={handleClose}
                                                        className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                                 >
                                                        <X size={20} />
                                                 </button>

                                                 <div className="space-y-6">
                                                        <div>
                                                               <motion.div
                                                                      key={step.title}
                                                                      initial={{ opacity: 0, x: 20 }}
                                                                      animate={{ opacity: 1, x: 0 }}
                                                                      transition={{ delay: 0.1 }}
                                                               >
                                                                      <div className="flex items-center gap-2 mb-2">
                                                                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-800 px-2 py-1 rounded bg-zinc-900">
                                                                                    Paso {currentStep + 1} / {GOD_MODE_STEPS.length}
                                                                             </span>
                                                                             {step.highlight && (
                                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                                                                                           📍 {step.highlight}
                                                                                    </span>
                                                                             )}
                                                                      </div>
                                                                      <h2 className="text-3xl font-black text-white leading-none tracking-tight">
                                                                             {step.title}
                                                                      </h2>
                                                               </motion.div>

                                                               <motion.p
                                                                      key={step.description}
                                                                      initial={{ opacity: 0 }}
                                                                      animate={{ opacity: 1 }}
                                                                      transition={{ delay: 0.2 }}
                                                                      className="text-zinc-400 text-sm leading-relaxed mt-4 font-medium"
                                                               >
                                                                      {step.description}
                                                               </motion.p>
                                                        </div>

                                                        <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                                                               {currentStep > 0 && (
                                                                      <button
                                                                             onClick={prevStep}
                                                                             className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
                                                                      >
                                                                             <ChevronLeft size={16} />
                                                                      </button>
                                                               )}
                                                               <button
                                                                      onClick={nextStep}
                                                                      className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 group"
                                                               >
                                                                      {currentStep === GOD_MODE_STEPS.length - 1 ? 'Iniciar Consola' : 'Continuar'}
                                                                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                               </button>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </AnimatePresence>
       )
}
