export class PaymentService {
    processPayment(amount: number, cardNumber: string): boolean {
        console.log(`Processing payment of $${amount} with card ending in ${cardNumber.slice(-4)}`);

        if (cardNumber.length !== 16) {
            console.log('Payment failed: Invalid card number');
            return false;
        }

        console.log('Payment processed successfully');
        return true;
    }

    refundPayment(amount: number, bookingId: string): boolean {
        console.log(`Processing refund of $${amount} for booking ${bookingId}`);
        console.log('Refund processed successfully');
        return true;
    }
}