
'use client'

import TurneroGrid from "@/components/TurneroGrid"
import RevenueHeatmap from "@/components/RevenueHeatmap"
import { addHours, set, format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronRight, ChevronLeft, CalendarDays, ShoppingCart, BarChart3 } from "lucide-react"

// --- MOCK COMPONENTS FOR KIOSCO & METRICS ---

function MockKiosco() {
       return (
              <div className="flex h-full text-slate-900 dark:text-white font-sans bg-slate-50 dark:bg-zinc-950">
                     <div className="flex-1 p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                   {[
                                          { name: "Gatorade Azul", price: 2500, img: "⚡" },
                                          { name: "Agua Mineral", price: 1500, img: "💧" },
                                          { name: "Tubo Pelotas", price: 12000, img: "🎾" },
                                          { name: "Alquiler Paleta", price: 3000, img: "🏓" },
                                          { name: "Coca Cola", price: 2000, img: "🥤" },
                                          { name: "Proteína Bar", price: 3500, img: "🍫" },
                                   ].map((p, i) => (
                                          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group shadow-sm">
                                                 <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{p.img}</div>
                                                 <div className="font-bold text-sm text-slate-700 dark:text-zinc-200">{p.name}</div>
                                                 <div className="text-primary dark:text-primary font-bold text-xs">${p.price}</div>
                                          </div>
                                   ))}
                            </div>
                     </div>
                     <div className="w-80 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 flex flex-col">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><ShoppingCart size={18} /> Carrito</h3>
                            <div className="flex-1 space-y-3">
                                   <div className="flex justify-between items-center text-sm text-slate-600 dark:text-zinc-400">
                                          <span>2x Gatorade Azul</span>
                                          <span className="font-bold text-slate-900 dark:text-white">$5,000</span>
                                   </div>
                                   <div className="flex justify-between items-center text-sm text-slate-600 dark:text-zinc-400">
                                          <span>1x Tubo Pelotas</span>
                                          <span className="font-bold text-slate-900 dark:text-white">$12,000</span>
                                   </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-4">
                                   <div className="flex justify-between text-xl font-black mb-4 text-slate-900 dark:text-white">
                                          <span>Total</span>
                                          <span className="text-primary dark:text-primary">$17,000</span>
                                   </div>
                                   <button className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-colors">
                                          Cobrar
                                   </button>
                            </div>
                     </div>
              </div>
       )
}

function MockMetrics() {
       const demoHeatmap = Array.from({ length: 40 }, (_, i) => ({
              day: Math.floor(Math.random() * 7),
              hour: Math.floor(Math.random() * 9) + 14,
              value: Math.floor(Math.random() * 10)
       }))

       return (
              <div className="h-full p-6 overflow-y-auto space-y-6 bg-slate-50 dark:bg-zinc-950">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
                                   <div className="text-slate-500 dark:text-zinc-500 text-xs uppercase font-bold">Ingresos Hoy</div>
                                   <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$145,000</div>
                                   <div className="text-primary dark:text-primary text-xs font-bold">+12% vs ayer</div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
                                   <div className="text-slate-500 dark:text-zinc-500 text-xs uppercase font-bold">Ocupación</div>
                                   <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">85%</div>
                                   <div className="text-accent dark:text-accent text-xs font-bold">Alta Demanda</div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
                                   <div className="text-slate-500 dark:text-zinc-500 text-xs uppercase font-bold">Clientes Nuevos</div>
                                   <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">12</div>
                                   <div className="text-slate-500 dark:text-zinc-500 text-xs font-bold">Esta semana</div>
                            </div>
                     </div>

                     <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Ocupación por Hora</h3>
                            <RevenueHeatmap demoData={demoHeatmap} />
                     </div>
              </div>
       )
}


export default function LandingShowcase() {
       const [date, setDate] = useState(new Date())
       const [activeTab, setActiveTab] = useState<'turnero' | 'kiosco' | 'metricas' | 'torneos'>('turnero')

       const tabs = [
              { id: 'turnero', label: 'Turnero', icon: CalendarDays, color: 'text-primary' },
              { id: 'kiosco', label: 'Punto de Venta', icon: ShoppingCart, color: 'text-accent' },
              { id: 'metricas', label: 'Reportes', icon: BarChart3, color: 'text-blue-500' },
       ]

       // Create dynamic demo data for "Today"
       const demoData = {
              clubId: 'demo',
              config: { openTime: '13:00', closeTime: '23:30', slotDuration: 90 },
              courts: [
                     { id: 1, name: "Cancha Central", sport: "Padel", duration: 90 },
                     { id: 2, name: "Cancha Panorámica", sport: "Padel", duration: 90 },
                     { id: 3, name: "Cancha 3", sport: "Padel", duration: 90 },
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
                            client: { name: "Reserva App" },
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
              <section className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden relative">
                     {/* Background Glow */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                     <div className="max-w-7xl mx-auto px-6 relative z-10">
                            <div className="text-center mb-10">
                                   <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                                          Todo en <span className="text-primary dark:text-primary">Un Solo Lugar</span>
                                   </h2>
                                   <p className="text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
                                          Sistema integral para que no necesites ninguna otra herramienta.
                                   </p>
                            </div>

                            {/* CONTROLS */}
                            <div className="flex justify-center gap-4 mb-8">
                                   {tabs.map(tab => (
                                          <button
                                                 key={tab.id}
                                                 onClick={() => setActiveTab(tab.id as any)}
                                                 className={`
                        flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all
                        ${activeTab === tab.id
                                                               ? 'bg-black text-white dark:bg-white dark:text-black scale-105 shadow-lg shadow-primary/20'
                                                               : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:bg-transparent dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'}
                    `}
                                          >
                                                 <tab.icon size={16} className={activeTab === tab.id ? 'text-white dark:text-black' : tab.color} />
                                                 {tab.label}
                                          </button>
                                   ))}
                            </div>

                            {/* MOCKUP FRAME */}
                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="relative max-w-6xl mx-auto"
                            >
                                   {/* WINDOW CHROME */}
                                   <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-black/50 overflow-hidden min-h-[600px] flex flex-col relative transform transition-transform duration-500 hover:scale-[1.005]">

                                          {/* Window Header */}
                                          <div className="h-10 bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-white/10 flex items-center px-4 gap-2 shrink-0">
                                                 <div className="flex gap-1.5">
                                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                                 </div>
                                                 <div className="flex-1 text-center">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white dark:bg-black/40 shadow-sm border border-slate-200 dark:border-white/10 text-[10px] sm:text-xs font-mono text-slate-500 dark:text-zinc-500">
                                                               <span className="text-primary">🔒</span> courtops.net/dashboard/{activeTab}
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* LIVE COMPONENT PREVIEW */}
                                          <div className="flex-1 bg-slate-50 dark:bg-zinc-950/50 p-2 sm:p-4 relative overflow-hidden">
                                                 <div className="h-full border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#09090b] relative shadow-sm">
                                                        <AnimatePresence mode="wait">
                                                               <motion.div
                                                                      key={activeTab}
                                                                      initial={{ opacity: 0, x: 20 }}
                                                                      animate={{ opacity: 1, x: 0 }}
                                                                      exit={{ opacity: 0, x: -20 }}
                                                                      transition={{ duration: 0.2 }}
                                                                      className="h-full w-full"
                                                               >
                                                                      {activeTab === 'turnero' && (
                                                                             <TurneroGrid
                                                                                    date={date}
                                                                                    onDateChange={setDate}
                                                                                    onBookingClick={() => { }}
                                                                                    onNewBooking={() => { }}
                                                                                    demoData={demoData}
                                                                                    hideHeader={false}
                                                                                    showWaitingList={false}
                                                                             />
                                                                      )}
                                                                      {activeTab === 'kiosco' && <MockKiosco />}
                                                                      {activeTab === 'metricas' && <MockMetrics />}
                                                               </motion.div>
                                                        </AnimatePresence>
                                                 </div>
                                          </div>

                                          {/* Navigation Arrows (Absolute overlay) */}
                                          <button
                                                 onClick={handlePrev}
                                                 className="absolute left-[-20px] md:left-[-50px] top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-xl z-50 group hidden md:block"
                                          >
                                                 <ChevronLeft size={30} />
                                          </button>
                                          <button
                                                 onClick={handleNext}
                                                 className="absolute right-[-20px] md:right-[-50px] top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-xl z-50 group hidden md:block"
                                          >
                                                 <ChevronRight size={30} />
                                          </button>
                                   </div>

                            </motion.div>
                     </div>
              </section>
       )
}
