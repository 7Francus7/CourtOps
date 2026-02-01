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
              <div className="container mx-auto p-4 lg:p-8 max-w-[1600px] space-y-8">
                     <ClientsDashboard initialData={clients} />
              </div>
       )
}
