'use client'

import React, { useState } from 'react'
import { Check, Star, Shield, Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BillingPage() {
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const plans = [
              <span className="leading-tight">{feature}</span>
                                                                      </li >
                                                               ))
}
                                                        </ul >
                                                 </div >

       <button
              onClick={() => {
                     window.open(`https://wa.me/5493524421497?text=Hola,%20me%20interesa%20el%20plan%20${plan.name}%20de%20CourtOps`, '_blank')
              }}
              className={cn(
                     "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95",
                     plan.highlight
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90 shadow-lg shadow-emerald-500/20"
                            : "bg-white text-black hover:bg-zinc-200"
              )}
       >
              {plan.current ? 'Tu Plan Actual' : 'Seleccionar Plan'}
       </button>
                                          </div >
                                   ))}
                            </div >

       {/* Enterprise Banner */ }
       < div className = "mt-16 relative group cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-12 text-center transition-all hover:border-zinc-700" >
                                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-500/5 group-hover:to-purple-500/10 transition-all" />

                                   <div className="relative z-10 flex flex-col items-center gap-4">
                                          <div className="p-3 bg-purple-500/10 rounded-2xl mb-2 text-purple-400">
                                                 <Shield size={32} />
                                          </div>
                                          <h3 className="text-2xl md:text-3xl font-bold text-white">¿Necesitas un plan a medida?</h3>
                                          <p className="text-zinc-400 max-w-xl mx-auto mb-6">
                                                 Para cadenas deportivas, franquicias o clubes con necesidades específicas de integración y soporte.
                                          </p>
                                          <button
                                                 onClick={() => window.open('https://wa.me/5493524421497?text=Hola,%20soy%20una%20cadena%20y%20necesito%20un%20plan%20a%20medida', '_blank')}
                                                 className="inline-flex items-center gap-2 text-white border-b border-purple-500 pb-1 hover:text-purple-400 transition-colors font-bold uppercase tracking-wider text-sm"
                                          >
                                                 Contactar Ventas Corporativas <Zap size={14} />
                                          </button>
                                   </div>
                            </div >

       <div className="mt-12 text-center">
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                     CourtOps - Software de Gestión Deportiva
              </p>
       </div>

                     </div >
              </div >
       )
}
