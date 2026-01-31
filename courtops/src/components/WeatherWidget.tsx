'use client'

import React, { useState, useEffect } from 'react'
import { CloudRain, CloudSun, Sun, Wind, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data generator for demo purposes
// In production, this would fetch from an API like OpenWeatherMap
const useWeather = () => {
       const [data, setData] = useState<any>(null)

       useEffect(() => {
              // Simulate API call
              setData({
                     temp: 24,
                     condition: 'Sunny',
                     humidity: 45,
                     wind: 12,
                     forecast: 'Ideal para jugar'
              })
       }, [])

       return data
}

export function WeatherWidget({ className }: { className?: string }) {
       const weather = useWeather()

       if (!weather) return (
              <div className={cn("h-24 rounded-3xl bg-white/5 animate-pulse", className)} />
       )

       return (
              <div className={cn(
                     "relative overflow-hidden rounded-3xl p-5 text-white shadow-lg",
                     "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800",
                     className
              )}>
                     {/* Decorative Background Elements */}
                     <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                     <div className="absolute bottom-[-20%] left-[-10%] w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

                     <div className="relative z-10 flex items-center justify-between">
                            <div>
                                   <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Clima Actual</span>
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white border border-white/10">
                                                 Buenos Aires
                                          </span>
                                   </div>
                                   <div className="flex items-end gap-2">
                                          <span className="text-4xl font-black tracking-tighter">{weather.temp}°</span>
                                          <span className="text-sm font-bold mb-1.5 opacity-90">{weather.condition}</span>
                                   </div>
                                   <p className="text-xs font-medium opacity-80 mt-1 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                          {weather.forecast}
                                   </p>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                   <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
                                          <Sun className="w-8 h-8 text-yellow-300 animate-[spin_10s_linear_infinite]" />
                                   </div>

                                   <div className="flex items-center gap-3 text-xs font-bold">
                                          <div className="flex items-center gap-1 opacity-80">
                                                 <Droplets size={12} className="text-blue-200" />
                                                 {weather.humidity}%
                                          </div>
                                          <div className="flex items-center gap-1 opacity-80">
                                                 <Wind size={12} className="text-slate-200" />
                                                 {weather.wind}km/h
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
