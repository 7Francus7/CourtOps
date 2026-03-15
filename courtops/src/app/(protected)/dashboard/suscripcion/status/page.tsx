import { handleSubscriptionSuccess } from '@/actions/subscription'
import { CheckCircle2, AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function SubscriptionStatusPage({
       searchParams,
}: {
       searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
       const resolvedParams = await searchParams

       // Support both MP (preapproval_id) and Stripe (session_id) flows
       const preapprovalId = (resolvedParams['preapproval_id'] || resolvedParams['session_id']) as string
       const status = resolvedParams['status'] as string

       if (!preapprovalId || !status) {
              return (
                     <div className="h-full min-h-[80vh] w-full flex items-center justify-center p-4">
                            <div className="max-w-md w-full text-center space-y-4">
                                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                          <AlertCircle className="w-8 h-8 text-muted-foreground" />
                                   </div>
                                   <h2 className="text-xl font-bold">Enlace Inválido</h2>
                                   <p className="text-muted-foreground">No se pudo verificar el estado del pago. Faltan parámetros requeridos.</p>
                                   <Link href="/dashboard/suscripcion" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                                          <ArrowLeft className="w-4 h-4" /> Volver a Suscripción
                                   </Link>
                            </div>
                     </div>
              )
       }

       let isSuccess = false
       let isPending = false
       let message = ""

       if (status === 'authorized') {
              try {
                     await handleSubscriptionSuccess(preapprovalId)
                     isSuccess = true
                     message = "¡Tu suscripción ha sido activada correctamente!"
              } catch (error: unknown) {
                     console.error("Error confirming subscription:", error)
                     const errMsg = error instanceof Error ? error.message : ""
                     // If webhook hasn't processed yet, show pending state
                     if (errMsg.includes('webhook')) {
                            isPending = true
                            message = "Tu pago fue recibido. La activación puede demorar unos segundos."
                     } else {
                            message = errMsg || "Hubo un error al activar tu plan."
                     }
              }
       } else if (status === 'pending') {
              isPending = true
              message = "El pago está procesándose. Tu plan se activará en cuanto se confirme."
       } else {
              message = "El pago no fue autorizado o fue cancelado."
       }

       const icon = isSuccess
              ? <CheckCircle2 className="w-10 h-10" />
              : isPending
                     ? <Clock className="w-10 h-10" />
                     : <AlertCircle className="w-10 h-10" />

       const colorClass = isSuccess
              ? 'border-green-500/20'
              : isPending
                     ? 'border-amber-500/20'
                     : 'border-destructive/20'

       const iconBgClass = isSuccess
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : isPending
                     ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                     : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'

       const glowColor = isSuccess ? 'bg-green-500' : isPending ? 'bg-amber-500' : 'bg-red-500'

       return (
              <div className="h-full min-h-[80vh] w-full flex items-center justify-center p-4 bg-background">
                     <div className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl relative overflow-hidden bg-card ${colorClass}`}>
                            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none opacity-20 ${glowColor}`} />

                            <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                   <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${iconBgClass}`}>
                                          {icon}
                                   </div>

                                   <div className="space-y-2">
                                          <h1 className="text-2xl font-black tracking-tight text-foreground">
                                                 {isSuccess ? '¡Todo Listo!' : isPending ? 'Procesando...' : 'Hubo un Problema'}
                                          </h1>
                                          <p className="text-muted-foreground text-sm leading-relaxed">
                                                 {message}
                                          </p>
                                   </div>

                                   <div className="pt-4 w-full">
                                          <Link
                                                 href="/dashboard/suscripcion"
                                                 className={`block w-full py-4 rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                                                        isSuccess || isPending
                                                               ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                               : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                 }`}
                                          >
                                                 {isSuccess ? 'Ver Mi Plan' : isPending ? 'Revisar Estado' : 'Intentar Nuevamente'}
                                          </Link>
                                          <div className="mt-4">
                                                 <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                        Ir al Inicio
                                                 </Link>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
