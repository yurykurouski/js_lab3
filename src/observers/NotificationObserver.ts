import { NotificationService } from '@/services';
import { Observer } from './Observer';
import { BookingSystemEvent, BookingEventType, BookingStateChangeEvent } from './types';
import { logger } from '@/helpers/logger';


export class NotificationObserver implements Observer<BookingSystemEvent> {
    private id: string;
    private notificationService: NotificationService;

    constructor(notificationService: NotificationService, id = 'notification-observer') {
        this.id = id;
        this.notificationService = notificationService;
    }

    getId(): string {
        return this.id;
    }

    update(event: BookingSystemEvent): void {
        logger.info(`NotificationObserver handling event: ${event.type} for booking ${event.bookingId}`);

        switch (event.type) {
            case BookingEventType.BOOKING_CREATED:
                this.handleBookingCreated(event);
                break;
            case BookingEventType.BOOKING_CONFIRMED:
                this.handleBookingConfirmed(event);
                break;
            case BookingEventType.BOOKING_CANCELLED:
                this.handleBookingCancelled(event);
                break;
            case BookingEventType.GUEST_CHECKED_IN:
                this.handleGuestCheckedIn(event);
                break;
            case BookingEventType.GUEST_CHECKED_OUT:
                this.handleGuestCheckedOut(event);
                break;
            default:
                logger.info(`No notification handler for event type: ${event.type}`);
        }
    }

    private handleBookingCreated(event: BookingStateChangeEvent): void {
        logger.info(`New booking created: ${event.bookingId}`);
    }

    private handleBookingConfirmed(event: BookingStateChangeEvent): void {
        logger.info(`Booking confirmed: ${event.bookingId}`);
    }

    private handleBookingCancelled(event: BookingStateChangeEvent): void {
        this.notificationService.sendCancellationNotice(event.bookingId);
    }

    private handleGuestCheckedIn(event: BookingStateChangeEvent): void {
        logger.info(`Guest checked in notification sent for booking ${event.bookingId}`);
    }

    private handleGuestCheckedOut(event: BookingStateChangeEvent): void {
        logger.info(`Guest checked out notification sent for booking ${event.bookingId}`);
    }
}
