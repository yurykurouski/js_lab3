import { BookingDetails, BookingStatus } from '@/types';
import { BaseSubject } from './Observer';
import { BookingSystemEvent, BookingEventType, BookingStateChangeEvent, RoomEvent } from './types';
import { logger } from '@/helpers/logger';


export class BookingEventManager extends BaseSubject<BookingSystemEvent> {
    private static instance: BookingEventManager | undefined;

    private constructor() {
        super();
    }

    public static getInstance(): BookingEventManager {
        if (!BookingEventManager.instance) {
            BookingEventManager.instance = new BookingEventManager();
        }
        return BookingEventManager.instance;
    }

    publishBookingStateChange(
        bookingId: string,
        eventType: BookingEventType.BOOKING_CREATED | BookingEventType.BOOKING_CONFIRMED |
            BookingEventType.BOOKING_CANCELLED | BookingEventType.GUEST_CHECKED_IN |
            BookingEventType.GUEST_CHECKED_OUT,
        bookingDetails: BookingDetails,
        newStatus: BookingStatus,
        previousStatus?: BookingStatus,
    ): void {
        const event: BookingStateChangeEvent = {
            type: eventType,
            timestamp: new Date(),
            bookingId,
            roomId: bookingDetails.roomId,
            previousStatus,
            newStatus,
            bookingDetails,
        };

        logger.info(`Publishing booking state change: ${eventType} for booking ${bookingId}`);
        this.notify(event);
    }


    publishRoomOperation(
        bookingId: string,
        roomId: string,
        roomType: string,
        eventType: BookingEventType.ROOM_RESERVED | BookingEventType.ROOM_RELEASED,
    ): void {
        const event: RoomEvent = {
            type: eventType,
            timestamp: new Date(),
            bookingId,
            roomId,
            roomType,
        };

        logger.info(`Publishing room operation: ${eventType} for room ${roomId}`);
        this.notify(event);
    }

    public static reset(): void {
        BookingEventManager.instance = undefined;
    }
}
