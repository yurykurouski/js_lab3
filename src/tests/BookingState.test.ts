import { Booking } from '../state';
import { BookingDetails, BookingStatus } from '../types';

describe('State Pattern - Booking State Management', () => {
    let booking: Booking;
    let bookingDetails: BookingDetails;

    beforeEach(() => {
        bookingDetails = {
            id: 'TEST_001',
            guestId: 'guest_001',
            roomId: 'room_001',
            checkInDate: new Date('2025-06-15'),
            checkOutDate: new Date('2025-06-18'),
            totalPrice: 300,
            createdAt: new Date()
        };
        booking = new Booking(bookingDetails);
    });

    test('should start in NEW state', () => {
        expect(booking.getStatus()).toBe(BookingStatus.NEW);
        expect(booking.getAvailableActions()).toEqual(['confirm', 'cancel']);
    });

    test('should transition from NEW to CONFIRMED', () => {
        booking.confirm();
        expect(booking.getStatus()).toBe(BookingStatus.CONFIRMED);
        expect(booking.getAvailableActions()).toEqual(['checkIn', 'cancel']);
    });

    test('should transition from CONFIRMED to CHECKED_IN', () => {
        booking.confirm();
        booking.checkIn();
        expect(booking.getStatus()).toBe(BookingStatus.CHECKED_IN);
        expect(booking.getAvailableActions()).toEqual(['checkOut']);
    });

    test('should transition from CHECKED_IN to CHECKED_OUT', () => {
        booking.confirm();
        booking.checkIn();
        booking.checkOut();
        expect(booking.getStatus()).toBe(BookingStatus.CHECKED_OUT);
        expect(booking.getAvailableActions()).toEqual([]);
    });

    test('should transition to CANCELLED from NEW', () => {
        booking.cancel();
        expect(booking.getStatus()).toBe(BookingStatus.CANCELLED);
        expect(booking.getAvailableActions()).toEqual([]);
    });

    test('should transition to CANCELLED from CONFIRMED', () => {
        booking.confirm();
        booking.cancel();
        expect(booking.getStatus()).toBe(BookingStatus.CANCELLED);
        expect(booking.getAvailableActions()).toEqual([]);
    });

    test('should throw error for invalid state transitions', () => {
        expect(() => booking.checkIn()).toThrow('Cannot check in booking in new state');
        expect(() => booking.checkOut()).toThrow('Cannot check out booking in new state');

        booking.confirm();
        expect(() => booking.checkOut()).toThrow('Cannot check out booking in confirmed state');

        booking.checkIn();
        expect(() => booking.cancel()).toThrow('Cannot cancel booking in checked in state');

        booking.checkOut();
        expect(() => booking.confirm()).toThrow('Cannot confirm booking in checked out state');
        expect(() => booking.checkIn()).toThrow('Cannot check in booking in checked out state');
        expect(() => booking.cancel()).toThrow('Cannot cancel booking in checked out state');
    });

    test('should handle multiple confirm attempts gracefully', () => {
        booking.confirm();
        expect(() => booking.confirm()).not.toThrow();
        expect(booking.getStatus()).toBe(BookingStatus.CONFIRMED);
    });

    test('should handle multiple cancel attempts gracefully', () => {
        booking.cancel();
        expect(() => booking.cancel()).not.toThrow();
        expect(booking.getStatus()).toBe(BookingStatus.CANCELLED);
    });
});
