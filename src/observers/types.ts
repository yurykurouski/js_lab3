import { BookingStatus, BookingDetails } from '@/types';


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

export interface BookingEvent {
    type: BookingEventType;
    timestamp: Date;
    bookingId: string;
    roomId?: string;
}

export interface BookingStateChangeEvent extends BookingEvent {
    type: BookingEventType.BOOKING_CREATED | BookingEventType.BOOKING_CONFIRMED |
    BookingEventType.BOOKING_CANCELLED | BookingEventType.GUEST_CHECKED_IN |
    BookingEventType.GUEST_CHECKED_OUT;
    previousStatus?: BookingStatus;
    newStatus: BookingStatus;
    bookingDetails: BookingDetails;
}

export interface PaymentEvent extends BookingEvent {
    type: BookingEventType.PAYMENT_PROCESSED;
    amount: number;
    paymentMethod: string;
}

export interface RoomEvent extends BookingEvent {
    type: BookingEventType.ROOM_RESERVED | BookingEventType.ROOM_RELEASED;
    roomId: string;
    roomType: string;
}

export type BookingSystemEvent = BookingStateChangeEvent | PaymentEvent | RoomEvent;
