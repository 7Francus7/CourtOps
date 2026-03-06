
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PerformanceContextType {
       isLowEnd: boolean
       isTV: boolean
       reduceMotion: boolean
}

const PerformanceContext = createContext<PerformanceContextType>({
       isLowEnd: false,
       isTV: false,
       reduceMotion: false
})

export const usePerformance = () => useContext(PerformanceContext)

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
       const [state, setState] = useState<PerformanceContextType>({
              isLowEnd: false,
              isTV: false,
              reduceMotion: false
       })

       useEffect(() => {
              const ua = navigator.userAgent.toLowerCase()
              const isTV = /smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv|viera|nettv|tizen|webos|philips|roku|aftb|mi-tv|firetv/.test(ua)

              // Check for low memory if available (Chrome/Edge)
              // @ts-expect-error - navigator.deviceMemory is a non-standard property available in some browsers
              const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4

              // Check for slow connection or reduced motion preference
              const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
              const reduceMotion = mediaQuery.matches

              // Determine if we should treat it as low-end
              const isLowEnd = isTV || isLowMemory || reduceMotion

              setState({
                     isLowEnd,
                     isTV,
                     reduceMotion
              })
       }, [])

       return (
              <PerformanceContext.Provider value={state}>
                     {children}
              </PerformanceContext.Provider>
       )
}
