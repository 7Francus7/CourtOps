import { getClients } from '@/actions/clients'
import ClientsList from '@/components/clients/ClientsList'

export default async function ClientsPage() {
       const clients = await getClients()

       // We pass the full list to the client component for instant filtering
       return <ClientsList initialClients={clients} />
}
