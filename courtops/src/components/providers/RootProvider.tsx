'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { EmployeeProvider } from '@/contexts/EmployeeContext'

export default function RootProvider({ children }: { children: React.ReactNode }) {
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
              <QueryClientProvider client={queryClient}>
                     <EmployeeProvider>
                            {children}
                            <Toaster theme="dark" richColors position="top-center" closeButton />
                     </EmployeeProvider>
              </QueryClientProvider>
       )
}
