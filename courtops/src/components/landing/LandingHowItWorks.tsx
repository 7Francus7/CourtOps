
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket } from 'lucide-react'

const steps = [
       {
              icon: UserPlus,
              step: "01",
              title: "Registrate Gratis",
              description: "Creá tu cuenta en 30 segundos. Sin tarjeta de crédito, sin compromisos.",
              color: "from-blue-500 to-blue-600",
              bg: "bg-blue-500/10 dark:bg-blue-500/20",
              text: "text-blue-600 dark:text-blue-400"
       },
       {
              icon: Settings,
              step: "02",
              title: "Configurá tu Club",
              description: "Cargá tus canchas, horarios y precios. Listo en menos de 10 minutos.",
              color: "from-emerald-500 to-green-600",
              bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
              text: "text-emerald-600 dark:text-emerald-400"
       },
       {
              icon: Rocket,
              step: "03",
              title: "Empezá a Crecer",
              description: "Tus clientes reservan solos, tus cobros se registran y vos descansás.",
              color: "from-orange-500 to-amber-500",
              bg: "bg-orange-500/10 dark:bg-orange-500/20",
              text: "text-orange-600 dark:text-orange-400"
       }
]

const containerVariants = {
       hidden: { opacity: 0 },
       visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
       }
}

const itemVariants = {
       hidden: { opacity: 0, y: 30 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } }
}

export default function LandingHowItWorks() {
       return (
              <section className="py-24 px-6 bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                            style={{
                                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                     />

                     <div className="max-w-6xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.6 }}
                                   className="text-center mb-20 space-y-4"
                            >
                                   <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20 dark:border-emerald-500/30">
                                          Simple y Rápido
                                   </span>
                                   <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                          Empezá en{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                                                 3 simples pasos
                                          </span>
                                   </h2>
                                   <p className="text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                                          Sin instalaciones, sin servidores, sin dolores de cabeza.
                                   </p>
                            </motion.div>

                            {/* Steps */}
                            <motion.div
                                   variants={containerVariants}
                                   initial="hidden"
                                   whileInView="visible"
                                   viewport={{ once: true, margin: "-100px" }}
                                   className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative"
                            >
                                   {/* Connecting Line (Desktop) */}
                                   <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-blue-200 via-emerald-200 to-orange-200 dark:from-blue-800 dark:via-emerald-800 dark:to-orange-800" />

                                   {steps.map((step, idx) => (
                                          <motion.div
                                                 key={idx}
                                                 variants={itemVariants}
                                                 className="relative text-center group"
                                          >
                                                 {/* Step Circle */}
                                                 <div className="relative mx-auto mb-8">
                                                        <div className={`w-20 h-20 mx-auto rounded-2xl ${step.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 relative z-10`}>
                                                               <step.icon size={32} className={step.text} strokeWidth={2} />
                                                        </div>
                                                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white text-xs font-black flex items-center justify-center shadow-lg z-20`}>
                                                               {step.step}
                                                        </div>
                                                 </div>

                                                 {/* Content */}
                                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {step.title}
                                                 </h3>
                                                 <p className="text-slate-500 dark:text-zinc-400 leading-relaxed font-medium text-sm max-w-xs mx-auto">
                                                        {step.description}
                                                 </p>
                                          </motion.div>
                                   ))}
                            </motion.div>
                     </div>
              </section>
       )
}
