
'use client'

import TurneroGrid from "@/components/TurneroGrid"
import { addHours, set, format } from "date-fns"
import { motion } from "framer-motion"
import { useState } from "react"

export default function LandingShowcase() {
       const [date, setDate] = useState(new Date())

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
                            paymentStatus: 'PAID', // Should trigger green
                            status: 'CONFIRMED',
                            transactions: [{ amount: 32000 }] // Full paid
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

       return (
              <section className="py-24 bg-zinc-950 overflow-hidden relative">
                     {/* Background Glow */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                     <div className="max-w-7xl mx-auto px-6 relative z-10">
                            <div className="text-center mb-16">
                                   <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                                          Gestión <span className="text-emerald-500">Visual</span> e Intuitiva
                                   </h2>
                                   <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                                          Olvídate de las planillas de Excel. Nuestro sistema visual te permite gestionar tu club con la simplicidad de arrastrar y soltar.
                                   </p>
                            </div>

                            {/* MOCKUP FRAME */}
                            <motion.div
                                   initial={{ opacity: 0, y: 40, rotateX: 20 }}
                                   whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                   viewport={{ once: true, margin: "-100px" }}
                                   transition={{ duration: 1, type: "spring" }}
                                   style={{ perspective: 1000 }}
                                   className="relative"
                            >
                                   {/* WINDOW CHROME */}
                                   <div className="bg-[#1a1b1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden max-w-5xl mx-auto transform transition-transform hover:scale-[1.01] duration-500">
                                          {/* Window Header */}
                                          <div className="h-10 bg-[#121316] border-b border-white/5 flex items-center px-4 gap-2">
                                                 <div className="flex gap-1.5">
                                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                                 </div>
                                                 <div className="flex-1 text-center">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black/20 text-[10px] sm:text-xs font-mono text-zinc-500">
                                                               <span className="text-emerald-500">🔒</span> courtops.net/dashboard
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* LIVE COMPONENT PREVIEW */}
                                          {/* We constrain height to simulate viewport and enable scroll */}
                                          <div className="h-[600px] bg-black/50 p-4 overflow-hidden relative pointer-events-none sm:pointer-events-auto dark">
                                                 {/* Overlay to prevent dragging if we want it purely visual */}
                                                 {/* <div className="absolute inset-0 z-50 bg-transparent" /> */}

                                                 <div className="h-full border border-white/5 rounded-xl overflow-hidden bg-[#09090b]">
                                                        <TurneroGrid
                                                               date={date}
                                                               onDateChange={setDate}
                                                               onBookingClick={() => { }}
                                                               onNewBooking={() => { }}
                                                               demoData={demoData}
                                                               hideHeader={false}
                                                        />
                                                 </div>
                                          </div>

                                          {/* Floating Labels */}
                                          <div className="absolute -right-4 top-1/3 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-l-lg shadow-lg rotate-3 z-50">
                                                 Drag & Drop Real
                                          </div>
                                          <div className="absolute -left-4 bottom-1/3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-lg -rotate-3 z-50">
                                                 Gestión de Pagos
                                          </div>
                                   </div>

                                   {/* Reflection/Ground Effect */}
                                   <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-t from-emerald-500/5 to-transparent blur-xl" />
                            </motion.div>
                     </div>
              </section>
       )
}
