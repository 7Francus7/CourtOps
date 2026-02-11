
import React from 'react'

export default function TermsPage() {
       return (
              <div className="min-h-screen bg-background text-foreground font-sans p-8 md:p-16">
                     <div className="max-w-3xl mx-auto space-y-8">
                            <header className="border-b border-border pb-8">
                                   <h1 className="text-3xl font-black mb-2">Términos y Condiciones</h1>
                                   <p className="text-muted-foreground">Última actualización: 11 de Febrero, 2026</p>
                            </header>

                            <section className="space-y-4 text-justify">
                                   <h2 className="text-xl font-bold">1. Aceptación de los Términos</h2>
                                   <p>
                                          Al registrarse y utilizar los servicios de CourtOps ("la Plataforma"), usted acepta cumplir y estar sujeto a los siguientes términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros servicios.
                                   </p>

                                   <h2 className="text-xl font-bold">2. Descripción del Servicio</h2>
                                   <p>
                                          CourtOps proporciona software de gestión para clubes deportivos (SaaS), incluyendo reservas, punto de venta y administración de clientes. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento.
                                   </p>

                                   <h2 className="text-xl font-bold">3. Cuentas y Seguridad</h2>
                                   <p>
                                          Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. CourtOps no se hace responsable de ninguna pérdida o daño derivado del incumplimiento de esta obligación.
                                   </p>

                                   <h2 className="text-xl font-bold">4. Pagos y Suscripciones</h2>
                                   <p>
                                          El servicio se ofrece bajo un modelo de suscripción. Los pagos son procesados de forma segura a través de proveedores externos. El incumplimiento en el pago puede resultar en la suspensión del servicio.
                                   </p>

                                   <h2 className="text-xl font-bold">5. Limitación de Responsabilidad</h2>
                                   <p>
                                          CourtOps no será responsable por daños indirectos, incidentales, especiales o consecuentes, incluyendo la pérdida de beneficios o datos, derivados del uso o la imposibilidad de uso del servicio.
                                   </p>

                                   <h2 className="text-xl font-bold">6. Modificaciones</h2>
                                   <p>
                                          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la Plataforma.
                                   </p>

                                   <h2 className="text-xl font-bold">7. Contacto</h2>
                                   <p>
                                          Si tiene preguntas sobre estos términos, por favor contáctenos a legal@courtops.com.
                                   </p>
                            </section>
                     </div>
              </div>
       )
}
