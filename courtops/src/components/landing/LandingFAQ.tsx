
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
              <section className="py-24 md:py-32 px-4 md:px-6 bg-slate-50 dark:bg-[#030712] relative overflow-hidden" id="faq">
                     {/* Cinematic Background Glows */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                     <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                     <div className="max-w-4xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="text-center mb-16 md:mb-20 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                          <HelpCircle size={14} />
                                          Soporte 24/7
                                   </div>
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          Dudas{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                 Frecuentes
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                                          Respuestas claras para que puedas dar el siguiente paso con total confianza en CourtOps.
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
                                                        <AccordionTrigger className="text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:no-underline text-left font-bold py-5 md:py-7 text-base md:text-lg lg:text-xl relative z-10">
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
                                   <div className="mx-auto max-w-xl p-8 md:p-10 rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl flex flex-col items-center gap-6 backdrop-blur-xl relative overflow-hidden group">
                                          {/* Subtle glow hover effect */}
                                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                                                 <Sparkles size={32} />
                                          </div>
                                          <div className="space-y-2">
                                                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white">¿Tienes un caso especial?</h3>
                                                 <p className="text-slate-600 dark:text-zinc-400 font-medium">
                                                        Contáctanos directamente. Estamos listos para adaptar el sistema a las necesidades de tu club.
                                                 </p>
                                          </div>
                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20tengo%20una%20duda%20sobre%20CourtOps"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#20bd5a] hover:scale-105 transition-all shadow-lg active:scale-95 w-full sm:w-auto"
                                          >
                                                 Hablar por WhatsApp <ArrowRight size={20} strokeWidth={2.5} />
                                          </a>
                                   </div>
                            </motion.div>

                     </div>
              </section>
       )
}
