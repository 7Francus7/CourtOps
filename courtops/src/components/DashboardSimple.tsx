'use client'

import { useEffect, useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function DashboardSimple({ 
       user,
       clubName 
}: {
       user: any
       clubName: string
}) {
       const [selectedDate, setSelectedDate] = useState(new Date())
       const [turneroData, setTurneroData] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [error, setError] = useState<string | null>(null)

       // Fetch data directly from API
       useEffect(() => {
              const fetchData = async () => {
                     try {
                            setLoading(true)
                            setError(null)

                            const response = await fetch('/api/dashboard/turnero', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ date: selectedDate.toISOString() })
                            })

                            if (!response.ok) {
                                   throw new Error(`HTTP ${response.status}`)
                            }

                            const data = await response.json()
                            setTurneroData(data)
                     } catch (err: any) {
                            console.error('Error fetching data:', err)
                            setError(err.message || 'Error al cargar datos')
                            setTurneroData({ courts: [], config: { openTime: '14:00', closeTime: '00:30', slotDuration: 90 } })
                     } finally {
                            setLoading(false)
                     }
              }

              fetchData()
       }, [selectedDate])

       const courts = turneroData?.courts || []
       const config = turneroData?.config || { openTime: '14:00', closeTime: '00:30', slotDuration: 90 }

       return (
              <div className="min-h-screen bg-background">
                     {/* Header */}
                     <div className="border-b border-border p-6">
                            <div className="max-w-7xl mx-auto flex justify-between items-center">
                                   <div>
                                          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                                          <p className="text-muted-foreground">{clubName}</p>
                                   </div>
                                   <div className="text-right">
                                          <p className="font-medium text-foreground">{user?.name}</p>
                                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                                   </div>
                            </div>
                     </div>

                     {/* Main Content */}
                     <div className="p-6 max-w-7xl mx-auto">
                            {/* Date Selector */}
                            <div className="mb-6 flex items-center justify-between bg-card border border-border rounded-lg p-4">
                                   <button
                                          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                                   >
                                          <ChevronLeft size={20} />
                                   </button>

                                   <div className="text-center flex-1">
                                          <p className="text-sm text-muted-foreground uppercase tracking-widest">
                                                 {format(selectedDate, 'EEEE', { locale: es })}
                                          </p>
                                          <p className="text-2xl font-bold text-foreground">
                                                 {format(selectedDate, 'd MMMM yyyy', { locale: es })}
                                          </p>
                                   </div>

                                   <button
                                          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                                   >
                                          <ChevronRight size={20} />
                                   </button>

                                   <button className="ml-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                          <Plus size={20} />
                                          NUEVA RESERVA
                                   </button>
                            </div>

                            {/* Schedule */}
                            <div className="bg-card border border-border rounded-lg overflow-hidden">
                                   {loading ? (
                                          <div className="h-96 flex items-center justify-center">
                                                 <div className="text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                                                        <p className="text-muted-foreground">Cargando turnero...</p>
                                                 </div>
                                          </div>
                                   ) : error ? (
                                          <div className="h-96 flex items-center justify-center">
                                                 <div className="text-center text-red-500">
                                                        <p className="font-bold mb-2">Error: {error}</p>
                                                        <button
                                                               onClick={() => setSelectedDate(new Date())}
                                                               className="text-sm underline hover:no-underline"
                                                        >
                                                               Reintentar
                                                        </button>
                                                 </div>
                                          </div>
                                   ) : courts.length === 0 ? (
                                          <div className="h-96 flex items-center justify-center text-center">
                                                 <p className="text-muted-foreground">No hay canchas configuradas</p>
                                          </div>
                                   ) : (
                                          <div className="overflow-x-auto">
                                                 <table className="w-full">
                                                        <thead className="bg-muted border-b border-border">
                                                               <tr>
                                                                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Hora</th>
                                                                      {courts.map((court: any) => (
                                                                             <th
                                                                                    key={court.id}
                                                                                    className="px-4 py-3 text-center text-sm font-semibold text-foreground"
                                                                             >
                                                                                    {court.name}
                                                                             </th>
                                                                      ))}
                                                               </tr>
                                                        </thead>
                                                        <tbody>
                                                               {(() => {
                                                                      const slots = []
                                                                      const [startH, startM] = config.openTime.split(':').map(Number)
                                                                      const [endH, endM] = config.closeTime.split(':').map(Number)

                                                                      let hour = startH
                                                                      let min = startM

                                                                      while (hour < endH || (hour === endH && min < endM)) {
                                                                             slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
                                                                             min += config.slotDuration
                                                                             if (min >= 60) {
                                                                                    hour += Math.floor(min / 60)
                                                                                    min = min % 60
                                                                             }
                                                                      }

                                                                      return slots.map((time) => (
                                                                             <tr key={time} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                                                    <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-card">
                                                                                           {time}
                                                                                    </td>
                                                                                    {courts.map((court: any) => (
                                                                                           <td
                                                                                                  key={`${court.id}-${time}`}
                                                                                                  className="px-4 py-3 text-center cursor-pointer hover:bg-emerald-500/10 transition-colors"
                                                                                           >
                                                                                                  <button className="text-sm text-muted-foreground hover:text-emerald-600 hover:font-semibold transition-colors">
                                                                                                         Disponible
                                                                                                  </button>
                                                                                           </td>
                                                                                    ))}
                                                                             </tr>
                                                                      ))
                                                               })()}
                                                        </tbody>
                                                 </table>
                                          </div>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
