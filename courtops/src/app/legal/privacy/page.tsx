
import React from 'react'

export default function PrivacyPage() {
       return (
              <div className="min-h-screen bg-background text-foreground font-sans p-8 md:p-16">
                     <div className="max-w-3xl mx-auto space-y-8">
                            <header className="border-b border-border pb-8">
                                   <h1 className="text-3xl font-black mb-2">Política de Privacidad</h1>
                                   <p className="text-muted-foreground">Última actualización: 11 de Febrero, 2026</p>
                            </header>

                            <section className="space-y-4 text-justify">
                                   <h2 className="text-xl font-bold">1. Recolección de Información</h2>
                                   <p>
                                          Recopilamos información que usted nos proporciona directamente al registrarse, como nombre, correo electrónico y datos del club. También recopilamos datos de uso y transacciones realizadas a través de la Plataforma.
                                   </p>

                                   <h2 className="text-xl font-bold">2. Uso de la Información</h2>
                                   <p>
                                          Utilizamos su información para proporcionar, mantener y mejorar nuestros servicios, procesar transacciones, enviar notificaciones y comunicarnos con usted sobre actualizaciones y promociones.
                                   </p>

                                   <h2 className="text-xl font-bold">3. Compartir Información</h2>
                                   <p>
                                          No vendemos ni alquilamos su información personal a terceros. Podemos compartir información con proveedores de servicios que nos ayudan a operar nuestra plataforma (ej. procesadores de pago), siempre bajo estrictos acuerdos de confidencialidad.
                                   </p>

                                   <h2 className="text-xl font-bold">4. Seguridad de Datos</h2>
                                   <p>
                                          Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra el acceso no autorizado, la alteración o la destrucción.
                                   </p>

                                   <h2 className="text-xl font-bold">5. Sus Derechos</h2>
                                   <p>
                                          Usted tiene derecho a acceder, corregir o eliminar su información personal. Puede gestionar sus datos directamente desde su cuenta o contactándonos.
                                   </p>

                                   <h2 className="text-xl font-bold">6. Contacto</h2>
                                   <p>
                                          Si tiene preguntas sobre nuestra política de privacidad, por favor contáctenos a privacidad@courtops.com.
                                   </p>
                            </section>
                     </div>
              </div>
       )
}
