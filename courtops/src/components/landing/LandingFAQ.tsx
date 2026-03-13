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
              <section className="py-32 px-6 bg-white dark:bg-zinc-950 transition-colors duration-700 border-t border-slate-100 dark:border-white/5" id="faq">
                     <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-16 space-y-4">
                                   <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Soporte y FAQ</h2>
                                   <h3 className="text-4xl font-medium text-slate-900 dark:text-white tracking-tight">Preguntas frecuentes</h3>
                            </div>

                            <Accordion type="single" collapsible className="w-full space-y-2">
                                   {FAQS.map((faq, i) => (
                                          <AccordionItem
                                                 key={i}
                                                 value={`item-${i}`}
                                                 className="border-b border-slate-100 dark:border-white/5 last:border-0"
                                          >
                                                 <AccordionTrigger className="text-lg font-medium text-slate-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-left py-6">
                                                        {faq.question}
                                                 </AccordionTrigger>
                                                 <AccordionContent className="text-slate-500 dark:text-zinc-400 text-base leading-relaxed pb-6">
                                                        {faq.answer}
                                                 </AccordionContent>
                                          </AccordionItem>
                                   ))}
                            </Accordion>

                            {/* Minimal Support CTA */}
                            <div className="mt-20 p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 flex flex-col items-center text-center gap-6">
                                   <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                          <MessageCircle size={24} />
                                   </div>
                                   <div className="space-y-2">
                                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">¿Aún tienes dudas?</h4>
                                          <p className="text-sm text-slate-500 dark:text-zinc-400">Conversa con un asesor técnico ahora mismo.</p>
                                   </div>
                                   <a
                                          href="https://wa.me/5493524421497"
                                          className="px-8 py-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-sm hover:opacity-90 transition-all"
                                   >
                                          Contactar por WhatsApp
                                   </a>
                            </div>
                     </div>
              </section>
       )
}
