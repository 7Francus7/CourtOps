'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
       Accordion,
       AccordionContent,
       AccordionItem,
       AccordionTrigger,
} from "@/components/ui/accordion"
import { MessageCircle } from 'lucide-react'

const FAQS = [
       {
              question: "¿Puedo probar el sistema antes de pagar?",
              answer: "Sí, ofrecemos una prueba gratuita de 14 días con acceso total a todas las funciones. No necesitas tarjeta de crédito para empezar."
       },
       {
              question: "¿La plataforma es compatible con mi celular?",
              answer: "Absolutamente. CourtOps es 100% responsivo y funciona perfectamente en smartphones, tablets y computadoras, sin necesidad de instalar apps pesadas."
       },
       {
              question: "¿Cómo recibo los pagos de las señas?",
              answer: "Nos integramos directamente con Mercado Pago. Cuando un cliente reserva y paga, el dinero va directo a tu cuenta sin intermediarios."
       },
       {
              question: "¿Es difícil migrar mis clientes actuales?",
              answer: "Para nada. Contamos con herramientas de importación masiva y nuestro equipo de soporte puede ayudarte con el proceso para que no pierdas ni un minuto."
       },
       {
              question: "¿Tengo soporte técnico?",
              answer: "Sí, nuestro equipo está disponible para ayudarte a configurar tu club y resolver cualquier duda técnica que surja en el día a día."
       }
]

export default function LandingFAQ() {
       return (
              <section className="py-10 md:py-24 px-4 sm:px-6 bg-transparent border-t border-white/[0.06]" id="faq">
                     <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-8 space-y-3">
                                   <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Soporte y FAQ</h2>
                                   <h3 className="text-4xl font-medium text-slate-900 dark:text-white tracking-tight">Preguntas frecuentes</h3>
                            </div>

                            <Accordion type="single" collapsible className="w-full space-y-2">
                                   {FAQS.map((faq, i) => (
                                          <AccordionItem
                                                 key={i}
                                                 value={`item-${i}`}
                                                 className="border-b border-slate-200 dark:border-white/[0.06] last:border-0"
                                          >
                                                 <AccordionTrigger className="text-base sm:text-lg font-medium text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left py-5 sm:py-6">
                                                        {faq.question}
                                                 </AccordionTrigger>
                                                 <AccordionContent className="text-slate-500 dark:text-zinc-400 text-base leading-relaxed pb-6">
                                                        {faq.answer}
                                                 </AccordionContent>
                                          </AccordionItem>
                                   ))}
                            </Accordion>

                            {/* Minimal Support CTA */}
                            <div className="mt-12 sm:mt-20 p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex flex-col items-center text-center gap-5 sm:gap-6">
                                   <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                          <MessageCircle size={24} />
                                   </div>
                                   <div className="space-y-2">
                                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">¿Aún tienes dudas?</h4>
                                          <p className="text-sm text-slate-500 dark:text-zinc-400">Conversa con un asesor técnico ahora mismo.</p>
                                   </div>
                                   <a
                                          href="https://wa.me/5493524421497"
                                          className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white/10 text-white font-bold text-sm border border-slate-800 dark:border-white/15 hover:bg-slate-800 dark:hover:bg-white/20 transition-all"
                                   >
                                          Contactar por WhatsApp
                                   </a>
                            </div>
                     </div>
              </section>
       )
}
