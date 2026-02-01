import { redirect } from 'next/navigation'
import { handleSubscriptionSuccess } from '@/actions/subscription'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default async function SubscriptionStatusPage({
       searchParams,
}: {
       searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
       const resolvedParams = await searchParams
       const preapprovalId = resolvedParams['preapproval_id'] as string
       const status = resolvedParams['status'] as string

       if (preapprovalId && status === 'authorized') {
              try {
                     // Attempt to update the subscription status
                     await handleSubscriptionSuccess(preapprovalId)
              } catch (error) {
                     console.error("Error confirming subscription:", error)
                     return (
                            <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-dark)] text-white p-4">
                                   <div className="bg-bg-card border border-red-500/50 max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center gap-4">
                                          <AlertCircle className="w-16 h-16 text-red-500" />
                                          <h2 className="text-2xl font-bold">Error al confirmar</h2>
                                          <p className="text-zinc-400">Hubo un problema al activar tu suscripción. Por favor contacta a soporte.</p>
                                          <Link href="/dashboard/suscripcion" className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors">
                                                 Volver
                                          </Link>
                                   </div>
                            </div>
                     )
              }
       } else if (preapprovalId && status !== 'authorized') {
              return (
                     <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-dark)] text-white p-4">
                            <div className="bg-bg-card border border-yellow-500/50 max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center gap-4">
                                   <AlertCircle className="w-16 h-16 text-yellow-500" />
                                   <h2 className="text-2xl font-bold">Pago no autorizado</h2>
                                   <p className="text-zinc-400">El pago no fue completado o autorizado. Intenta nuevamente.</p>
                                   <Link href="/dashboard/suscripcion" className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors">
                                          Volver
                                   </Link>
                            </div>
                     </div>
              )
       }

       // Success View (Implicit if no error thrown)
       return (
              <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-dark)] text-white p-4">
                     <div className="bg-bg-card border border-white/10 max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center gap-4 shadow-2xl">
                            <div className="relative">
                                   <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                                   <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mt-4">¡Suscripción Activada!</h2>
                            <p className="text-zinc-400">
                                   Gracias por confiar en CourtOps. Tu plan ha sido actualizado correctamente.
                            </p>

                            <div className="pt-6 w-full">
                                   <Link href="/dashboard" className="block w-full text-center btn-primary py-3 rounded-xl font-bold text-lg">
                                          Ir al Dashboard
                                   </Link>
                            </div>
                     </div>
              </div>
       )
}
