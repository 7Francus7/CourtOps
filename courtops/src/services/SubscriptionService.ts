import prisma from "@/lib/db";
import { TransferProvider } from "./payments/TransferProvider";

const transferProvider = new TransferProvider();

export class SubscriptionService {
    
    /**
     * Initializes a subscription payment. 
     * If the method is TRANSFER, it returns the bank details.
     * If the method is MERCADOPAGO, it could return the checkout URL.
     */
    static async initiatePayment(params: {
        clubId: string;
        planId: string;
        method: "TRANSFER" | "MERCADOPAGO";
        amount: number;
        billingCycle: "monthly" | "yearly";
        customerEmail?: string;
    }) {
        const { clubId, planId, method, amount, billingCycle, customerEmail } = params;

        let referenceId = "";
        let instructions: any = null;
        let checkoutUrl = "";

        if (method === "TRANSFER") {
            const res = await transferProvider.createSubscriptionPayment({
                clubId, planId, amount, billingCycle, customerEmail
            });
            if (!res.success) throw new Error(res.error);
            referenceId = res.referenceId!;
            instructions = res.instructions;
        } else if (method === "MERCADOPAGO") {
            // Note: In reality, MP Subscriptions are pre-approvals, not simple payments,
            // but if we are moving to a manual/yearly invoice model we might just create a preference.
            // For now, we will track it in SubscriptionPayment when the user is redirected.
            throw new Error("El flujo de MercadoPago directo será refactorizado pronto");
        }

        // Record the payment intent
        const payment = await prisma.subscriptionPayment.create({
            data: {
                clubId,
                planId,
                amount,
                method,
                status: method === "TRANSFER" ? "PENDING_VALIDATION" : "PENDING_PAYMENT",
                reference: referenceId,
                billingCycle
            }
        });

        // Update the club's status to reflect pending validation
        if (method === "TRANSFER") {
            await prisma.club.update({
                where: { id: clubId },
                data: {
                    subscriptionStatus: "PENDING_VALIDATION",
                    subscriptionMethod: "TRANSFER"
                }
            });
        }

        return {
            paymentId: payment.id,
            referenceId,
            instructions,
            checkoutUrl
        };
    }

    static async validateTransferPayment(paymentId: string, adminId: string) {
        const payment = await prisma.subscriptionPayment.findUnique({
            where: { id: paymentId },
            include: { club: true }
        });

        if (!payment || payment.method !== "TRANSFER") {
            throw new Error("Pago inválido");
        }

        if (payment.status === "APPROVED") {
            throw new Error("Este pago ya fue aprobado");
        }

        // Mark as approved
        await prisma.subscriptionPayment.update({
            where: { id: paymentId },
            data: {
                status: "APPROVED",
                validatedAt: new Date(),
                validatedBy: adminId
            }
        });

        // Update club subscription dates
        const now = new Date();
        const endDate = new Date();
        if (payment.billingCycle === "monthly") {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        await prisma.club.update({
            where: { id: payment.clubId },
            data: {
                subscriptionStatus: "ACTIVE",
                subscriptionMethod: payment.method,
                subscriptionStart: now,
                subscriptionEnd: endDate,
                platformPlanId: payment.planId
            }
        });

        return { success: true };
    }

    static async rejectTransferPayment(paymentId: string, adminId: string, notes: string) {
        const payment = await prisma.subscriptionPayment.findUnique({
            where: { id: paymentId },
            include: { club: true }
        });

        if (!payment) throw new Error("Pago no encontrado");

        // Mark as rejected
        await prisma.subscriptionPayment.update({
            where: { id: paymentId },
            data: {
                status: "REJECTED",
                validatedAt: new Date(),
                validatedBy: adminId,
                notes
            }
        });

        // If the club's subscription was active, we don't necessarily suspend it yet,
        // but if it was pending validation, we revert or mark as cancelled.
        if (payment.club.subscriptionStatus === "PENDING_VALIDATION") {
            await prisma.club.update({
                where: { id: payment.clubId },
                data: {
                    subscriptionStatus: "PENDING_PAYMENT"
                }
            });
        }

        return { success: true };
    }
}
