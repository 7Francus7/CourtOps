'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
       Accordion,
       AccordionContent,
       AccordionItem,
       AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle } from 'lucide-react'

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
              <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden" id="faq">
                     {/* Background Glow */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

                     <div className="max-w-4xl mx-auto relative z-10">
                            <div className="text-center mb-16 space-y-4">
                                   <span className="text-blue-500 font-bold uppercase tracking-widest text-xs">
                                          Soporte
                                   </span>
                                   <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                          Preguntas Frecuentes
                                   </h2>
                                   <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                          Resolvemos tus dudas para que empieces con confianza.
                                   </p>
                            </div>

                            <div className="grid gap-6">
                                   <Accordion type="single" collapsible className="w-full space-y-4">
                                          {FAQS.map((faq, i) => (
                                                 <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 bg-zinc-900/30 rounded-xl px-6 data-[state=open]:bg-zinc-900/80 transition-colors">
                                                        <AccordionTrigger className="text-white hover:text-emerald-400 hover:no-underline text-left font-medium py-6 text-lg">
                                                               {faq.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-zinc-400 leading-relaxed pb-6 text-base">
                                                               {faq.answer}
                                                        </AccordionContent>
                                                 </AccordionItem>
                                          ))}
                                   </Accordion>
                            </div>

                            <div className="mt-16 text-center">
                                   <div className="inline-flex items-center gap-2 text-zinc-400 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                                          <MessageCircle size={18} />
                                          <span>¿Tienes más preguntas?</span>
                                          <a href="mailto:soporte@courtops.com" className="text-emerald-400 hover:underline font-bold ml-1">Contáctanos</a>
                                   </div>
                            </div>

                     </div>
              </section>
       )
}
