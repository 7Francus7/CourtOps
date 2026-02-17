import React from 'react'
import LandingHeader from "@/components/landing/LandingHeader"
import LandingFooter from "@/components/landing/LandingFooter"
import RoiCalculator from "@/components/calculator/RoiDisplay"
import { Metadata } from 'next'

export const metadata: Metadata = {
       title: 'Calculadora de Rentabilidad | CourtOps',
       description: 'Descubre cuánto dinero está perdiendo tu club por cancelaciones y gestión manual. Calcula tu ROI con CourtOps.',
}

export default function CalculatorPage() {
       return (
              <div className="min-h-screen bg-slate-50 dark:bg-black font-sans">
                     <LandingHeader />

                     <main className="pt-32 pb-24 px-6">
                            <div className="max-w-7xl mx-auto space-y-12">

                                   <div className="text-center max-w-3xl mx-auto space-y-6">
                                          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                 ¿Cuánto te cuesta <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                                                        no usar CourtOps?
                                                 </span>
                                          </h1>
                                          <p className="text-lg text-slate-500 dark:text-zinc-400 leading-relaxed">
                                                 Muchos clubes pierden hasta un 20% de sus ingresos mensuales por cancelaciones de último momento y "clavos".
                                                 Descubre cuánto podrías recuperar automatizando las señas y reservas.
                                          </p>
                                   </div>

                                   <div className="max-w-5xl mx-auto">
                                          <RoiCalculator />
                                   </div>

                            </div>
                     </main>

                     <LandingFooter />
              </div>
       )
}
