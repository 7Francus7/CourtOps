'use client'

import TurneroGrid from "@/components/TurneroGrid"
import RevenueHeatmap from "@/components/RevenueHeatmap"
import React from 'react'
import { format, set } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft, CalendarDays, ShoppingCart, BarChart3, Shield, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"


// --- CINEMATIC SIMULATION COMPONENT ---
// This mimics a real video recording using code-based animations for zero loading time and infinite resolution.

function CinematicSimulation({ type, demoData }: { type: 'turnero' | 'kiosco' | 'metricas', demoData: any }) {
       const [step, setStep] = useState(0)

       // Ghost Cursor Animation
       useEffect(() => {
              const timer = setInterval(() => {
                     setStep(s => (s + 1) % 4)
              }, 5000) // Slightly slower for more focus
              return () => clearInterval(timer)
       }, [])

       const cursorPositions = {
              turnero: [
                     { x: '45%', y: '35%', label: 'Seleccionando Cancha...' },
                     { x: '65%', y: '55%', label: 'Confirmando Horario' },
                     { x: '25%', y: '75%', label: 'Añadiendo Cliente' },
                     { x: '50%', y: '50%', label: 'Reserva Exitosa' }
              ],
              kiosco: [
                     { x: '30%', y: '40%', label: 'Agregando Bebida' },
                     { x: '40%', y: '60%', label: 'Sumando Pelotas' },
                     { x: '85%', y: '85%', label: 'Procesando Pago' },
                     { x: '50%', y: '50%', label: 'Venta Finalizada' }
              ],
              metricas: [
                     { x: '20%', y: '30%', label: 'Analizando Ingresos' },
                     { x: '50%', y: '30%', label: 'Revisando Ocupación' },
                     { x: '80%', y: '80%', label: 'Exportando Reporte' },
                     { x: '50%', y: '50%', label: 'Dashboard Actualizado' }
              ]
       }

       return (
              <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden group">
                     {/* HUD Branding */}
                     <div className="absolute top-8 left-8 z-30 flex items-center gap-4 px-5 py-2.5 bg-black text-white rounded-2xl border border-white/10 shadow-2xl pointer-events-none backdrop-blur-3xl">
                            <div className="flex h-3 w-3 relative">
                                   <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                                   <div className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Simulation System</span>
                            <div className="h-4 w-px bg-white/10 mx-1" />
                            <span className="text-[10px] font-medium text-emerald-400 font-mono tracking-tighter">EST: LOW_LATENCY</span>
                     </div>

                     {/* Content Simulation */}
                     <motion.div
                            animate={{ scale: [1, 1.01, 1] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="h-full w-full"
                     >
                            {type === 'turnero' && (
                                   <div className="h-full w-full pointer-events-none origin-center">
                                          <TurneroGrid
                                                 date={new Date()}
                                                 onDateChange={() => { }}
                                                 onBookingClick={() => { }}
                                                 onNewBooking={() => { }}
                                                 demoData={demoData}
                                                 hideHeader={true}
                                                 showWaitingList={false}
                                          />
                                   </div>
                            )}
                            {type === 'kiosco' && <MockKiosco />}
                            {type === 'metricas' && <MockMetrics />}
                     </motion.div>

                     {/* Ghost Cursor Overlay */}
                     <motion.div
                            animate={{
                                   left: cursorPositions[type][step].x,
                                   top: cursorPositions[type][step].y
                            }}
                            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute z-50 pointer-events-none"
                     >
                            {/* The Cursor */}
                            <div className="relative">
                                   <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center backdrop-blur-sm shadow-2xl relative">
                                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                          {/* Pulse rings */}
                                          <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20" />
                                   </div>

                                   {/* Click Ripple Effect */}
                                   <AnimatePresence>
                                          <motion.div
                                                 key={step}
                                                 initial={{ scale: 0, opacity: 1 }}
                                                 animate={{ scale: 4, opacity: 0 }}
                                                 transition={{ duration: 1, ease: "easeOut" }}
                                                 className="absolute inset-0 bg-emerald-500/30 rounded-full"
                                          />
                                   </AnimatePresence>

                                   {/* Cursor Label */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          key={step}
                                          className="absolute left-10 top-0 bg-black text-white px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap border border-white/10"
                                   >
                                          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Acción</div>
                                          <div className="text-sm font-black tracking-tighter">{cursorPositions[type][step].label}</div>
                                   </motion.div>
                            </div>
                     </motion.div>

                     {/* Cinematic Vignette */}
                     <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.1)_100%)] dark:bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.5)_100%)] z-20" />

                     {/* Glass Overlay / Noise */}
                     <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-20 mix-blend-overlay">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                     </div>

                     {/* Progress Indicator */}
                     <div className="absolute bottom-10 left-10 right-10 flex gap-2 z-30">
                            {[0, 1, 2, 3].map((i) => (
                                   <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                          <motion.div
                                                 initial={{ scaleX: 0 }}
                                                 animate={{ scaleX: i === step ? 1 : i < step ? 1 : 0 }}
                                                 transition={{ duration: i === step ? 5 : 0.5, ease: "linear" }}
                                                 className="h-full bg-emerald-500 origin-left"
                                          />
                                   </div>
                            ))}
                     </div>
              </div>
       )
}

// --- MOCK COMPONENTS FOR KIOSCO & METRICS ---

function MockKiosco() {
       return (
              <div className="flex h-full text-slate-900 dark:text-white font-sans bg-white dark:bg-black">
                     <div className="flex-1 p-8 sm:p-12 overflow-y-auto custom-scrollbar relative">
                            {/* Background glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-end mb-12 relative z-10">
                                   <div>
                                          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 mb-2">Inventario Pro</div>
                                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                                                 Venta Rápida
                                          </h3>
                                   </div>
                                   <div className="flex gap-4">
                                          <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/10 uppercase tracking-widest">Almacén</div>
                                          <div className="px-4 py-2 bg-emerald-500/10 rounded-xl text-[10px] font-black text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">Favoritos</div>
                                   </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                                   {[
                                          { name: "Reserva Central", price: 32000, img: "🎾", tag: "Cancha 1" },
                                          { name: "Agua Mineral", price: 1500, img: "💧", tag: "Bebida" },
                                          { name: "Tubo Pelotas", price: 12000, img: "🔋", tag: "Equip" },
                                          { name: "Alquiler Paleta", price: 3000, img: "🏓", tag: "Servicio" },
                                          { name: "Gatorade Azul", price: 2500, img: "⚡", tag: "Bebida" },
                                          { name: "Proteína Bar", price: 3500, img: "🍫", tag: "Snack" },
                                   ].map((p, i) => (
                                          <div key={i} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 cursor-pointer group hover:-translate-y-2 shadow-sm hover:shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                                                 <div className="absolute top-6 right-6 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 px-2 py-1 rounded-lg border border-slate-100 dark:border-white/5">{p.tag}</div>
                                                 <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-5xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner">{p.img}</div>
                                                 <div className="font-black text-slate-900 dark:text-white mb-2 tracking-tighter text-xl uppercase">{p.name}</div>
                                                 <div className="text-emerald-500 font-black text-lg">${p.price.toLocaleString('es-AR')}</div>
                                          </div>
                                   ))}
                            </div>
                     </div>
                     <div className="hidden lg:flex w-[450px] border-l border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01] backdrop-blur-3xl p-12 flex-col relative">
                            {/* Inner vertical border line */}
                            <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />

                            <h3 className="font-black text-2xl mb-10 flex items-center gap-4 text-slate-900 dark:text-white pb-10 border-b border-slate-200 dark:border-white/5 tracking-tighter uppercase">
                                   <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                          <ShoppingCart size={28} className="text-emerald-500" />
                                   </div>
                                   Carrito <span className="text-slate-400 dark:text-zinc-600 text-lg ml-auto font-medium tracking-tight">(2)</span>
                            </h3>

                            <div className="flex-1 space-y-8">
                                   <div className="flex justify-between items-center p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all hover:scale-[1.03] shadow-sm">
                                          <div className="flex items-center gap-5">
                                                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-sm font-black text-emerald-500">2x</div>
                                                 <div>
                                                        <div className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">Reserva Cancha</div>
                                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">Central</div>
                                                 </div>
                                          </div>
                                          <span className="font-black text-slate-900 dark:text-white text-lg">$64.000</span>
                                   </div>
                                   <div className="flex justify-between items-center p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all hover:scale-[1.03] shadow-sm">
                                          <div className="flex items-center gap-5">
                                                 <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-sm font-black text-orange-500">1x</div>
                                                 <div>
                                                        <div className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">Tubo Pelotas</div>
                                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">In-Stock</div>
                                                 </div>
                                          </div>
                                          <span className="font-black text-slate-900 dark:text-white text-lg">$12.000</span>
                                   </div>
                            </div>

                            <div className="pt-10 mt-10 border-t border-slate-200 dark:border-white/5">
                                   <div className="flex justify-between items-end mb-10">
                                          <div>
                                                 <span className="text-slate-400 dark:text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] block mb-2">Total a cobrar</span>
                                                 <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">$76.000</span>
                                          </div>
                                   </div>
                                   <button className="btn-premium py-6 w-full text-base shadow-emerald-500/20">
                                          FINALIZAR COBRO <ArrowRight size={20} className="ml-2" />
                                   </button>
                            </div>
                     </div>
              </div>
       )
}

const DEMO_HEATMAP = Array.from({ length: 40 }, () => ({
       day: Math.floor(Math.random() * 7),
       hour: Math.floor(Math.random() * 9) + 14,
       value: Math.floor(Math.random() * 10)
}))

function MockMetrics() {
       const demoHeatmap = DEMO_HEATMAP

       return (
              <div className="h-full p-10 sm:p-14 lg:p-20 overflow-y-auto space-y-16 bg-white dark:bg-black relative">
                     {/* Background Atmosphere */}
                     <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full" />
                            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full" />
                     </div>

                     <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                            <div className="space-y-2">
                                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">Business Intelligence</div>
                                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Análisis de Operaciones</h3>
                            </div>
                            <div className="flex gap-4">
                                   <button className="px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 dark:hover:bg-white/10">Exportar Reporte</button>
                                   <button className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Semana Actual</button>
                            </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative z-10">
                            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 rounded-[3rem] shadow-sm backdrop-blur-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                   <div className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mb-4">Ingresos Totales</div>
                                   <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-none">$1.245.000</div>
                                   <div className="flex items-center gap-3">
                                          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/10 tracking-widest uppercase">📈 +18.4%</div>
                                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest">vS ÚLTIMO MES</span>
                                   </div>
                            </div>
                            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 rounded-[3rem] shadow-sm backdrop-blur-3xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500">
                                   <div className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mb-4">Ocupación Media</div>
                                   <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-none">84.2%</div>
                                   <div className="flex items-center gap-3">
                                          <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 text-[10px] font-black border border-orange-500/10 tracking-widest uppercase">🔥 ALTA</div>
                                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest">PICOS 18-22HS</span>
                                   </div>
                            </div>
                            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 rounded-[3rem] shadow-sm backdrop-blur-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
                                   <div className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mb-4">Nuevos Clientes</div>
                                   <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-none">+432</div>
                                   <div className="flex items-center gap-3">
                                          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black border border-indigo-500/10 tracking-widest uppercase">🚀 CRECIMIENTO</div>
                                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-widest">100% ORGÁNICO</span>
                                   </div>
                            </div>
                     </div>

                     <div className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-[4rem] p-10 sm:p-16 shadow-2xl backdrop-blur-3xl relative overflow-hidden z-10">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
                            <div className="flex justify-between items-center mb-16">
                                   <div>
                                          <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase leading-none mb-2">Concentración de Demanda</h3>
                                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em]">Mapa de calor por franja horaria</p>
                                   </div>
                                   <div className="flex items-center gap-6">
                                          <div className="flex items-center gap-3">
                                                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                 <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 tracking-widest uppercase">Máxima</span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                                 <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                                 <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 tracking-widest uppercase">Mínima</span>
                                          </div>
                                   </div>
                            </div>
                            <div className="opacity-90 transform hover:scale-[1.02] transition-transform duration-1000">
                                   <RevenueHeatmap demoData={demoHeatmap} />
                            </div>
                     </div>
              </div>
       )
}


export default function LandingShowcase() {
       const [date, setDate] = useState(new Date())
       const [activeTab, setActiveTab] = useState<'turnero' | 'kiosco' | 'metricas' | 'torneos'>('turnero')

       const tabs = [
              { id: 'turnero', label: 'Turnero Inteligente', icon: CalendarDays, videoUrl: "simulated" },
              { id: 'kiosco', label: 'Punto de Venta', icon: ShoppingCart, videoUrl: "simulated" },
              { id: 'metricas', label: 'Reportes y Métricas', icon: BarChart3, videoUrl: "simulated" },
       ]

       // Create dynamic demo data for "Today"
       const demoData = {
              clubId: 'demo',
              config: { openTime: '13:00', closeTime: '23:30', slotDuration: 90 },
              courts: [
                     { id: 1, name: "Cancha Central (Indoor)", sport: "Padel", duration: 90 },
                     { id: 2, name: "Cancha Panorámica", sport: "Padel", duration: 90 },
                     { id: 3, name: "Cancha 3 Descubierta", sport: "Padel", duration: 90 },
              ],
              bookings: [
                     {
                            id: 1,
                            courtId: 1,
                            startTime: set(date, { hours: 14, minutes: 30 }).toISOString(),
                            endTime: set(date, { hours: 16, minutes: 0 }).toISOString(),
                            client: { name: "Juan Pérez", phone: "11-1234-5678" },
                            price: 32000,
                            paymentStatus: 'PAID',
                            status: 'CONFIRMED',
                            transactions: [{ amount: 32000 }]
                     },
                     {
                            id: 2,
                            courtId: 2,
                            startTime: set(date, { hours: 16, minutes: 0 }).toISOString(),
                            endTime: set(date, { hours: 17, minutes: 30 }).toISOString(),
                            client: { name: "Torneo Mensual" },
                            items: [{ unitPrice: 2000, quantity: 4, product: { name: "Pelotas" } }],
                            price: 32000,
                            paymentStatus: 'PARTIAL',
                            status: 'CONFIRMED',
                            transactions: [{ amount: 15000 }]
                     },
                     {
                            id: 3,
                            courtId: 1,
                            startTime: set(date, { hours: 19, minutes: 0 }).toISOString(),
                            endTime: set(date, { hours: 20, minutes: 30 }).toISOString(),
                            client: { name: "Reserva App Móvil" },
                            price: 35000,
                            paymentStatus: 'PENDING',
                            status: 'PENDING',
                            transactions: []
                     },
                     {
                            id: 4,
                            courtId: 3,
                            startTime: set(date, { hours: 20, minutes: 30 }).toISOString(),
                            endTime: set(date, { hours: 22, minutes: 0 }).toISOString(),
                            client: { name: "Clase Prof. Martin" },
                            price: 28000,
                            paymentStatus: 'PAID',
                            status: 'CONFIRMED',
                            transactions: [{ amount: 28000 }]
                     }
              ]
       }

       const handleNext = () => {
              const idx = tabs.findIndex(t => t.id === activeTab)
              const next = (idx + 1) % tabs.length
              setActiveTab(tabs[next].id as any)
       }

       const handlePrev = () => {
              const idx = tabs.findIndex(t => t.id === activeTab)
              const prev = (idx - 1 + tabs.length) % tabs.length
              setActiveTab(tabs[prev].id as any)
       }

       return (
              <section className="py-20 bg-slate-50 dark:bg-background overflow-hidden relative">
                     {/* Cinematic Background Glows */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                     <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                     <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="text-center mb-16"
                            >
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                                          Un ecosistema completo, <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-400 filter drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                                                 en una sola pantalla.
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                          Olvídate de usar múltiples herramientas. CourtOps integra agenda, facturación y reportes en una interfaz unificada y elegante.
                                   </p>
                            </motion.div>

                            {/* CONTROLS */}
                            <div className="flex justify-start md:justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4 md:pb-0 px-4 md:px-0 scroll-smooth">
                                   {tabs.map(tab => {
                                          const isActive = activeTab === tab.id;
                                          return (
                                                 <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id as any)}
                                                        className={cn(
                                                               "flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap shrink-0 border",
                                                               isActive
                                                                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground border-transparent shadow-[0_10px_30px_rgba(139,92,246,0.3)] dark:shadow-[0_10px_30px_rgba(139,92,246,0.3)] scale-105"
                                                                      : "bg-white/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white backdrop-blur-md"
                                                        )}
                                                 >
                                                        <tab.icon size={18} className={isActive ? "text-orange-400 dark:text-orange-500" : "text-slate-400 dark:text-zinc-500"} />
                                                        {tab.label}
                                                 </button>
                                          )
                                   })}
                            </div>

                            {/* MOCKUP FRAME */}
                            <motion.div
                                   initial={{ opacity: 0, y: 50 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, delay: 0.2 }}
                                   className="relative max-w-6xl mx-auto perspective-[2000px]"
                            >
                                   {/* Glow behind mockup */}
                                   <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-violet-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                                   {/* WINDOW CHROME */}
                                   <div className="bg-slate-100 dark:bg-[#0A101A] rounded-2xl md:rounded-[2rem] border border-slate-200/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden min-h-[500px] md:min-h-[650px] flex flex-col relative transform-gpu transition-transform duration-700 hover:scale-[1.01] backdrop-blur-2xl ring-1 ring-white/50 dark:ring-white/5">

                                          {/* Window Header */}
                                          <div className="h-12 bg-white/50 dark:bg-[#030712]/50 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 flex items-center px-6 gap-4 shrink-0 justify-between">
                                                 <div className="flex gap-2">
                                                        <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-inner" />
                                                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-inner" />
                                                        <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-inner" />
                                                 </div>
                                                 <div className="flex-1 flex justify-center">
                                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-md bg-white/60 dark:bg-black/40 shadow-sm border border-slate-200/50 dark:border-white/5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 backdrop-blur-md min-w-[200px] justify-center">
                                                               <Shield size={12} className="text-violet-500" /> courtops.net/app/{activeTab}
                                                        </div>
                                                 </div>
                                                 <div className="w-16" /> {/* Spacer for centering */}
                                          </div>

                                          {/* LIVE COMPONENT PREVIEW */}
                                          <div className="flex-1 bg-white/30 dark:bg-transparent p-3 sm:p-4 relative overflow-hidden">
                                                 <div className="h-full border border-slate-200/60 dark:border-white/5 rounded-xl md:rounded-2xl overflow-hidden bg-white dark:bg-[#050A14] relative shadow-inner">
                                                        <AnimatePresence mode="wait">
                                                               <motion.div
                                                                      key={activeTab}
                                                                      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                                                                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                                      exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                                                                      transition={{ duration: 0.4, ease: "easeInOut" }}
                                                                      className="h-full w-full"
                                                               >
                                                                      {activeTab === 'turnero' && (
                                                                             <div className="h-full w-full relative">
                                                                                    {tabs[0].videoUrl ? (
                                                                                           <CinematicSimulation type="turnero" demoData={demoData} />
                                                                                    ) : (
                                                                                           <div className="h-full w-full opacity-95 hover:opacity-100 transition-opacity bg-slate-50 dark:bg-[#030712] overflow-auto custom-scrollbar">
                                                                                                  <TurneroGrid
                                                                                                         date={date}
                                                                                                         onDateChange={setDate}
                                                                                                         onBookingClick={() => { }}
                                                                                                         onNewBooking={() => { }}
                                                                                                         demoData={demoData}
                                                                                                         hideHeader={true}
                                                                                                         showWaitingList={false}
                                                                                                  />
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                      )}
                                                                      {activeTab === 'kiosco' && (
                                                                             <div className="h-full w-full">
                                                                                    {tabs[1].videoUrl ? (
                                                                                           <CinematicSimulation type="kiosco" demoData={demoData} />
                                                                                    ) : (
                                                                                           <MockKiosco />
                                                                                    )}
                                                                             </div>
                                                                      )}
                                                                      {activeTab === 'metricas' && (
                                                                             <div className="h-full w-full">
                                                                                    {tabs[2].videoUrl ? (
                                                                                           <CinematicSimulation type="metricas" demoData={demoData} />
                                                                                    ) : (
                                                                                           <MockMetrics />
                                                                                    )}
                                                                             </div>
                                                                      )}
                                                               </motion.div>
                                                        </AnimatePresence>
                                                 </div>
                                          </div>

                                          {/* Navigation Arrows (Floating Overlay) */}
                                          <button
                                                 onClick={handlePrev}
                                                 className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-2xl z-50 group hidden md:block opacity-0 md:opacity-100 hover:scale-110"
                                          >
                                                 <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                          </button>
                                          <button
                                                 onClick={handleNext}
                                                 className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-2xl z-50 group hidden md:block opacity-0 md:opacity-100 hover:scale-110"
                                          >
                                                 <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                          </button>
                                   </div>

                            </motion.div>
                     </div>
              </section>
       )
}
