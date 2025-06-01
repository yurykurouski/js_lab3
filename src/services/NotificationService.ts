import { logger } from "../helpers/logger";

export class NotificationService {
    sendBookingConfirmation(email: string, bookingId: string): void {
        logger.info(`Booking confirmation sent to ${email} for booking ${bookingId}`);
    }

    sendCancellationNotice(email: string, bookingId: string): void {
        logger.info(`Booking cancellation notice sent to ${email} for booking ${bookingId}`);
    }

    sendCheckInReminder(email: string, bookingId: string): void {
        logger.info(`Check-in reminder sent to ${email} for booking ${bookingId}`);
    }

    sendReceiptEmail(email: string, amount: number): void {
        logger.info(`Receipt for $${amount} sent to ${email}`);
    }
}
