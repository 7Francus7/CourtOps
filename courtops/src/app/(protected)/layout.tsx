import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmployeeProvider } from '@/contexts/EmployeeContext'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
       const session = await getServerSession(authOptions)

       if (!session) {
              redirect('/login')
       }

       return (
              <EmployeeProvider>
                     {children}
              </EmployeeProvider>
       )
}
