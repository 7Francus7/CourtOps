import React from 'react'

export function DashboardSkeleton() {
       return (
              <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500 min-h-0 h-full">
                     {/* KPI Skeletons */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2 flex-shrink-0">
                            {[...Array(4)].map((_, i) => (
                                   <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 p-5 flex flex-col justify-between relative overflow-hidden">
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent shimmer" />
                                          <div className="flex justify-between items-start">
                                                 <div className="h-3 w-20 bg-white/10 rounded-full" />
                                                 <div className="h-8 w-8 bg-white/5 rounded-xl" />
                                          </div>
                                          <div className="h-8 w-32 bg-white/10 rounded-lg mt-4" />
                                   </div>
                            ))}
                     </div>

                     {/* Turnero Skeleton */}
                     <div className="flex-1 min-h-0 bg-card-dark border border-white/5 rounded-2xl overflow-hidden relative">
                            <div className="absolute inset-x-0 top-0 h-16 border-b border-white/5 flex items-center px-6 gap-4">
                                   <div className="h-8 w-8 bg-white/5 rounded-full" />
                                   <div className="h-6 w-32 bg-white/5 rounded-lg" />
                                   <div className="h-8 w-8 bg-white/5 rounded-full" />
                                   <div className="ml-auto h-10 w-40 bg-white/5 rounded-xl" />
                            </div>
                            <div className="absolute inset-0 top-16 grid grid-cols-6 gap-px bg-white/5">
                                   {[...Array(18)].map((_, i) => (
                                          <div key={i} className="bg-card-dark relative overflow-hidden">
                                                 {i % 5 === 0 && <div className="absolute inset-x-2 inset-y-4 bg-white/[0.02] rounded-lg" />}
                                          </div>
                                   ))}
                            </div>
                     </div>
              </div>
       )
}
