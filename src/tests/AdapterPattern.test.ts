/**
 * Adapter Pattern Tests
 *
 * Tests for the Payment Adapter pattern implementation including:
 * - Individual payment provider adapters
 * - Payment adapter factory
 * - Fallback mechanisms
 * - Integration with PaymentService
 */

import {
    PaymentResult,
    RefundResult,
    StripePaymentAdapter,
    PayPalPaymentAdapter,
    SquarePaymentAdapter,
    StripePaymentProvider,
    PayPalPaymentProvider,
    SquarePaymentProvider,
} from '../patterns/adapter/PaymentAdapter';

import {
    PaymentAdapterFactory,
    PaymentAdapterConfig,
} from '../patterns/adapter/PaymentAdapterFactory';
import { PaymentProviderType } from '../types';

import { PaymentService } from '../services/PaymentService';

describe('Adapter Pattern', () => {
    describe('Payment Adapters', () => {
        let stripeAdapter: StripePaymentAdapter;
        let paypalAdapter: PayPalPaymentAdapter;
        let squareAdapter: SquarePaymentAdapter;

        beforeEach(() => {
            stripeAdapter = new StripePaymentAdapter(new StripePaymentProvider());
            paypalAdapter = new PayPalPaymentAdapter(new PayPalPaymentProvider());
            squareAdapter = new SquarePaymentAdapter(new SquarePaymentProvider());
        });

        it('should implement PaymentProcessor interface', () => {
            expect(stripeAdapter).toHaveProperty('processPayment');
            expect(stripeAdapter).toHaveProperty('refundPayment');
            expect(paypalAdapter).toHaveProperty('processPayment');
            expect(paypalAdapter).toHaveProperty('refundPayment');
            expect(squareAdapter).toHaveProperty('processPayment');
            expect(squareAdapter).toHaveProperty('refundPayment');
        });

        it('should process Stripe payments successfully', async () => {
            const result: PaymentResult = await stripeAdapter.processPayment(
                100.00,
                '1234567890123456',
                'BK001',
            );

            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('transactionId');
            expect(result).toHaveProperty('timestamp');
            expect(result.timestamp).toBeInstanceOf(Date);

            if (result.success) {
                expect(result.transactionId).toMatch(/^ch_/);
                expect(result.message).toContain('Stripe payment processed successfully');
            }
        });

        it('should process PayPal payments successfully', async () => {
            const result: PaymentResult = await paypalAdapter.processPayment(
                200.50,
                '1234567890123456',
                'BK002',
            );

            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('transactionId');
            expect(result).toHaveProperty('timestamp');
            expect(result.timestamp).toBeInstanceOf(Date);

            if (result.success) {
                expect(result.transactionId).toMatch(/[A-Z0-9]+/);
                expect(result.message).toContain('PayPal payment processed successfully');
            }
        });

        it('should process Square payments successfully', async () => {
            const result: PaymentResult = await squareAdapter.processPayment(
                300.75,
                '1234567890123456',
                'BK003',
            );

            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('transactionId');
            expect(result).toHaveProperty('timestamp');
            expect(result.timestamp).toBeInstanceOf(Date);

            if (result.success) {
                expect(result.transactionId).toMatch(/[a-z0-9]+/);
                expect(result.message).toContain('Square payment processed successfully');
            }
        });

        it('should handle payment failures gracefully', async () => {
            // Test multiple times to potentially hit the failure case (10% failure rate)
            const results = await Promise.all([
                stripeAdapter.processPayment(1, '1234567890123456', 'BK001'),
                stripeAdapter.processPayment(1, '1234567890123456', 'BK001'),
                stripeAdapter.processPayment(1, '1234567890123456', 'BK001'),
                stripeAdapter.processPayment(1, '1234567890123456', 'BK001'),
                stripeAdapter.processPayment(1, '1234567890123456', 'BK001'),
            ]);

            // At least one should succeed
            const successfulResults = results.filter((r: PaymentResult) => r.success);
            expect(successfulResults.length).toBeGreaterThan(0);

            // Check that failed results have proper structure
            const failedResults = results.filter((r: PaymentResult) => !r.success);
            failedResults.forEach((result: PaymentResult) => {
                expect(result.success).toBe(false);
                expect(result.transactionId).toBe('');
                expect(result.message).toContain('failed');
                expect(result.timestamp).toBeInstanceOf(Date);
            });
        });

        it('should process refunds successfully', async () => {
            // First process a payment to get a transaction ID
            const paymentResult = await stripeAdapter.processPayment(100, '1234567890123456', 'BK001');

            if (paymentResult.success) {
                const refundResult: RefundResult = await stripeAdapter.refundPayment(
                    paymentResult.transactionId,
                    50.00,
                );

                expect(refundResult).toHaveProperty('success');
                expect(refundResult).toHaveProperty('refundId');
                expect(refundResult).toHaveProperty('timestamp');
                expect(refundResult.timestamp).toBeInstanceOf(Date);

                if (refundResult.success) {
                    expect(refundResult.refundId).toMatch(/^re_/);
                    expect(refundResult.message).toContain('Stripe refund processed successfully');
                }
            }
        });
    });

    describe('PaymentAdapterFactory', () => {
        let factory: PaymentAdapterFactory;

        beforeEach(() => {
            factory = new PaymentAdapterFactory();
        });

        it('should initialize with default configuration', () => {
            const config = factory.getConfig();
            expect(config.defaultProvider).toBe('stripe');
            expect(config.fallbackProviders).toEqual(['paypal', 'square']);
            expect(config.enableFallback).toBe(true);
        });

        it('should initialize with custom configuration', () => {
            const customConfig: PaymentAdapterConfig = {
                defaultProvider: 'paypal',
                fallbackProviders: ['stripe'],
                enableFallback: false,
            };

            const customFactory = new PaymentAdapterFactory(customConfig);
            const config = customFactory.getConfig();

            expect(config.defaultProvider).toBe('paypal');
            expect(config.fallbackProviders).toEqual(['stripe']);
            expect(config.enableFallback).toBe(false);
        });

        it('should get primary processor', () => {
            const processor = factory.getPrimaryProcessor();
            expect(processor).toBeDefined();
            expect(processor).toHaveProperty('processPayment');
            expect(processor).toHaveProperty('refundPayment');
        });

        it('should get specific processors by type', () => {
            const stripeProcessor = factory.getProcessor('stripe');
            const paypalProcessor = factory.getProcessor('paypal');
            const squareProcessor = factory.getProcessor('square');

            expect(stripeProcessor).toBeDefined();
            expect(paypalProcessor).toBeDefined();
            expect(squareProcessor).toBeDefined();
        });

        it('should throw error for unknown provider', () => {
            expect(() => {
                factory.getProcessor('unknown' as PaymentProviderType);
            }).toThrow('Payment provider \'unknown\' not found');
        });

        it('should get available providers', () => {
            const providers = factory.getAvailableProviders();
            expect(providers).toContain('stripe');
            expect(providers).toContain('paypal');
            expect(providers).toContain('square');
            expect(providers).toHaveLength(3);
        });

        it('should update configuration', () => {
            factory.updateConfig({ defaultProvider: 'square' });
            const config = factory.getConfig();
            expect(config.defaultProvider).toBe('square');
        });

        it('should process payment with fallback support', async () => {
            const result = await factory.processPaymentWithFallback(
                150.00,
                '1234567890123456',
                'BK001',
            );

            expect(result).toHaveProperty('result');
            expect(result).toHaveProperty('providerUsed');
            expect(result).toHaveProperty('attemptedProviders');

            expect(result.result).toHaveProperty('success');
            expect(result.result).toHaveProperty('transactionId');
            expect(result.result).toHaveProperty('timestamp');

            expect(['stripe', 'paypal', 'square']).toContain(result.providerUsed);
            expect(result.attemptedProviders).toContain(result.providerUsed);
        });

        it('should use only primary provider when fallback is disabled', async () => {
            factory.updateConfig({ enableFallback: false });

            const result = await factory.processPaymentWithFallback(
                100.00,
                '1234567890123456',
                'BK001',
            );

            expect(result.providerUsed).toBe('stripe'); // default provider
            expect(result.attemptedProviders).toEqual(['stripe']);
        });

        it('should try fallback providers on primary failure', async () => {
            const result = await factory.processPaymentWithFallback(
                100.00,
                '1234567890123456',
                'BK001',
            );

            expect(result.attemptedProviders).toContain('stripe'); // Primary always attempted
            expect(['stripe', 'paypal', 'square']).toContain(result.providerUsed);

            if (result.result.success) {
                expect(result.result.transactionId).toBeTruthy();
            }
        });
    });

    describe('PaymentService Integration', () => {
        let paymentService: PaymentService;

        beforeEach(() => {
            paymentService = new PaymentService();
        });

        it('should maintain backward compatibility with legacy payment processing', () => {
            const result = paymentService.processPayment(100, '1234567890123456');
            expect(result).toBe(true);
        });

        it('should process payment with adapter pattern', async () => {
            const result = await paymentService.processPaymentWithAdapter(
                100.00,
                '1234567890123456',
                'BK001',
                'guest001',
            );

            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('transactionId');
            expect(result).toHaveProperty('message');

            if (result.success) {
                expect(result.transactionId).toBeTruthy();
                expect(result.message).toBeTruthy();
            }
        });

        it('should handle invalid card numbers in adapter mode', async () => {
            const result = await paymentService.processPaymentWithAdapter(
                100.00,
                '123456789012345', // 15 digits
                'BK001',
                'guest001',
            );

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid card number');
            expect(result.transactionId).toBeUndefined();
        });

        it('should process refund with adapter pattern', async () => {
            // First process a payment
            const paymentResult = await paymentService.processPaymentWithAdapter(
                200.00,
                '1234567890123456',
                'BK001',
                'guest001',
            );

            if (paymentResult.success && paymentResult.transactionId) {
                const refundResult = await paymentService.refundPaymentWithAdapter(
                    100.00,
                    'BK001',
                    paymentResult.transactionId,
                );

                expect(refundResult).toHaveProperty('success');
                expect(refundResult).toHaveProperty('refundId');
                expect(refundResult).toHaveProperty('message');

                if (refundResult.success) {
                    expect(refundResult.refundId).toBeTruthy();
                    expect(refundResult.message).toBeTruthy();
                }
            }
        });

        it('should allow switching payment providers', () => {
            paymentService.switchPaymentProvider('paypal');
            const factory = paymentService.getPaymentAdapterFactory();
            const config = factory.getConfig();
            expect(config.defaultProvider).toBe('paypal');
        });

        it('should enable/disable adapter pattern', () => {
            paymentService.setAdapterPatternEnabled(true);
            // We can't easily test the internal state, but method should not throw
            expect(() => paymentService.setAdapterPatternEnabled(false)).not.toThrow();
        });
    });

    describe('Adapter Pattern Benefits', () => {
        it('should demonstrate adapter pattern flexibility', async () => {
            const factory = new PaymentAdapterFactory();

            // Test switching between providers
            const providers: PaymentProviderType[] = ['stripe', 'paypal', 'square'];

            for (const provider of providers) {
                factory.updateConfig({ defaultProvider: provider });
                const processor = factory.getPrimaryProcessor();

                const result = await processor.processPayment(
                    100.00,
                    '1234567890123456',
                    `BK_${provider}`,
                );

                expect(result).toHaveProperty('success');
                expect(result).toHaveProperty('transactionId');
                expect(result).toHaveProperty('timestamp');

                // Each provider should have different transaction ID format
                if (result.success) {
                    switch (provider) {
                        case 'stripe':
                            expect(result.transactionId).toMatch(/^ch_/);
                            break;
                        case 'paypal':
                            expect(result.transactionId).toMatch(/[A-Z0-9]+/);
                            break;
                        case 'square':
                            expect(result.transactionId).toMatch(/[a-z0-9]+/);
                            break;
                    }
                }
            }
        });

        it('should demonstrate unified interface with different implementations', async () => {
            const providers = [
                new StripePaymentAdapter(new StripePaymentProvider()),
                new PayPalPaymentAdapter(new PayPalPaymentProvider()),
                new SquarePaymentAdapter(new SquarePaymentProvider()),
            ];

            // All adapters should work with the same interface
            for (const provider of providers) {
                const result = await provider.processPayment(50.00, '1234567890123456', 'BK001');

                expect(result).toHaveProperty('success');
                expect(result).toHaveProperty('transactionId');
                expect(result).toHaveProperty('message');
                expect(result).toHaveProperty('timestamp');
                expect(result.timestamp).toBeInstanceOf(Date);
            }
        });
    });
});
