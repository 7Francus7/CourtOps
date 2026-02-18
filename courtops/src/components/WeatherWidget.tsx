'use client'

import React, { useState, useEffect } from 'react'
import { CloudRain, CloudSun, Sun, Wind, Droplets, CloudLightning, Snowflake, Cloud, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// WMO Weather Codes interpretation
function getWeatherIcon(code: number) {
       if (code === 0) return Sun // Clear sky
       if (code >= 1 && code <= 3) return CloudSun // Party cloudy
       if (code >= 45 && code <= 48) return Cloud // Fog
       if (code >= 51 && code <= 67) return CloudRain // Drizzle/Rain
       if (code >= 71 && code <= 77) return Snowflake // Snow
       if (code >= 80 && code <= 82) return CloudRain // Showers
       if (code >= 95 && code <= 99) return CloudLightning // Thunderstorm
       return Sun
}

function getWeatherDescription(code: number) {
       if (code === 0) return 'Despejado'
       if (code >= 1 && code <= 3) return 'Parcialmente Nublado'
       if (code >= 45 && code <= 48) return 'Niebla'
       if (code >= 51 && code <= 67) return 'Lluvioso'
       if (code >= 71 && code <= 77) return 'Nieve'
       if (code >= 95 && code <= 99) return 'Tormenta'
       return 'Despejado'
}

function getBackgroundClass(code: number) {
       if (code === 0) return "from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700" // Clear
       if (code >= 1 && code <= 3) return "from-blue-300 to-slate-400 dark:from-slate-700 dark:to-slate-900" // Cloudy
       if (code >= 51) return "from-slate-500 to-slate-700 dark:from-slate-800 dark:to-slate-950" // Rain/Storm
       return "from-blue-500 to-blue-600"
}

const useWeather = () => {
       const [data, setData] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [locationName, setLocationName] = useState('Ubicación Actual')

       useEffect(() => {
              // Check if previously denied to avoid repeated prompts
              const permissionStatus = localStorage.getItem('weather_permission_status')
              if (permissionStatus === 'denied') {
                     setLoading(false)
                     return
              }

              if (!navigator.geolocation) {
                     setLoading(false)
                     return
              }

              navigator.geolocation.getCurrentPosition(async (position) => {
                     // Permission granted
                     localStorage.setItem('weather_permission_status', 'granted')
                     try {
                            const { latitude, longitude } = position.coords

                            // Fetch Weather
                            const weatherRes = await fetch(
                                   `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
                            )
                            const weatherData = await weatherRes.json()

                            setData({
                                   temp: Math.round(weatherData.current.temperature_2m),
                                   code: weatherData.current.weather_code,
                                   humidity: weatherData.current.relative_humidity_2m,
                                   wind: Math.round(weatherData.current.wind_speed_10m),
                                   condition: getWeatherDescription(weatherData.current.weather_code)
                            })

                     } catch (error) {
                            console.error("Error fetching weather:", error)
                     } finally {
                            setLoading(false)
                     }
              }, (error) => {
                     console.warn("Geolocation denied or error:", error)
                     if (error.code === error.PERMISSION_DENIED) {
                            localStorage.setItem('weather_permission_status', 'denied')
                     }
                     setLoading(false)
              })
       }, [])

       return { data, loading, locationName }
}

export function WeatherWidget({ className }: { className?: string }) {
       const { data: weather, loading, locationName } = useWeather()

       if (loading) return (
              <div className={cn("h-32 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse flex items-center justify-center", className)}>
                     <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
       )

       if (!weather) return null // Hide if no data/permission

       const WeatherIcon = getWeatherIcon(weather.code)
       const bgClass = getBackgroundClass(weather.code)

       return (
              <div className={cn(
                     "relative overflow-hidden rounded-3xl p-5 text-white shadow-lg transition-all duration-1000",
                     "bg-gradient-to-br",
                     bgClass,
                     className
              )}>
                     {/* Decorative Background Elements */}
                     <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                     <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                     {/* Rain/Snow effects could be added here based on code */}

                     <div className="relative z-10 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2 mb-2">
                                          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
                                                 <MapPin size={10} className="text-white" />
                                          </div>
                                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">{locationName}</span>
                                   </div>

                                   <div className="flex items-end gap-3">
                                          <span className="text-5xl font-black tracking-tighter drop-shadow-sm">{weather.temp}°</span>
                                          <div className="flex flex-col mb-1.5">
                                                 <span className="text-sm font-bold opacity-100 leading-none">{weather.condition}</span>
                                                 <span className="text-[10px] opacity-80 font-medium">Sensación térmica</span>
                                          </div>
                                   </div>
                            </div>

                            <div className="flex flex-col items-end gap-4">
                                   <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-lg backdrop-blur-md relative overflow-hidden group">
                                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                          <WeatherIcon className={cn(
                                                 "w-8 h-8 text-white drop-shadow-md",
                                                 weather.code === 0 ? "animate-[spin_20s_linear_infinite]" : "animate-pulse"
                                          )} />
                                   </div>

                                   <div className="flex items-center gap-3 text-xs font-bold bg-black/10 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                                          <div className="flex items-center gap-1.5">
                                                 <Droplets size={12} className="text-blue-200" />
                                                 <span className="opacity-90">{weather.humidity}%</span>
                                          </div>
                                          <div className="w-px h-3 bg-white/20" />
                                          <div className="flex items-center gap-1.5">
                                                 <Wind size={12} className="text-slate-200" />
                                                 <span className="opacity-90">{weather.wind} km/h</span>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
