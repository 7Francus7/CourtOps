export const dynamic = 'force-dynamic'
import { getClientDetails } from '@/actions/clients'
import { getMembershipPlans } from '@/actions/memberships'
import ClientDetailView from './ClientDetailView'
import Link from 'next/link'

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
       const resolvedParams = await params
       const client = await getClientDetails(Number(resolvedParams.id))
       const plans = await getMembershipPlans()

       return (
              <div>
                     <div className="p-4 lg:px-8">
                            <Link href="/clientes" className="text-text-grey hover:text-white mb-4 inline-block text-sm transition-colors">← Volver a Clientes</Link>
                     </div>
                     <ClientDetailView client={client} plans={plans} />
              </div>
       )
}
