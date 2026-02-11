
'use client'

import React from 'react'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt } from 'lucide-react'

export default function LandingFeatures() {
       const FEATURES = [
              {
                     icon: Clock,
                     title: "Reservas en 3 Clicks",
                     description: "Tus clientes reservan en segundos. Sin llamadas, sin esperas, 24/7."
              },
              {
                     icon: Receipt,
                     title: "Control de Caja Total",
                     description: "Cierra el día sin estrés. El sistema cuadra efectivo, transferencias y gastos automáticamente."
              },
              {
                     icon: Zap,
                     title: "Reglas de Precio Inteligentes",
                     description: "Configura precios distintos para hora pico, fin de semana o feriados. El sistema calcula todo."
              },
              {
                     icon: Smartphone,
                     title: "Kiosco POS Integrado",
                     description: "Vende bebidas y alquiler de paletas desde la misma pantalla. Control de stock en tiempo real."
              },
              {
                     icon: TrendingUp,
                     title: "Reportes Financieros",
                     description: "Conoce tu ocupación real, ticket promedio y ganancias mensuales con gráficos claros."
              },
              {
                     icon: ShieldCheck,
                     title: "Seguridad y Auditoría",
                     description: "Cada movimiento queda registrado. Sabrás quién cobró, quién canceló y a qué hora."
              }
       ]

       return (
              <section className="py-24 px-6 bg-secondary/5">
                     <div className="max-w-6xl mx-auto">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                                   <h2 className="text-4xl font-black tracking-tight">Todo lo que necesitas para profesionalizar tu club</h2>
                                   <p className="text-xl text-muted-foreground">Dejamos atrás las planillas de Excel y los cuadernos. CourtOps es el sistema operativo integral para complejos deportivos modernos.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                   {FEATURES.map((feature, idx) => (
                                          <div key={idx} className="bg-card border border-border p-8 rounded-3xl hover:border-emerald-500/50 transition-colors group">
                                                 <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                                        <feature.icon size={24} />
                                                 </div>
                                                 <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                                 <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                          </div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
