
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
       Accordion,
       AccordionContent,
       AccordionItem,
       AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
                     answer: "El sistema es muy liviano y funciona incluso con conexiones 4G/5G básicas. Si te quedas sin internet, puedes seguir operando desde el celular."
              },
              {
                     question: "¿Puedo cobrar señas online?",
                     answer: "Sí. Nos integramos con MercadoPago para que puedas solicitar una seña automática para confirmar la reserva, reduciendo el ausentismo a cero."
              },
              {
                     question: "¿Es difícil de configurar?",
                     answer: "Para nada. La configuración inicial toma menos de 10 minutos. Cargamos tus canchas, horarios y precios, y listo. Además, te ayudamos por WhatsApp si tienes dudas."
              }
       ]

       return (
              <section className="py-16 md:py-32 px-4 md:px-6 bg-white dark:bg-[#0a0a0a] relative overflow-hidden" id="faq">
                     {/* Background Glow */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                     <div className="max-w-4xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.6 }}
                                   className="text-center mb-16 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                          <HelpCircle size={12} />
                                          Soporte
                                   </div>
                                   <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                          Preguntas{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                                                 Frecuentes
                                          </span>
                                   </h2>
                                   <p className="text-base md:text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                                          Resolvemos tus dudas para que empieces con confianza.
                                   </p>
                            </motion.div>

                            {/* FAQ Accordion */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: 0.2 }}
                            >
                                   <Accordion type="single" collapsible className="w-full space-y-4">
                                          {FAQS.map((faq, i) => (
                                                 <AccordionItem
                                                        key={i}
                                                        value={`item-${i}`}
                                                        className="border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/50 rounded-xl md:rounded-2xl px-4 md:px-6 data-[state=open]:shadow-lg data-[state=open]:bg-white dark:data-[state=open]:bg-zinc-900 data-[state=open]:border-emerald-500/30 transition-all duration-300"
                                                 >
                                                        <AccordionTrigger className="text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:no-underline text-left font-bold py-4 md:py-6 text-base md:text-lg">
                                                               {faq.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-slate-600 dark:text-zinc-400 leading-relaxed pb-4 md:pb-6 text-sm md:text-base font-medium">
                                                               {faq.answer}
                                                        </AccordionContent>
                                                 </AccordionItem>
                                          ))}
                                   </Accordion>
                            </motion.div>

                            {/* Bottom CTA */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: 0.3 }}
                                   className="mt-16 text-center"
                            >
                                   <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10">
                                          <p className="text-slate-600 dark:text-zinc-400 font-medium">
                                                 ¿Tienes más preguntas?
                                          </p>
                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20tengo%20una%20duda%20sobre%20CourtOps"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#20bd5a] transition-colors active:scale-95"
                                          >
                                                 Hablar por WhatsApp <ArrowRight size={14} strokeWidth={3} />
                                          </a>
                                   </div>
                            </motion.div>

                     </div>
              </section>
       )
}
