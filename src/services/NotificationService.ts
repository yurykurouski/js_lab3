export class NotificationService {
    sendBookingConfirmation(email: string, bookingId: string): void {
        console.log(`Booking confirmation sent to ${email} for booking ${bookingId}`);
    }

    sendCancellationNotice(email: string, bookingId: string): void {
        console.log(`Booking cancellation notice sent to ${email} for booking ${bookingId}`);
    }

    sendCheckInReminder(email: string, bookingId: string): void {
        console.log(`Check-in reminder sent to ${email} for booking ${bookingId}`);
    }

    sendReceiptEmail(email: string, amount: number): void {
        console.log(`Receipt for $${amount} sent to ${email}`);
    }
}
