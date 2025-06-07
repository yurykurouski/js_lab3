import { BookingStatus, BookingDetails } from '@/types';

/**
 * Booking event types for the Observer pattern
 */
export enum BookingEventType {
    BOOKING_CREATED = 'BOOKING_CREATED',
    BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    GUEST_CHECKED_IN = 'GUEST_CHECKED_IN',
    GUEST_CHECKED_OUT = 'GUEST_CHECKED_OUT',
    PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
    ROOM_RESERVED = 'ROOM_RESERVED',
    ROOM_RELEASED = 'ROOM_RELEASED',
}

/**
 * Base event interface for booking system events
 */
export interface BookingEvent {
    type: BookingEventType;
    timestamp: Date;
    bookingId: string;
    guestId?: string;
    roomId?: string;
}

/**
 * Event for booking state changes
 */
export interface BookingStateChangeEvent extends BookingEvent {
    type: BookingEventType.BOOKING_CREATED | BookingEventType.BOOKING_CONFIRMED |
    BookingEventType.BOOKING_CANCELLED | BookingEventType.GUEST_CHECKED_IN |
    BookingEventType.GUEST_CHECKED_OUT;
    previousStatus?: BookingStatus;
    newStatus: BookingStatus;
    bookingDetails: BookingDetails;
}

/**
 * Event for payment processing
 */
export interface PaymentEvent extends BookingEvent {
    type: BookingEventType.PAYMENT_PROCESSED;
    amount: number;
    paymentMethod: string;
}

/**
 * Event for room operations
 */
export interface RoomEvent extends BookingEvent {
    type: BookingEventType.ROOM_RESERVED | BookingEventType.ROOM_RELEASED;
    roomId: string;
    roomType: string;
}

/**
 * Union type for all booking events
 */
export type BookingSystemEvent = BookingStateChangeEvent | PaymentEvent | RoomEvent;
