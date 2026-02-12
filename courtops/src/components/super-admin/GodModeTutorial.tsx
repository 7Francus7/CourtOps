
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
       ShieldAlert
} from 'lucide-react'

const GOD_MODE_STEPS = [
       {
              title: "Omni Control ⚡",
              description: "Estás en el centro de mando de CourtOps. Aquí gestionas todos los clubes y la salud del sistema.",
              icon: Zap,
              color: "text-amber-500"
       },
       {
              title: "Stats Globales 📊",
              description: "Mira cuántos clubes están activos, el total de usuarios y las reservas globales en tiempo real.",
              icon: BarChart3,
              color: "text-blue-500"
       },
       {
              title: "Despliegue de Clubes 🏗️",
              description: "Crea un nuevo 'Entorno Tenant' en segundos. Solo ingresa el nombre y los datos del dueño, nosotros hacemos el resto.",
              icon: Layers,
              color: "text-purple-500"
       },
       {
              title: "Broadcast Global 📢",
              description: "¿Mantenimiento programado? ¿Nueva versión? Envía una notificación a TODOS los administradores o usuarios al instante.",
              icon: Radio,
              color: "text-emerald-500"
       },
       {
              title: "Gestión de Planes 💳",
              description: "Actualiza los precios de los planes Pro o Start directamente. Los cambios se reflejan en las pasarelas de pago.",
              icon: Activity,
              color: "text-rose-500"
       }
]

export default function GodModeTutorial() {
       const [isOpen, setIsOpen] = useState(false)
       const [currentStep, setCurrentStep] = useState(0)

       useEffect(() => {
              const hasSeen = localStorage.getItem('courtops_godmode_tutorial_v1')
              if (!hasSeen) {
                     setIsOpen(true)
              }
       }, [])

       const handleClose = () => {
              localStorage.setItem('courtops_godmode_tutorial_v1', 'true')
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
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.95 }}
                                   className="bg-zinc-900 border border-amber-500/20 rounded-[3rem] w-full max-w-xl shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden relative"
                            >
                                   <div className="absolute top-0 right-0 p-8 opacity-5">
                                          <ShieldAlert className="w-32 h-32 text-amber-500" />
                                   </div>

                                   <div className="p-10 md:p-14 flex flex-col items-center text-center">
                                          <button
                                                 onClick={handleClose}
                                                 className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                          >
                                                 <X size={20} />
                                          </button>

                                          <motion.div
                                                 key={currentStep}
                                                 initial={{ opacity: 0, x: 20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: -20 }}
                                                 className="flex flex-col items-center"
                                          >
                                                 <div className={`p-6 rounded-3xl bg-black/40 border border-white/5 ${step.color} mb-10 shadow-2xl`}>
                                                        <Icon size={56} strokeWidth={1} />
                                                 </div>

                                                 <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase italic">
                                                        {step.title}
                                                 </h2>

                                                 <p className="text-zinc-400 text-xl leading-relaxed mb-10 max-w-md font-medium">
                                                        {step.description}
                                                 </p>
                                          </motion.div>

                                          <div className="w-full flex items-center justify-between">
                                                 <div className="flex gap-2.5">
                                                        {GOD_MODE_STEPS.map((_, i) => (
                                                               <div
                                                                      key={i}
                                                                      className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-10 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'w-3 bg-white/10'
                                                                             }`}
                                                               />
                                                        ))}
                                                 </div>

                                                 <div className="flex gap-4">
                                                        {currentStep > 0 && (
                                                               <button
                                                                      onClick={prevStep}
                                                                      className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-bold uppercase text-xs tracking-widest"
                                                               >
                                                                      Atrás
                                                               </button>
                                                        )}
                                                        <button
                                                               onClick={nextStep}
                                                               className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-sm tracking-widest rounded-2xl transition-all flex items-center gap-3 shadow-[0_15px_30px_rgba(245,158,11,0.3)] active:scale-95"
                                                        >
                                                               {currentStep === GOD_MODE_STEPS.length - 1 ? 'Iniciar' : 'Siguiente'}
                                                               <ChevronRight size={20} strokeWidth={3} />
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </AnimatePresence>
       )
}
