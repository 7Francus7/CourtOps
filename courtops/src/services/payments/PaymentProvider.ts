export interface PaymentProvider {
    /**
     * Initializes a payment for a subscription (e.g. creating a MP preference or returning transfer instructions)
     */
    createSubscriptionPayment(params: SubscriptionPaymentParams): Promise<PaymentResponse>;

    /**
     * Validates a payment status (e.g. checking MP status or admin manual approval for transfers)
     */
    validatePayment(paymentReference: string): Promise<PaymentValidationResult>;
}

export interface SubscriptionPaymentParams {
    clubId: string;
    planId: string;
    amount: number;
    billingCycle: "monthly" | "yearly";
    customerEmail?: string;
    customerName?: string;
}

export interface PaymentResponse {
    success: boolean;
    checkoutUrl?: string; // MP checkout URL
    referenceId?: string; // Internal reference or MP preference ID
    instructions?: {
        bankAlias?: string;
        bankCvu?: string;
        bankAccountName?: string;
    }; // For transfers
    error?: string;
}

export interface PaymentValidationResult {
    isValid: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    amountPaid?: number;
    paymentDate?: Date;
    error?: string;
}
