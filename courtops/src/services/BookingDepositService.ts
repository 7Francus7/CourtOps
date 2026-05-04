import prisma from "@/lib/db";

export class BookingDepositService {

    /**
     * Calculates the required deposit amount based on club settings
     */
    static async calculateDeposit(clubId: string, totalPrice: number): Promise<{ amount: number, required: boolean }> {
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            select: { depositType: true, bookingDeposit: true }
        });

        if (!club || !club.bookingDeposit || club.bookingDeposit <= 0) {
            return { amount: 0, required: false };
        }

        let amount = 0;
        if (club.depositType === "PERCENTAGE") {
            amount = (totalPrice * club.bookingDeposit) / 100;
        } else {
            amount = club.bookingDeposit;
        }

        // Ensure deposit is not higher than total price
        amount = Math.min(amount, totalPrice);

        return { amount, required: amount > 0 };
    }

    /**
     * Mark a booking deposit as paid via Transfer (pending validation)
     */
    static async submitTransferReceipt(bookingId: number, receiptUrl: string, reference: string) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new Error("Turno no encontrado");

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "PENDING_VALIDATION",
                paymentMethod: "TRANSFER",
                paymentReference: reference,
                receiptUrl
            }
        });

        return { success: true };
    }

    /**
     * Admin approves the transfer receipt for a booking
     */
    static async validateDeposit(bookingId: number, adminId: string) {
        const booking = await prisma.booking.findUnique({ 
            where: { id: bookingId },
            include: { items: true, transactions: true }
        });
        if (!booking) throw new Error("Turno no encontrado");
        if (booking.status === "CANCELED") throw new Error("El turno ya está cancelado");

        // Calculate total including items
        const itemsTotal = booking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const totalAmount = booking.price + itemsTotal;
        const alreadyPaid = booking.transactions.reduce((sum, t) => sum + t.amount, 0);

        // We assume the amount to be marked as paid is the required deposit
        const { amount: depositAmount } = await this.calculateDeposit(booking.clubId, booking.price);
        
        const newTotalPaid = alreadyPaid + depositAmount;
        const finalPaymentStatus = newTotalPaid >= totalAmount ? "PAID" : "PARTIAL";

        // Find open cash register
        const cashRegister = await prisma.cashRegister.findFirst({
            where: { clubId: booking.clubId, status: "OPEN" },
            orderBy: { date: 'desc' }
        });

        await prisma.$transaction(async (tx) => {
            // Update booking status
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
                    paymentStatus: finalPaymentStatus
                }
            });

            // Create transaction record
            if (cashRegister && depositAmount > 0) {
                await tx.transaction.create({
                    data: {
                        cashRegisterId: cashRegister.id,
                        clubId: booking.clubId,
                        bookingId: booking.id,
                        type: "INCOME",
                        category: "BOOKING_DEPOSIT",
                        amount: depositAmount,
                        method: booking.paymentMethod || "TRANSFER",
                        description: `Seña validada manualmente: ${booking.paymentReference || 'Sin ref'}`
                    }
                });
            }
        });

        return { success: true };
    }

    /**
     * Admin rejects the transfer receipt
     */
    static async rejectDeposit(bookingId: number, reason: string) {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new Error("Turno no encontrado");

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "UNPAID",
                paymentReference: null,
                receiptUrl: null,
                notes: (booking.notes || "") + `\n[Rechazo de transferencia]: ${reason}`
            }
        });

        return { success: true };
    }
}
