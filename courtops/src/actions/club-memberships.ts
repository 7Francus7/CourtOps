'use server'

import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago'
import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'

/**
 * Crea o actualiza un Plan de Suscripción en MercadoPago para que los clientes se suscriban.
 * Esto se debe ejecutar cuando el admin del club crea un MembershipPlan en el sistema.
 */
export async function syncPlanWithMercadoPago(localPlanId: string) {
       try {
              const clubId = await getCurrentClubId()
              const club = await prisma.club.findUnique({ where: { id: clubId } })

              if (!club || !club.mpAccessToken) {
                     throw new Error("El club no tiene configurado Mercado Pago")
              }

              const plan = await prisma.membershipPlan.findUnique({ where: { id: localPlanId } })
              if (!plan) throw new Error("Plan local no encontrado")

              const client = new MercadoPagoConfig({ accessToken: club.mpAccessToken })
              const preapprovalPlan = new PreApprovalPlan(client)

              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              const backUrl = `${baseUrl}/dashboard/suscripcion/status` // PENDING: Definir URL de retorno real para el cliente

              // Si ya tiene ID, intentamos actualizar (Nota: MP tiene restricciones para update de planes)
              // Por simplicidad, si ya existe, asumimos que está bien o creamos uno nuevo si cambió mucho.
              // Aquí vamos a crear uno nuevo siempre si no tiene ID.

              if (plan.mpPreapprovalPlanId) {
                     // Ya tiene plan, podríamos chequear estado, pero por ahora retornamos éxito.
                     return { success: true, id: plan.mpPreapprovalPlanId }
              }

              const response = await preapprovalPlan.create({
                     body: {
                            reason: `Suscripción ${plan.name} - ${club.name}`,
                            auto_recurring: {
                                   frequency: 1,
                                   frequency_type: 'months',
                                   repetitions: undefined, // undefined = indefinido (hasta que cancele)
                                   billing_day: undefined, // MP decide o basado en fecha de inicio
                                   billing_day_proportional: true,
                                   transaction_amount: plan.price,
                                   currency_id: 'ARS'
                            },
                            payment_methods_allowed: {
                                   payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }],
                                   payment_methods: []
                            },
                            back_url: backUrl,
                            status: 'active',
                            external_reference: localPlanId
                     }
              })

              // Guardar el ID de MP en nuestra DB
              await prisma.membershipPlan.update({
                     where: { id: localPlanId },
                     data: { mpPreapprovalPlanId: response.id }
              })

              return { success: true, id: response.id }

       } catch (error: any) {
              console.error("Error syncing MP Plan:", error)
              return { success: false, error: error.message }
       }
}

/**
 * Genera un link de pago para que un Cliente se suscriba a un Plan.
 */
export async function createClientSubscriptionPreference(clientId: number, localPlanId: string) {
       try {
              const clubId = await getCurrentClubId()
              const club = await prisma.club.findUnique({ where: { id: clubId } })

              if (!club || !club.mpAccessToken) {
                     throw new Error("El club no tiene configurado Mercado Pago")
              }

              const clientData = await prisma.client.findUnique({ where: { id: clientId } })
              if (!clientData) throw new Error("Cliente no encontrado")

              const plan = await prisma.membershipPlan.findUnique({ where: { id: localPlanId } })
              if (!plan || !plan.mpPreapprovalPlanId) {
                     // Intentar sincronizar on-the-fly si falta
                     if (plan && !plan.mpPreapprovalPlanId) {
                            const sync = await syncPlanWithMercadoPago(localPlanId)
                            if (!sync.success) throw new Error("Error al sincronizar plan con Mercado Pago: " + sync.error)
                            // Refetch plane updated
                            const updatedPlan = await prisma.membershipPlan.findUnique({ where: { id: localPlanId } })
                            if (!updatedPlan?.mpPreapprovalPlanId) throw new Error("Error crítico obteniendo ID de plan MP")
                            plan.mpPreapprovalPlanId = updatedPlan.mpPreapprovalPlanId
                     } else {
                            throw new Error("El plan no está sincronizado con Mercado Pago")
                     }
              }

              // Para suscribir un usuario a un PLAN predefinido (Preapproval Plan), 
              // usamos /preapproval pero referenciando al preapproval_plan_id.
              // O más simple: generamos una suscripción standalone vinculada a ese plan.

              // MercadoPago SDK:
              const client = new MercadoPagoConfig({ accessToken: club.mpAccessToken })
              const preapproval = new PreApproval(client)

              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://courtops.com'
              const backUrl = `${baseUrl}/p/${club.slug}/suscripcion/status` // URL pública

              const response = await preapproval.create({
                     body: {
                            preapproval_plan_id: plan.mpPreapprovalPlanId,
                            payer_email: clientData.email || 'guest@courtops.com', // MP requiere email
                            external_reference: `${clubId}___${clientId}___${localPlanId}`, // Para identificar en webhook
                            back_url: backUrl,
                            status: 'pending',
                            auto_recurring: {
                                   currency_id: 'ARS',
                                   transaction_amount: plan.price,
                                   frequency: 1,
                                   frequency_type: 'months'
                            }
                     }
              })

              return { success: true, init_point: response.init_point }

       } catch (error: any) {
              console.error("Error creating subscription preference:", error)
              return { success: false, error: error.message }
       }
}

/**
 * Cancela una suscripción de un cliente en MP
 */
export async function cancelClientSubscription(mpPreapprovalId: string) {
       try {
              const clubId = await getCurrentClubId()
              const club = await prisma.club.findUnique({ where: { id: clubId } })
              if (!club || !club.mpAccessToken) throw new Error("Configuración inválida")

              const client = new MercadoPagoConfig({ accessToken: club.mpAccessToken })
              const preapproval = new PreApproval(client)

              await preapproval.update({
                     id: mpPreapprovalId,
                     body: { status: 'cancelled' }
              })

              return { success: true }
       } catch (error: any) {
              return { success: false, error: error.message }
       }
}
