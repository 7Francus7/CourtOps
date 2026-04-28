'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { EmployeeProvider } from '@/contexts/EmployeeContext'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { PerformanceProvider } from '@/contexts/PerformanceContext'
import { ConfirmationProvider } from '@/components/providers/ConfirmationProvider'

export default function RootProvider({ children, session }: { children: React.ReactNode, session?: any }) {
       const [queryClient] = useState(() => new QueryClient({
              defaultOptions: {
                     queries: {
                            staleTime: 1000 * 60, // 1 minute
                            retry: 1,
                            refetchOnWindowFocus: false,
                     },
              },
       }))

       return (
              <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
                     <PerformanceProvider>
                            <QueryClientProvider client={queryClient}>
                                   <EmployeeProvider>
                                          <LanguageProvider>
                                                 <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                                                        <ConfirmationProvider>
                                                               {children}
                                                        </ConfirmationProvider>
                                                        <Toaster
                                                               richColors
                                                               position="bottom-right"
                                                               expand
                                                               gap={6}
                                                               closeButton
                                                               toastOptions={{
                                                                      duration: 3500,
                                                                      style: {
                                                                             fontFamily: 'inherit',
                                                                             borderRadius: '14px',
                                                                             fontSize: '13px',
                                                                      },
                                                               }}
                                                        />
                                                 </ThemeProvider>
                                          </LanguageProvider>
                                   </EmployeeProvider>
                            </QueryClientProvider>
                     </PerformanceProvider>
              </SessionProvider>
       )
}
