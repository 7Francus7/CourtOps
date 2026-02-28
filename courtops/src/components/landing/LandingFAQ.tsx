'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
       Accordion,
       AccordionContent,
       AccordionItem,
       AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, ArrowRight, Sparkles, Plus, MessageSquare, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LandingFAQ() {
       const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

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
              <section className="py-24 px-4 md:px-8 bg-white dark:bg-black relative overflow-hidden" id="faq">
                     {/* Background High-Tech Grid */}
                     <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]" />
                     </div>

                     {/* Atmospheric Lighting */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[200px] pointer-events-none" />

                     <div className="max-w-4xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="text-center mb-24 space-y-8"
                            >
                                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl shadow-xl">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                          Centro de Soporte
                                   </div>
                                   <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] uppercase italic">
                                          Resolución <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500">Inmediata.</span>
                                   </h2>
                            </motion.div>

                            {/* FAQ Accordion */}
                            <div className="space-y-6">
                                   <Accordion type="single" collapsible className="w-full space-y-4">
                                          {FAQS.map((faq, i) => (
                                                 <motion.div
                                                        key={i}
                                                        onMouseEnter={() => setHoveredIdx(i)}
                                                        onMouseLeave={() => setHoveredIdx(null)}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: i * 0.1 }}
                                                 >
                                                        <AccordionItem
                                                               value={`item-${i}`}
                                                               className="border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] px-8 md:px-12 data-[state=open]:border-emerald-500/50 data-[state=open]:shadow-2xl transition-all duration-500 overflow-hidden relative group"
                                                        >
                                                               {/* Internal Glow */}
                                                               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-transparent group-data-[state=open]:from-emerald-500/10 transition-colors" />

                                                               <AccordionTrigger className="text-slate-900 dark:text-white hover:text-emerald-500 hover:no-underline text-left font-black py-8 md:py-10 text-xl md:text-2xl tracking-tighter uppercase italic transition-colors leading-none relative z-10 flex items-center justify-between group-data-[state=open]:text-emerald-500">
                                                                      <span className="max-w-[85%]">{faq.question}</span>
                                                                      <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-data-[state=open]:rotate-45 group-data-[state=open]:bg-emerald-500 group-data-[state=open]:text-white transition-all duration-500">
                                                                             <Plus size={16} strokeWidth={3} />
                                                                      </div>
                                                               </AccordionTrigger>
                                                               <AccordionContent className="text-slate-500 dark:text-zinc-400 leading-relaxed pb-10 md:pb-12 text-lg md:text-xl font-medium relative z-10 max-w-2xl border-t border-slate-100 dark:border-white/5 pt-8 mt-2">
                                                                      {faq.answer}
                                                               </AccordionContent>
                                                        </AccordionItem>
                                                 </motion.div>
                                          ))}
                                   </Accordion>
                            </div>

                            {/* Bottom CTA Console */}
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   whileInView={{ opacity: 1, scale: 1 }}
                                   viewport={{ once: true }}
                                   className="mt-32 relative"
                            >
                                   <div className="p-12 md:p-16 rounded-[4rem] bg-slate-900 text-white shadow-[0_50px_100px_-20px_rgba(16,185,129,0.3)] border border-white/10 flex flex-col items-center text-center gap-12 relative overflow-hidden group">
                                          {/* Tactical Background */}
                                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
                                          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 blur-[120px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
                                          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 blur-[120px] opacity-10 pointer-events-none" />

                                          <div className="relative">
                                                 <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                                                 <div className="relative w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                                        <MessageSquare size={48} strokeWidth={1.5} className="fill-white/20" />
                                                 </div>
                                          </div>

                                          <div className="space-y-6 relative z-10">
                                                 <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                                                        ¿Necesitas <br />
                                                        <span className="text-emerald-500">Ingeniería Humana?</span>
                                                 </h3>
                                                 <p className="text-slate-400 font-medium text-xl md:text-2xl max-w-xl mx-auto leading-tight italic opacity-80">
                                                        Nuestro equipo técnico está listo para configurar tu complejo de forma personalizada.
                                                 </p>
                                          </div>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20tengo%20una%20duda%20sobre%20CourtOps"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="relative group/btn py-6 px-16 rounded-[2rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-emerald-500/40 hover:scale-[1.05] transition-all duration-500 overflow-hidden"
                                          >
                                                 <span className="relative z-10 flex items-center gap-4">
                                                        Soporte Directo <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                                                 </span>
                                                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                          </a>

                                          {/* Status Indicator */}
                                          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4">
                                                 <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        Online
                                                 </div>
                                                 <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                 <div className="flex items-center gap-2">
                                                        <ShieldCheck size={12} className="text-emerald-500" />
                                                        Verificado
                                                 </div>
                                                 <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                 <div className="flex items-center gap-2">
                                                        <Zap size={12} className="text-indigo-500" />
                                                        Efectivo
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
