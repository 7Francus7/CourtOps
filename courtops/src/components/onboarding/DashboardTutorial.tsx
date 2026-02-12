
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
       X,
       ChevronRight,
       ChevronLeft,
       CheckCircle2,
       MousePointer2,
       Store,
       Settings,
       Smartphone,
       PartyPopper,
       CalendarDays,
       BarChart3
} from 'lucide-react'

const TUTORIAL_STEPS = [
       {
              title: "¡Bienvenido a CourtOps! 🚀",
              description: "Tu nuevo sistema de gestión integral. Te guiaremos brevemente por las secciones clave para que domines tu club desde el primer minuto.",
              icon: PartyPopper,
              color: "text-amber-500",
              highlight: "center"
       },
       {
              title: "Tu Agenda Digital 📅",
              description: "El corazón de tu club. Haz clic en cualquier espacio vacío para crear una reserva. Arrastra y suelta para mover turnos. Todo se sincroniza en tiempo real.",
              icon: CalendarDays,
              color: "text-blue-500",
              highlight: "El panel principal con la grilla de horarios."
       },
       {
              title: "Punto de Venta (Kiosco) 🛒",
              description: "¿Vendes bebidas o alquileres? Usa el botón 'Kiosco' en el menú inferior o 'Ventas' en una reserva para sumar productos a la cuenta del cliente.",
              icon: Store,
              color: "text-purple-500",
              highlight: "Botón 'Kiosco' en la barra de navegación o dentro de las reservas."
       },
       {
              title: "Reportes y Métricas 📊",
              description: "Toma decisiones basadas en datos. Visualiza tus ingresos diarios, ocupación semanal y productos más vendidos en la sección de Reportes.",
              icon: BarChart3,
              color: "text-emerald-500",
              highlight: "Pestaña 'Reportes' en el menú."
       },
       {
              title: "Configuración Total ⚙️",
              description: "Personaliza precios, horarios de apertura, nombres de canchas y más desde el panel de configuración. Adapta CourtOps a tu medida.",
              icon: Settings,
              color: "text-zinc-500",
              highlight: "Icono de engranaje ⚙️ en el menú."
       },
       {
              title: "Tu App en el Móvil 📱",
              description: "Lleva tu club en el bolsillo. CourtOps funciona como una App nativa en tu celular. ¡Instálala desde el navegador!",
              icon: Smartphone,
              color: "text-rose-500",
              highlight: "Accede desde tu navegador móvil."
       }
]

export default function DashboardTutorial() {
       const [isOpen, setIsOpen] = useState(false)
       const [currentStep, setCurrentStep] = useState(0)

       useEffect(() => {
              const hasSeen = localStorage.getItem('courtops_tutorial_v2')
              if (!hasSeen) {
                     setIsOpen(true)
              }
       }, [])

       const handleClose = () => {
              localStorage.setItem('courtops_tutorial_v2', 'true')
              setIsOpen(false)
       }

       const nextStep = () => {
              if (currentStep < TUTORIAL_STEPS.length - 1) {
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

       const step = TUTORIAL_STEPS[currentStep]
       const Icon = step.icon

       return (
              <AnimatePresence>
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                   animate={{ opacity: 1, scale: 1, y: 0 }}
                                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                   className="bg-[#09090b] border border-white/10 rounded-[2rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
                            >
                                   {/* Background decoration */}
                                   <div className={`absolute top-0 right-0 w-64 h-64 ${step.color.replace('text-', 'bg-')}/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 transition-colors duration-500`} />

                                   <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
                                          <button
                                                 onClick={handleClose}
                                                 className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                          >
                                                 <X size={20} />
                                          </button>

                                          <motion.div
                                                 key={currentStep}
                                                 initial={{ opacity: 0, x: 20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: -20 }}
                                                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                 className="flex flex-col items-center w-full"
                                          >
                                                 <div className={`p-6 rounded-3xl bg-white/5 ${step.color} mb-6 shadow-2xl ring-1 ring-white/5 relative group`}>
                                                        <div className={`absolute inset-0 ${step.color.replace('text-', 'bg-')}/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                        <Icon size={48} strokeWidth={1.5} className="relative z-10" />
                                                 </div>

                                                 <h2 className="text-3xl font-black text-white mb-3 tracking-tight leading-tight">
                                                        {step.title}
                                                 </h2>

                                                 <p className="text-zinc-400 text-base leading-relaxed mb-6 max-w-sm font-medium">
                                                        {step.description}
                                                 </p>

                                                 {step.highlight !== "center" && (
                                                        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-zinc-300 font-mono mb-6 flex items-center gap-2">
                                                               <MousePointer2 size={14} className="text-emerald-400" />
                                                               <span>Encuéntralo: <span className="text-white font-bold">{step.highlight}</span></span>
                                                        </div>
                                                 )}
                                          </motion.div>

                                          {/* Navigation Footer */}
                                          <div className="w-full flex items-center justify-between mt-4 md:mt-6 pt-6 border-t border-white/5">
                                                 {/* Progressive dots */}
                                                 <div className="flex gap-2">
                                                        {TUTORIAL_STEPS.map((_, i) => (
                                                               <div
                                                                      key={i}
                                                                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 bg-white/10'
                                                                             }`}
                                                               />
                                                        ))}
                                                 </div>

                                                 <div className="flex gap-3">
                                                        {currentStep > 0 && (
                                                               <button
                                                                      onClick={prevStep}
                                                                      className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95"
                                                               >
                                                                      <ChevronLeft size={20} />
                                                               </button>
                                                        )}
                                                        <button
                                                               onClick={nextStep}
                                                               className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95 hover:shadow-amber-500/40"
                                                        >
                                                               {currentStep === TUTORIAL_STEPS.length - 1 ? (
                                                                      <>¡Listo! <CheckCircle2 size={16} /></>
                                                               ) : (
                                                                      <>Siguiente <ChevronRight size={16} /></>
                                                               )}
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </AnimatePresence>
       )
}
