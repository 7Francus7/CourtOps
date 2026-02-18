'use client'

import React from 'react'
import { Check } from 'lucide-react'

export default function BillingPage() {
       const plans = [
              {
                     name: 'Start',
                     price: '$39',
                     features: ['2 Usuarios', 'Turnero Básico', 'Caja Simple', 'Soporte Email'],
                     current: false,
              },
              {
                     name: 'Growth',
                     price: '$79',
                     features: ['5 Usuarios', 'Kiosco y Stock', 'Reportes Avanzados', 'Soporte WhatsApp'],
                     current: true, // Simulating they are on a trial of this or similar
              },
              {
                     name: 'Pro',
                     price: '$149',
                     features: ['Usuarios Ilimitados', 'Multi-Sede', 'API Access', 'Soporte 24/7'],
                     current: false,
              },
       ]

       return (
              <div className="p-6 md:p-10 max-w-6xl mx-auto text-foreground">
                     <div className="mb-10">
                            <h1 className="text-3xl font-black tracking-tight mb-2">Suscripción y Facturación</h1>
                            <p className="text-muted-foreground">Gestiona tu plan y método de pago.</p>
                     </div>

                     <div className="grid md:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                   <div
                                          key={plan.name}
                                          className={`
              relative p-8 rounded-2xl border flex flex-col
              ${plan.current
                                                        ? 'bg-card border-primary shadow-2xl shadow-primary/10'
                                                        : 'bg-card/50 border-border opacity-75 hover:opacity-100 transition-opacity'
                                                 }
            `}
                                   >
                                          {plan.current && (
                                                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                        Plan Actual (Trial)
                                                 </div>
                                          )}

                                          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                          <div className="text-4xl font-black mb-6">{plan.price}<span className="text-lg font-medium text-muted-foreground">/mes</span></div>

                                          <ul className="space-y-3 mb-8 flex-1">
                                                 {plan.features.map((feature) => (
                                                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                               <Check size={16} className="text-primary" />
                                                               {feature}
                                                        </li>
                                                 ))}
                                          </ul>

                                          <button
                                                 className={`
                w-full py-3 rounded-xl font-bold transition-all
                ${plan.current
                                                               ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                               : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                        }
              `}
                                                 onClick={() => {
                                                        // For now, open WhatsApp to upgrade
                                                        window.open(`https://wa.me/543524421497?text=Hola,%20quiero%20contratar%20el%20plan%20${plan.name}`, '_blank')
                                                 }}
                                          >
                                                 {plan.current ? 'Extender Suscripción' : 'Cambiar a este Plan'}
                                          </button>
                                   </div>
                            ))}
                     </div>

                     <div className="mt-12 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-center">
                            <h3 className="text-lg font-bold text-white mb-2">¿Necesitas un plan a medida?</h3>
                            <p className="text-zinc-400 mb-4">Para cadenas de más de 3 sedes o necesidades especiales.</p>
                            <a
                                   href="https://wa.me/543524421497"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-primary font-bold hover:underline"
                            >
                                   Contactar Ventas Corporativas &rarr;
                            </a>
                     </div>
              </div>
       )
}
