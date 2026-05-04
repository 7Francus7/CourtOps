import { PaymentProvider, SubscriptionPaymentParams, PaymentResponse, PaymentValidationResult } from "./PaymentProvider";
import prisma from "@/lib/db";

export class TransferProvider implements PaymentProvider {
    async createSubscriptionPayment(params: SubscriptionPaymentParams): Promise<PaymentResponse> {
        try {
            // Fetch club settings to get the bank details
            const club = await prisma.club.findUnique({
                where: { id: params.clubId },
                select: { bankAlias: true, bankCvu: true, bankAccountName: true }
            });

            if (!club) {
                return { success: false, error: "Club no encontrado" };
            }

            // Return the instructions for the transfer
            return {
                success: true,
                referenceId: `TR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                instructions: {
                    bankAlias: club.bankAlias || undefined,
                    bankCvu: club.bankCvu || undefined,
                    bankAccountName: club.bankAccountName || undefined,
                }
            };
        } catch (error: any) {
            console.error("[TransferProvider] Error creando pago:", error);
            return { success: false, error: error.message || "Error al generar instrucciones de transferencia" };
        }
    }

    async validatePayment(paymentReference: string): Promise<PaymentValidationResult> {
        // Transfers are validated manually by the admin, so the system itself doesn't "validate" them automatically
        // This function could check if an admin has marked it as approved in the DB, 
        // but typically the UI triggers the status update. 
        // For the sake of the interface, we'll fetch the current DB status.
        try {
            const payment = await prisma.subscriptionPayment.findFirst({
                where: { reference: paymentReference, method: "TRANSFER" }
            });

            if (!payment) {
                return { isValid: false, status: 'REJECTED', error: "Pago no encontrado" };
            }

            return {
                isValid: payment.status === 'APPROVED',
                status: payment.status as any,
                amountPaid: payment.amount,
                paymentDate: payment.paymentDate,
            };
        } catch (error: any) {
            console.error("[TransferProvider] Error validando pago:", error);
            return { isValid: false, status: 'PENDING', error: error.message };
        }
    }
}
