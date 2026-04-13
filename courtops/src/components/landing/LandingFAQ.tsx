'use client'

import React from 'react'
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
              answer: "Sí, ofrecemos una prueba gratuita de 7 días con acceso total a todas las funciones. No necesitas tarjeta de crédito para empezar."
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
              <section className="py-24 px-6 md:px-8" style={{ background: 'var(--co-surface)' }} id="faq">
                     <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12 space-y-3">
                                   <h2 className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--co-green)' }}>
                                          Soporte y Preguntas
                                   </h2>
                                   <h3 className="text-4xl font-black tracking-tight" style={{ color: 'var(--co-navy)' }}>
                                          Preguntas frecuentes
                                   </h3>
                            </div>

                            <Accordion type="single" collapsible className="w-full space-y-2">
                                   {FAQS.map((faq, i) => (
                                          <AccordionItem
                                                 key={i}
                                                 value={`item-${i}`}
                                                 className="border-b last:border-0"
                                                 style={{ borderColor: 'var(--co-border)' }}
                                          >
                                                 <AccordionTrigger
                                                        className="text-base sm:text-lg font-semibold text-left py-5 sm:py-6 transition-colors"
                                                        style={{ color: 'var(--co-navy)' }}
                                                 >
                                                        {faq.question}
                                                 </AccordionTrigger>
                                                 <AccordionContent
                                                        className="text-base leading-relaxed pb-6"
                                                        style={{ color: 'var(--co-muted)' }}
                                                 >
                                                        {faq.answer}
                                                 </AccordionContent>
                                          </AccordionItem>
                                   ))}
                            </Accordion>

                            {/* CTA de soporte */}
                            <div
                                   className="mt-16 p-8 rounded-2xl flex flex-col items-center text-center gap-5"
                                   style={{ background: 'var(--co-card)', border: '1px solid var(--co-border)' }}
                            >
                                   <div
                                          className="w-12 h-12 rounded-full flex items-center justify-center"
                                          style={{ background: 'var(--co-green-10)' }}
                                   >
                                          <MessageCircle size={24} style={{ color: 'var(--co-green)' }} />
                                   </div>
                                   <div className="space-y-2">
                                          <h4 className="text-lg font-bold" style={{ color: 'var(--co-navy)' }}>¿Aún tienes dudas?</h4>
                                          <p className="text-sm" style={{ color: 'var(--co-muted)' }}>Conversa con un asesor técnico ahora mismo.</p>
                                   </div>
                                   <a
                                          href="https://wa.me/5493524421497"
                                          className="px-8 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-95 active:scale-90"
                                          style={{ background: 'var(--co-green)' }}
                                   >
                                          Contactar por WhatsApp
                                   </a>
                            </div>
                     </div>
              </section>
       )
}
