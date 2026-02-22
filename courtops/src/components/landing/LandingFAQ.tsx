
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
       Accordion,
       AccordionContent,
       AccordionItem,
       AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LandingFAQ() {
       const FAQS = [
              {
                     question: "¿Puedo probar el sistema antes de pagar?",
                     answer: "¡Sí! Tienes 14 días de prueba completamente gratis, sin necesidad de ingresar tarjeta de crédito. Podrás usar todas las funcionalidades para ver si se adapta a tu club."
              },
              {
                     question: "¿Sirve para otros deportes además de Padel?",
                     answer: "Absolutamente. CourtOps está optimizado para Padel, Tenis, Fútbol 5/7/11, Squash y cualquier deporte que requiera reserva de turnos por horario."
              },
              {
                     question: "¿Necesito instalar algo en mi computadora?",
                     answer: "No. CourtOps es 100% en la nube. Puedes acceder desde cualquier PC, tablet o celular con internet. No ocupamos espacio ni requerimos servidores costosos."
              },
              {
                     question: "¿Qué pasa si tengo mala conexión a internet?",
                     answer: "El sistema es muy liviano y funciona incluso con conexiones 4G/5G básicas. Si te quedas sin internet, puedes seguir operando desde el celular sin demoras."
              },
              {
                     question: "¿Puedo cobrar señas online?",
                     answer: "Sí. Nos integramos con MercadoPago para que puedas solicitar una seña automática para confirmar la reserva, reduciendo el ausentismo a cero garantizado."
              },
              {
                     question: "¿Es difícil de configurar?",
                     answer: "Para nada. La configuración inicial toma menos de 10 minutos. Cargamos tus canchas, horarios y precios, y listo. Además, te guiamos por WhatsApp si tienes la mínima duda."
              }
       ]

       return (
              <section className="py-24 px-4 md:px-6 bg-white dark:bg-black relative overflow-hidden" id="faq">
                     {/* Atmospheric Lighting */}
                     <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
                     <div className="absolute bottom-0 right-14 w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />

                     <div className="max-w-4xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="text-center mb-16 md:mb-20 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                                          <HelpCircle size={14} className="text-emerald-500" />
                                          Soporte 24/7
                                   </div>
                                   <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] flex flex-col">
                                          Dudas
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 pb-2">
                                                 Frecuentes.
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-500 font-medium max-w-2xl mx-auto tracking-tight">
                                          Respuestas claras para que puedas dar el siguiente paso con total confianza.
                                   </p>
                            </motion.div>

                            {/* FAQ Accordion */}
                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                   <Accordion type="single" collapsible className="w-full space-y-5">
                                          {FAQS.map((faq, i) => (
                                                 <AccordionItem
                                                        key={i}
                                                        value={`item-${i}`}
                                                        className="border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] backdrop-blur-md rounded-2xl px-5 md:px-8 data-[state=open]:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:data-[state=open]:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)] data-[state=open]:bg-white dark:data-[state=open]:bg-white/[0.04] data-[state=open]:border-emerald-500/30 transition-all duration-500 overflow-hidden relative group"
                                                 >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-teal-500/0 to-emerald-500/0 group-data-[state=open]:from-emerald-500/5 group-data-[state=open]:via-teal-500/5 group-data-[state=open]:to-emerald-500/5 transition-colors duration-500 -z-10" />
                                                        <AccordionTrigger className="text-slate-900 dark:text-white hover:text-emerald-500 hover:no-underline text-left font-black py-6 md:py-8 text-lg md:text-xl tracking-tighter uppercase transition-colors relative z-10">
                                                               {faq.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-slate-600 dark:text-zinc-400 leading-relaxed pb-6 md:pb-8 text-sm md:text-base font-medium relative z-10">
                                                               {faq.answer}
                                                        </AccordionContent>
                                                 </AccordionItem>
                                          ))}
                                   </Accordion>
                            </motion.div>

                            {/* Bottom CTA */}
                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, delay: 0.4 }}
                                   className="mt-20 text-center"
                            >
                                   <div className="mx-auto max-w-xl p-10 md:p-14 rounded-[3rem] bg-slate-900 text-white shadow-2xl flex flex-col items-center gap-8 relative overflow-hidden group">
                                          {/* Subtle glow hover effect */}
                                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-50 transition-opacity duration-700 pointer-events-none" />
                                          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

                                          <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-white backdrop-blur-2xl border border-white/20 group-hover:rotate-12 transition-transform duration-700">
                                                 <Sparkles size={40} strokeWidth={1.5} />
                                          </div>
                                          <div className="space-y-3">
                                                 <h3 className="text-3xl font-black tracking-tighter">¿Tienes un caso especial?</h3>
                                                 <p className="text-slate-400 font-medium text-lg leading-snug">
                                                        Contáctanos directamente. Adaptamos la ingeniería a las necesidades de tu complejo.
                                                 </p>
                                          </div>
                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20tengo%20una%20duda%20sobre%20CourtOps"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="btn-premium py-4 px-10 shadow-emerald-500/40 w-full sm:w-auto text-base"
                                          >
                                                 Hablar por WhatsApp <ArrowRight size={20} strokeWidth={3} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                          </a>
                                   </div>
                            </motion.div>

                     </div>
              </section>
       )
}
