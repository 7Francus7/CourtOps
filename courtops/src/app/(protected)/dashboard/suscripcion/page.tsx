import React from 'react'
import { getSubscriptionDetails } from '@/actions/subscription'
import SubscriptionManager from '@/components/subscription/SubscriptionManager'
import { Header } from '@/components/layout/Header'

export default async function SuscripcionPage() {
       const data = await getSubscriptionDetails()

       return (
              <div className="flex flex-col h-full bg-background transition-colors duration-300">
                     <Header title="Suscripción" backHref="/dashboard" />
                     <div className="flex-1 p-4 md:p-8 min-h-0 overflow-y-auto">
                            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                                   <div className="flex flex-col gap-1">
                                          <h2 className="text-2xl font-bold text-foreground">Planes y Facturación</h2>
                                          <p className="text-muted-foreground">Gestiona tu plan de CourtOps y métodos de pago.</p>
                                   </div>

                                   <SubscriptionManager
                                          currentPlan={data.currentPlan}
                                          subscriptionStatus={data.subscriptionStatus}
                                          nextBillingDate={data.nextBillingDate}
                                          availablePlans={data.availablePlans}
                                          isConfigured={data.isConfigured}
                                          isDevMode={data.isDevMode}
                                   />
                            </div>
                     </div>
              </div>
       )
}
