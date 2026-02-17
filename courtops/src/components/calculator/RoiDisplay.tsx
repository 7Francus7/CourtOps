'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Clock, Zap, Percent, ArrowRight, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function RoiCalculator() {
       const [courts, setCourts] = useState(3)
       const [pricePerHour, setPricePerHour] = useState(12000)
       const [occupancyRate, setOccupancyRate] = useState(60) // %
       const [openHours, setOpenHours] = useState(10) // daily
       const [noShowRate, setNoShowRate] = useState(15) // % typical loss without booking deposit

       // Calculations
       const calculations = useMemo(() => {
              const dailySlots = courts * openHours
              const monthlySlots = dailySlots * 30

              // Ideal Scenario (100% full)
              const potentialMonthlyRevenue = monthlySlots * pricePerHour

              // Realistic Scenario (based on occupancy)
              const realMonthlyRevenue = potentialMonthlyRevenue * (occupancyRate / 100)

              // Money lost to No-Shows (without deposit system)
              const lostRevenue = realMonthlyRevenue * (noShowRate / 100)

              // Revenue WITH CourtOps (eliminating 90% of no-shows due to deposits/payments)
              const recoveredRevenue = lostRevenue * 0.9

              // Time saved (assuming 5 mins per booking for manual coordination vs 0 with CourtOps)
              const bookingsCount = monthlySlots * (occupancyRate / 100)
              const timeSavedHours = Math.round((bookingsCount * 5) / 60)

              return {
                     monthlyRevenue: realMonthlyRevenue,
                     lostRevenue,
                     recoveredRevenue,
                     timeSavedHours,
                     annualRecovered: recoveredRevenue * 12
              }
       }, [courts, pricePerHour, occupancyRate, openHours, noShowRate])

       const formatCurrency = (val: number) => {
              return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val)
       }

       return (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                     <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* INPUTS SECTION */}
                            <div className="p-8 lg:p-12 space-y-8 bg-slate-50 dark:bg-zinc-950/50">
                                   <div>
                                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Configura tu Club</h3>
                                          <p className="text-slate-500 dark:text-zinc-400">Ingresa los datos reales de tu complejo.</p>
                                   </div>

                                   <div className="space-y-6">
                                          <InputRange
                                                 label="Cantidad de Canchas"
                                                 value={courts}
                                                 setValue={setCourts}
                                                 min={1}
                                                 max={20}
                                                 step={1}
                                                 suffix="canchas"
                                          />

                                          <InputRange
                                                 label="Precio Promedio por Hora"
                                                 value={pricePerHour}
                                                 setValue={setPricePerHour}
                                                 min={1000}
                                                 max={50000}
                                                 step={500}
                                                 prefix="$"
                                          />

                                          <InputRange
                                                 label="Horas Abierto por Día"
                                                 value={openHours}
                                                 setValue={setOpenHours}
                                                 min={4}
                                                 max={24}
                                                 step={1}
                                                 suffix="hs"
                                          />

                                          <InputRange
                                                 label="Ocupación Promedio"
                                                 value={occupancyRate}
                                                 setValue={setOccupancyRate}
                                                 min={10}
                                                 max={100}
                                                 step={5}
                                                 suffix="%"
                                          />

                                          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                                 <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                                                               <span className="text-red-500"><Percent size={14} /></span> Tasa de Cancelación / "Clavo"
                                                        </label>
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{noShowRate}%</span>
                                                 </div>
                                                 <input
                                                        type="range"
                                                        min="0"
                                                        max="50"
                                                        step="1"
                                                        value={noShowRate}
                                                        onChange={(e) => setNoShowRate(Number(e.target.value))}
                                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-red-500"
                                                 />
                                                 <p className="text-xs text-slate-400 mt-1">Porcentaje de turnos que no asisten o cancelan a último momento.</p>
                                          </div>
                                   </div>
                            </div>

                            {/* RESULTS SECTION */}
                            <div className="p-8 lg:p-12 bg-white dark:bg-zinc-900 flex flex-col justify-center relative overflow-hidden">
                                   {/* Background decoration */}
                                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                                   <div className="relative z-10 space-y-8">

                                          {/* Main Recovered Amount */}
                                          <motion.div
                                                 key={calculations.recoveredRevenue}
                                                 initial={{ scale: 0.9, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 className="text-center space-y-2"
                                          >
                                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                                        <Zap size={12} fill="currentColor" /> Recuperable con Señas
                                                 </div>
                                                 <div className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                        {formatCurrency(calculations.recoveredRevenue)}
                                                 </div>
                                                 <p className="text-slate-500 dark:text-zinc-400 font-medium">Dinero extra estimado <u>por mes</u> al eliminar cancelaciones.</p>
                                          </motion.div>

                                          <div className="grid grid-cols-2 gap-4 pt-8">
                                                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5">
                                                        <div className="text-slate-400 dark:text-zinc-500 mb-2"><Clock size={20} /></div>
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{calculations.timeSavedHours} hs</div>
                                                        <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Ahorradas al mes gestión manual</div>
                                                 </div>

                                                 <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                                        <div className="text-emerald-500 mb-2"><DollarSign size={20} /></div>
                                                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(calculations.annualRecovered)}</div>
                                                        <div className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70">Proyección Anual Extra</div>
                                                 </div>
                                          </div>

                                          <div className="pt-8">
                                                 <Link href="https://wa.me/5491162920081?text=Hola%2C%20hice%20el%20c%C3%A1lculo%20de%20ROI%20y%20quiero%20probar%20CourtOps%20para%20recuperar%20ingresos." target="_blank">
                                                        <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 group">
                                                               Empezar a Recuperar
                                                               <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                 </Link>
                                                 <p className="text-center text-xs text-slate-400 mt-4">
                                                        *Cálculo estimativo basado en estadísticas promedio de la industria.
                                                 </p>
                                          </div>

                                   </div>
                            </div>
                     </div>
              </div>
       )
}

function InputRange({ label, value, setValue, min, max, step, prefix = '', suffix = '' }: any) {
       return (
              <div>
                     <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">{label}</label>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                   {prefix}{value}{suffix}
                            </span>
                     </div>
                     <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-emerald-500"
                     />
              </div>
       )
}
