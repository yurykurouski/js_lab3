import { PaymentService } from '../services';

describe('PaymentService', () => {
    let paymentService: PaymentService;

    beforeEach(() => {
        paymentService = new PaymentService();
    });

    describe('processPayment', () => {
        it('should process payment successfully with valid card', () => {
            const success = paymentService.processPayment(100, '1234567890123456');
            expect(success).toBe(true);
        });

        it('should process payment successfully with different amounts', () => {
            expect(paymentService.processPayment(50, '1234567890123456')).toBe(true);
            expect(paymentService.processPayment(200, '1234567890123456')).toBe(true);
            expect(paymentService.processPayment(999.99, '1234567890123456')).toBe(true);
        });

        it('should fail payment with invalid card number (too short)', () => {
            const success = paymentService.processPayment(100, '123456789012345');
            expect(success).toBe(false);
        });

        it('should fail payment with invalid card number (too long)', () => {
            const success = paymentService.processPayment(100, '12345678901234567');
            expect(success).toBe(false);
        });

        it('should fail payment with empty card number', () => {
            const success = paymentService.processPayment(100, '');
            expect(success).toBe(false);
        });

        it('should handle zero amount', () => {
            const success = paymentService.processPayment(0, '1234567890123456');
            expect(success).toBe(true);
        });

        it('should handle negative amount', () => {
            const success = paymentService.processPayment(-100, '1234567890123456');
            expect(success).toBe(true);
        });

        it('should validate card number length exactly', () => {
            // Test boundary conditions
            expect(paymentService.processPayment(100, '123456789012345')).toBe(false); // 15 digits
            expect(paymentService.processPayment(100, '1234567890123456')).toBe(true);  // 16 digits
            expect(paymentService.processPayment(100, '12345678901234567')).toBe(false); // 17 digits
        });
    });

    describe('refundPayment', () => {
        it('should process refund successfully', () => {
            const success = paymentService.refundPayment(100, 'BK001');
            expect(success).toBe(true);
        });

        it('should process refund with different amounts', () => {
            expect(paymentService.refundPayment(50, 'BK001')).toBe(true);
            expect(paymentService.refundPayment(200, 'BK002')).toBe(true);
            expect(paymentService.refundPayment(999.99, 'BK003')).toBe(true);
        });

        it('should process refund with different booking IDs', () => {
            expect(paymentService.refundPayment(100, 'BK001')).toBe(true);
            expect(paymentService.refundPayment(100, 'BK999')).toBe(true);
            expect(paymentService.refundPayment(100, 'CUSTOM_ID')).toBe(true);
        });

        it('should handle zero refund amount', () => {
            const success = paymentService.refundPayment(0, 'BK001');
            expect(success).toBe(true);
        });

        it('should handle negative refund amount', () => {
            const success = paymentService.refundPayment(-100, 'BK001');
            expect(success).toBe(true);
        });

        it('should handle empty booking ID', () => {
            const success = paymentService.refundPayment(100, '');
            expect(success).toBe(true);
        });
    });

    describe('payment and refund workflow', () => {
        it('should handle payment followed by refund', () => {
            const paymentSuccess = paymentService.processPayment(100, '1234567890123456');
            expect(paymentSuccess).toBe(true);

            const refundSuccess = paymentService.refundPayment(100, 'BK001');
            expect(refundSuccess).toBe(true);
        });

        it('should handle multiple payments and refunds', () => {
            // Process multiple payments
            expect(paymentService.processPayment(100, '1234567890123456')).toBe(true);
            expect(paymentService.processPayment(200, '1234567890123456')).toBe(true);
            expect(paymentService.processPayment(300, '1234567890123456')).toBe(true);

            // Process multiple refunds
            expect(paymentService.refundPayment(100, 'BK001')).toBe(true);
            expect(paymentService.refundPayment(200, 'BK002')).toBe(true);
            expect(paymentService.refundPayment(300, 'BK003')).toBe(true);
        });
    });
});
