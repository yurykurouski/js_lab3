import { NotificationService } from '../services';

describe('NotificationService', () => {
    let notificationService: NotificationService;

    beforeEach(() => {
        notificationService = new NotificationService();
    });

    describe('sendBookingConfirmation', () => {
        it('should send booking confirmation without throwing error', () => {
            expect(() => {
                notificationService.sendBookingConfirmation('test@example.com', 'BK001');
            }).not.toThrow();
        });

        it('should handle different email addresses', () => {
            expect(() => {
                notificationService.sendBookingConfirmation('user@domain.com', 'BK001');
                notificationService.sendBookingConfirmation('another.user@example.org', 'BK002');
                notificationService.sendBookingConfirmation('test+tag@gmail.com', 'BK003');
            }).not.toThrow();
        });

        it('should handle different booking IDs', () => {
            expect(() => {
                notificationService.sendBookingConfirmation('test@example.com', 'BK001');
                notificationService.sendBookingConfirmation('test@example.com', 'BK999');
                notificationService.sendBookingConfirmation('test@example.com', 'CUSTOM_ID');
            }).not.toThrow();
        });

        it('should handle empty parameters gracefully', () => {
            expect(() => {
                notificationService.sendBookingConfirmation('', '');
                notificationService.sendBookingConfirmation('test@example.com', '');
                notificationService.sendBookingConfirmation('', 'BK001');
            }).not.toThrow();
        });
    });

    describe('sendCancellationNotice', () => {
        it('should send cancellation notice without throwing error', () => {
            expect(() => {
                notificationService.sendCancellationNotice('test@example.com', 'BK001');
            }).not.toThrow();
        });

        it('should handle different email addresses', () => {
            expect(() => {
                notificationService.sendCancellationNotice('user@domain.com', 'BK001');
                notificationService.sendCancellationNotice('another.user@example.org', 'BK002');
                notificationService.sendCancellationNotice('test+tag@gmail.com', 'BK003');
            }).not.toThrow();
        });

        it('should handle different booking IDs', () => {
            expect(() => {
                notificationService.sendCancellationNotice('test@example.com', 'BK001');
                notificationService.sendCancellationNotice('test@example.com', 'BK999');
                notificationService.sendCancellationNotice('test@example.com', 'CUSTOM_ID');
            }).not.toThrow();
        });

        it('should handle empty parameters gracefully', () => {
            expect(() => {
                notificationService.sendCancellationNotice('', '');
                notificationService.sendCancellationNotice('test@example.com', '');
                notificationService.sendCancellationNotice('', 'BK001');
            }).not.toThrow();
        });
    });

    describe('sendCheckInReminder', () => {
        it('should send check-in reminder without throwing error', () => {
            expect(() => {
                notificationService.sendCheckInReminder('test@example.com', 'BK001');
            }).not.toThrow();
        });

        it('should handle different email addresses', () => {
            expect(() => {
                notificationService.sendCheckInReminder('user@domain.com', 'BK001');
                notificationService.sendCheckInReminder('another.user@example.org', 'BK002');
                notificationService.sendCheckInReminder('test+tag@gmail.com', 'BK003');
            }).not.toThrow();
        });

        it('should handle different booking IDs', () => {
            expect(() => {
                notificationService.sendCheckInReminder('test@example.com', 'BK001');
                notificationService.sendCheckInReminder('test@example.com', 'BK999');
                notificationService.sendCheckInReminder('test@example.com', 'CUSTOM_ID');
            }).not.toThrow();
        });

        it('should handle empty parameters gracefully', () => {
            expect(() => {
                notificationService.sendCheckInReminder('', '');
                notificationService.sendCheckInReminder('test@example.com', '');
                notificationService.sendCheckInReminder('', 'BK001');
            }).not.toThrow();
        });
    });

    describe('sendReceiptEmail', () => {
        it('should send receipt email without throwing error', () => {
            expect(() => {
                notificationService.sendReceiptEmail('test@example.com', 100);
            }).not.toThrow();
        });

        it('should handle different email addresses', () => {
            expect(() => {
                notificationService.sendReceiptEmail('user@domain.com', 100);
                notificationService.sendReceiptEmail('another.user@example.org', 200);
                notificationService.sendReceiptEmail('test+tag@gmail.com', 300);
            }).not.toThrow();
        });

        it('should handle different amounts', () => {
            expect(() => {
                notificationService.sendReceiptEmail('test@example.com', 0);
                notificationService.sendReceiptEmail('test@example.com', 100);
                notificationService.sendReceiptEmail('test@example.com', 999.99);
                notificationService.sendReceiptEmail('test@example.com', -50);
            }).not.toThrow();
        });

        it('should handle edge case amounts', () => {
            expect(() => {
                notificationService.sendReceiptEmail('test@example.com', 0.01);
                notificationService.sendReceiptEmail('test@example.com', 99999.99);
                notificationService.sendReceiptEmail('test@example.com', Number.MAX_SAFE_INTEGER);
            }).not.toThrow();
        });

        it('should handle empty email gracefully', () => {
            expect(() => {
                notificationService.sendReceiptEmail('', 100);
            }).not.toThrow();
        });
    });

    describe('notification workflow', () => {
        it('should handle complete booking notification workflow', () => {
            const email = 'customer@example.com';
            const bookingId = 'BK001';
            const amount = 300;

            expect(() => {
                // Booking flow
                notificationService.sendBookingConfirmation(email, bookingId);
                notificationService.sendReceiptEmail(email, amount);
                notificationService.sendCheckInReminder(email, bookingId);
            }).not.toThrow();
        });

        it('should handle cancellation workflow', () => {
            const email = 'customer@example.com';
            const bookingId = 'BK001';

            expect(() => {
                // Initial booking
                notificationService.sendBookingConfirmation(email, bookingId);
                // Cancellation
                notificationService.sendCancellationNotice(email, bookingId);
            }).not.toThrow();
        });

        it('should handle multiple notifications for same booking', () => {
            const email = 'customer@example.com';
            const bookingId = 'BK001';

            expect(() => {
                notificationService.sendBookingConfirmation(email, bookingId);
                notificationService.sendCheckInReminder(email, bookingId);
                notificationService.sendCheckInReminder(email, bookingId); // Duplicate reminder
            }).not.toThrow();
        });

        it('should handle batch notifications', () => {
            expect(() => {
                for (let i = 1; i <= 10; i++) {
                    notificationService.sendBookingConfirmation(`guest${i}@example.com`, `BK${i.toString().padStart(3, '0')}`);
                    notificationService.sendReceiptEmail(`guest${i}@example.com`, i * 100);
                }
            }).not.toThrow();
        });
    });
});
