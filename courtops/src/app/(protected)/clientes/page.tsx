export const dynamic = 'force-dynamic'
import { getClients } from '@/actions/clients'
import ClientsDashboard from '@/components/clients/ClientsDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
       title: 'Gestión de Clientes',
       description: 'CRM de jugadores y retención'
}

export default async function ClientsPage() {
       const result = await getClients()
       const clients = result.success ? result.data : []

       return (
              <div className="flex flex-col h-full bg-background">
                     <div className="flex-1 min-h-0 px-4 lg:px-8 pt-4 lg:pt-6 pb-4 max-w-[1600px] mx-auto w-full flex flex-col">
                            <ClientsDashboard initialData={clients} />
                     </div>
              </div>
       )
}
