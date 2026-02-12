
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
       PartyPopper
} from 'lucide-react'

const TUTORIAL_STEPS = [
       {
              title: "¡Bienvenido a CourtOps! 🎾",
              description: "Estamos muy felices de tenerte. Vamos a darte un tour rápido por las herramientas que harán crecer tu club.",
              icon: PartyPopper,
              color: "text-amber-500",
              image: "/tutorial/welcome.png" // We can use placeholders or just icons
       },
       {
              title: "Tu Agenda Digital 📅",
              description: "Controla todas tus canchas desde aquí. Haz click en cualquier horario vacío para crear una reserva en segundos. ¡Es así de simple!",
              icon: MousePointer2,
              color: "text-blue-500",
              target: "turnero" // To highlight if we had a highlighter
       },
       {
              title: "Ventas y Kiosco 🛒",
              description: "Vende bebidas, equipo o comida sin complicaciones. Todo se integra automáticamente con tu caja diaria.",
              icon: Store,
              color: "text-purple-500"
       },
       {
              title: "Configura tu Club ⚙️",
              description: "En el menú superior puedes cambiar precios, nombres de canchas y ver tus reportes de ganancias detallados.",
              icon: Settings,
              color: "text-zinc-500"
       },
       {
              title: "Tu App en el Móvil 📱",
              description: "Recuerda que puedes usar CourtOps desde tu celular. Es una WebApp optimizada para que gestiones el club desde la cancha.",
              icon: Smartphone,
              color: "text-green-500"
       }
]

export default function DashboardTutorial() {
       const [isOpen, setIsOpen] = useState(false)
       const [currentStep, setCurrentStep] = useState(0)

       useEffect(() => {
              const hasSeen = localStorage.getItem('courtops_tutorial_v1')
              if (!hasSeen) {
                     setIsOpen(true)
              }
       }, [])

       const handleClose = () => {
              localStorage.setItem('courtops_tutorial_v1', 'true')
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
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                   animate={{ opacity: 1, scale: 1, y: 0 }}
                                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                   className="bg-[#09090b] border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
                            >
                                   {/* Background decoration */}
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

                                   <div className="p-8 md:p-12 flex flex-col items-center text-center">
                                          <button
                                                 onClick={handleClose}
                                                 className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                          >
                                                 <X size={20} />
                                          </button>

                                          <motion.div
                                                 key={currentStep}
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 className="flex flex-col items-center"
                                          >
                                                 <div className={`p-5 rounded-3xl bg-white/5 ${step.color} mb-8 shadow-inner`}>
                                                        <Icon size={48} strokeWidth={1.5} />
                                                 </div>

                                                 <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                                                        {step.title}
                                                 </h2>

                                                 <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-sm">
                                                        {step.description}
                                                 </p>
                                          </motion.div>

                                          <div className="w-full flex items-center justify-between mt-4">
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
                                                                      className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
                                                               >
                                                                      <ChevronLeft size={24} />
                                                               </button>
                                                        )}
                                                        <button
                                                               onClick={nextStep}
                                                               className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-sm tracking-widest rounded-2xl transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95"
                                                        >
                                                               {currentStep === TUTORIAL_STEPS.length - 1 ? (
                                                                      <>Empezar Ahora <CheckCircle2 size={20} /></>
                                                               ) : (
                                                                      <>Siguiente <ChevronRight size={20} /></>
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
