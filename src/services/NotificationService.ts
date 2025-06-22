import { logger } from '../helpers/logger';

export class NotificationService {
    sendBookingConfirmation(bookingId: string): void {
        logger.info(`Booking confirmation for booking ${bookingId} sent is sent`);
    }

    sendCancellationNotice(bookingId: string): void {
        logger.info(`Booking cancellation notice for booking ${bookingId} is sent `);
    }

    sendCheckInReminder(bookingId: string): void {
        logger.info(`Check-in reminder for booking ${bookingId} is sent`);
    }

    sendReceiptEmail(amount: number): void {
        logger.info(`Receipt for $${amount} is sent`);
    }
}
