'use client'

import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getWeeklyRevenue } from '@/actions/finance'
import { TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SalesChart() {
       const [data, setData] = useState<{ date: string, fullDate: string, amount: number }[]>([])
       const [loading, setLoading] = useState(true)

       useEffect(() => {
              getWeeklyRevenue().then(res => {
                     if (res.success && res.data) {
                            setData(res.data)
                     }
                     setLoading(false)
              })
       }, [])

       if (loading) {
              return (
                     <div className="h-full flex items-center justify-center">
                            <div className="animate-pulse flex flex-col items-center gap-2">
                                   <div className="h-32 w-full bg-white/5 rounded-xl"></div>
                            </div>
                     </div>
              )
       }

       const total = data.reduce((sum, item) => sum + item.amount, 0)

       // Custom Tooltip
       const CustomTooltip = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                     return (
                            <div className="bg-[#18181B] border border-white/10 p-3 rounded-xl shadow-xl">
                                   <p className="text-zinc-400 text-xs mb-1 font-bold uppercase tracking-wider">{payload[0].payload.fullDate}</p>
                                   <p className="text-emerald-400 font-bold text-lg">
                                          ${payload[0].value.toLocaleString()}
                                   </p>
                            </div>
                     )
              }
              return null
       };

       return (
              <div className="h-full flex flex-col p-6 relative overflow-hidden">
                     {/* Header */}
                     <div className="flex justify-between items-start mb-4 z-10">
                            <div>
                                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1">
                                          <TrendingUp size={14} className="text-emerald-500" />
                                          Ingresos Semanales
                                   </h4>
                                   <p className="text-2xl font-black text-white tracking-tight">
                                          ${total.toLocaleString()}
                                   </p>
                            </div>
                            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                   <DollarSign size={16} className="text-emerald-500" />
                            </div>
                     </div>

                     {/* Chart */}
                     <div className="flex-1 w-full min-h-0 relative z-10 -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={data}>
                                          <defs>
                                                 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                 </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                          <XAxis
                                                 dataKey="date"
                                                 axisLine={false}
                                                 tickLine={false}
                                                 tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                                                 dy={10}
                                          />
                                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                          <Area
                                                 type="monotone"
                                                 dataKey="amount"
                                                 stroke="#10b981"
                                                 strokeWidth={3}
                                                 fillOpacity={1}
                                                 fill="url(#colorRevenue)"
                                          />
                                   </AreaChart>
                            </ResponsiveContainer>
                     </div>

                     {/* Background Decor */}
                     <div className="absolute -right-4 -bottom-10 opacity-[0.03] rotate-12 bg-gradient-to-tr from-emerald-500 to-transparent w-64 h-64 rounded-full blur-3xl pointer-events-none"></div>
              </div>
       )
}
