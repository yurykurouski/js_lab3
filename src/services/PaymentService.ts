
import { BookingEventManager } from '@/observers';
import { PaymentProviderType } from '../types';
import { PaymentAdapterFactory } from '@/factories';

export class PaymentService {
    private eventManager: BookingEventManager;
    private paymentAdapterFactory: PaymentAdapterFactory;
    private useAdapterPattern: boolean;

    constructor(useAdapterPattern: boolean = false) {
        this.eventManager = BookingEventManager.getInstance();
        this.useAdapterPattern = useAdapterPattern;
        this.paymentAdapterFactory = new PaymentAdapterFactory();
    }

    processPayment(
        amount: number,
        cardNumber: string,
        bookingId?: string,
        guestId?: string,
    ): boolean {
        console.log(`Processing payment of $${amount} with card ending in ${cardNumber.slice(-4)}`);

        if (cardNumber.length !== 16) {
            console.log('Payment failed: Invalid card number');
            return false;
        }

        console.log('Payment processed successfully');

        // Publish payment processed event if booking info is available
        if (bookingId && guestId) {
            this.eventManager.publishPaymentProcessed(
                bookingId,
                guestId,
                amount,
                'credit_card',
            );
        }

        return true;
    }

    async processPaymentWithAdapter(
        amount: number,
        cardNumber: string,
        bookingId: string,
        guestId?: string,
    ): Promise<{ success: boolean; transactionId?: string; message?: string }> {
        console.log(`Processing payment of $${amount} with card ending in ${cardNumber.slice(-4)}`);

        if (cardNumber.length !== 16) {
            console.log('Payment failed: Invalid card number');
            return { success: false, message: 'Invalid card number' };
        }

        try {
            // Use adapter pattern for external payment processing
            const fallbackResult = await this.paymentAdapterFactory.processPaymentWithFallback(
                amount,
                cardNumber,
                bookingId,
            );

            const { result, providerUsed } = fallbackResult;

            if (result.success) {
                console.log(`Payment processed successfully via ${providerUsed}`);
                console.log(`Transaction ID: ${result.transactionId}`);

                // Publish payment processed event if booking info is available
                if (guestId) {
                    this.eventManager.publishPaymentProcessed(
                        bookingId,
                        guestId,
                        amount,
                        'credit_card',
                    );
                }

                return {
                    success: true,
                    transactionId: result.transactionId,
                    message: result.message,
                };
            } else {
                console.log(`Payment failed: ${result.message || 'Unknown error'}`);
                return {
                    success: false,
                    message: result.message || 'Payment processing failed',
                };
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Payment failed with all providers';
            console.log(`Payment failed with all providers: ${errorMessage}`);
            return { success: false, message: errorMessage };
        }
    }

    refundPayment(amount: number, bookingId: string): boolean {
        console.log(`Processing refund of $${amount} for booking ${bookingId}`);
        console.log('Refund processed successfully');
        return true;
    }

    async refundPaymentWithAdapter(
        amount: number,
        bookingId: string,
        transactionId: string,
    ): Promise<{ success: boolean; refundId?: string; message?: string }> {
        console.log(`Processing refund of $${amount} for booking ${bookingId}`);

        try {
            // Use adapter pattern for external refund processing
            const processor = this.paymentAdapterFactory.getPrimaryProcessor();
            const result = await processor.refundPayment(transactionId, amount);

            if (result.success) {
                console.log('Refund processed successfully');
                console.log(`Refund ID: ${result.refundId}`);
                return {
                    success: true,
                    refundId: result.refundId,
                    message: result.message,
                };
            } else {
                console.log(`Refund failed: ${result.message || 'Unknown error'}`);
                return {
                    success: false,
                    message: result.message || 'Refund processing failed',
                };
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Refund processing failed';
            console.log(`Refund failed: ${errorMessage}`);
            return { success: false, message: errorMessage };
        }
    }

    /**
     * Enable or disable adapter pattern usage
     */
    setAdapterPatternEnabled(enabled: boolean): void {
        this.useAdapterPattern = enabled;
        console.log(`🔧 PaymentService: Adapter pattern ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get payment adapter factory for configuration
     */
    getPaymentAdapterFactory(): PaymentAdapterFactory {
        return this.paymentAdapterFactory;
    }

    /**
     * Switch primary payment provider
     */
    switchPaymentProvider(provider: PaymentProviderType): void {
        this.paymentAdapterFactory.updateConfig({
            defaultProvider: provider,
        });
        console.log(`💳 PaymentService: Switched to ${provider} as primary payment provider`);
    }
}
