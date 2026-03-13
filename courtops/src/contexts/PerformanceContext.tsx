'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PerformanceContextType {
       isLowEnd: boolean
       isTV: boolean
       isMobile: boolean
       reduceMotion: boolean
       shouldReduceAnimations: boolean
}

const PerformanceContext = createContext<PerformanceContextType>({
       isLowEnd: false,
       isTV: false,
       isMobile: false,
       reduceMotion: false,
       shouldReduceAnimations: false,
})

export const usePerformance = () => useContext(PerformanceContext)

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
       const [state, setState] = useState<PerformanceContextType>({
              isLowEnd: false,
              isTV: false,
              isMobile: false,
              reduceMotion: false,
              shouldReduceAnimations: false,
       })

       useEffect(() => {
              const ua = navigator.userAgent.toLowerCase()
              const isTV = /smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv|viera|nettv|tizen|webos|philips|roku|aftb|mi-tv|firetv/.test(ua)

              // @ts-expect-error - navigator.deviceMemory is non-standard
              const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4

              const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
              const reduceMotion = motionQuery.matches
              const isMobile = window.innerWidth < 768

              const isLowEnd = isTV || isLowMemory || reduceMotion
              const shouldReduceAnimations = isLowEnd || reduceMotion

              setState({ isLowEnd, isTV, isMobile, reduceMotion, shouldReduceAnimations })

              // Listen for changes
              const handleMotionChange = (e: MediaQueryListEvent) => {
                     setState(prev => ({
                            ...prev,
                            reduceMotion: e.matches,
                            shouldReduceAnimations: prev.isLowEnd || e.matches,
                     }))
              }
              const handleResize = () => {
                     setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }))
              }

              motionQuery.addEventListener('change', handleMotionChange)
              window.addEventListener('resize', handleResize)

              return () => {
                     motionQuery.removeEventListener('change', handleMotionChange)
                     window.removeEventListener('resize', handleResize)
              }
       }, [])

       return (
              <PerformanceContext.Provider value={state}>
                     {children}
              </PerformanceContext.Provider>
       )
}
