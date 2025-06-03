import { HotelBookingFacade } from '../facade/HotelBookingFacade';
import { Guest, RoomType } from '../types';

describe('Facade Pattern - Hotel Booking Facade', () => {
    let facade: HotelBookingFacade;
    let sampleGuest: Guest;

    beforeEach(() => {
        facade = new HotelBookingFacade();
        sampleGuest = {
            id: 'test_guest_001',
            name: 'Test Guest',
            email: 'test@example.com',
            phone: '+1234567890',
        };
    });

    test('should get available rooms', () => {
        const rooms = facade.getAvailableRooms();
        expect(rooms.length).toBeGreaterThan(0);
        expect(rooms[0]).toHaveProperty('id');
        expect(rooms[0]).toHaveProperty('number');
        expect(rooms[0]).toHaveProperty('type');
        expect(rooms[0]).toHaveProperty('price');
        expect(rooms[0].isAvailable).toBe(true);
    });

    test('should successfully book a room', () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const result = facade.bookRoom(
            sampleGuest,
            RoomType.STANDARD,
            checkIn,
            checkOut,
            {
                cardNumber: '1234567890123456',
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        expect(result.success).toBe(true);
        expect(result.bookingId).toBeDefined();
        expect(result.message).toContain('successfully');
    });

    test('should fail booking with invalid payment', () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const result = facade.bookRoom(
            sampleGuest,
            RoomType.STANDARD,
            checkIn,
            checkOut,
            {
                cardNumber: '123', // Invalid card number
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('Payment processing failed');
    });

    test('should confirm booking successfully', () => {
    // First create a booking
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = facade.bookRoom(
            sampleGuest,
            RoomType.STANDARD,
            checkIn,
            checkOut,
            {
                cardNumber: '1234567890123456',
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        expect(bookingResult.success).toBe(true);
        const bookingId = bookingResult.bookingId!;

        // Then confirm it
        const confirmResult = facade.confirmBooking(bookingId);
        expect(confirmResult.success).toBe(true);
        expect(confirmResult.message).toContain('confirmed successfully');
    });

    test('should handle check-in process', () => {
    // Create and confirm booking first
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = facade.bookRoom(
            sampleGuest,
            RoomType.STANDARD,
            checkIn,
            checkOut,
            {
                cardNumber: '1234567890123456',
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        const bookingId = bookingResult.bookingId!;
        facade.confirmBooking(bookingId);

        // Now check in
        const checkInResult = facade.checkIn(bookingId);
        expect(checkInResult.success).toBe(true);
        expect(checkInResult.message).toContain('Check-in completed successfully');
    });

    test('should handle complete booking lifecycle', () => {
    // Book
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = facade.bookRoom(
            sampleGuest,
            RoomType.DELUXE,
            checkIn,
            checkOut,
            {
                cardNumber: '1234567890123456',
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        expect(bookingResult.success).toBe(true);
        const bookingId = bookingResult.bookingId!;

        // Confirm
        const confirmResult = facade.confirmBooking(bookingId);
        expect(confirmResult.success).toBe(true);

        // Check in
        const checkInResult = facade.checkIn(bookingId);
        expect(checkInResult.success).toBe(true);

        // Check out
        const checkOutResult = facade.checkOut(bookingId);
        expect(checkOutResult.success).toBe(true);

        // Verify final state
        const bookingInfo = facade.getBookingInfo(bookingId);
        expect(bookingInfo.status).toBe('checked_out');
        expect(bookingInfo.availableActions).toEqual([]);
    });

    test('should cancel booking successfully', () => {
    // Create booking
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = facade.bookRoom(
            sampleGuest,
            RoomType.STANDARD,
            checkIn,
            checkOut,
            {
                cardNumber: '1234567890123456',
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        const bookingId = bookingResult.bookingId!;

        // Cancel it
        const cancelResult = facade.cancelBooking(bookingId);
        expect(cancelResult.success).toBe(true);
        expect(cancelResult.message).toContain('cancelled successfully');

        // Verify cancellation
        const bookingInfo = facade.getBookingInfo(bookingId);
        expect(bookingInfo.status).toBe('cancelled');
    });

    test('should handle booking not found error', () => {
        const result = facade.getBookingInfo('INVALID_BOOKING_ID');
        expect(result.message).toBe('Booking not found');
        expect(result.booking).toBeUndefined();
    });

    test('should get all bookings', () => {
    // Create a booking first
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        facade.bookRoom(
            sampleGuest,
            RoomType.STANDARD,
            checkIn,
            checkOut,
            {
                cardNumber: '1234567890123456',
                expiryDate: '12/26',
                cvv: '123',
                cardHolderName: 'Test Guest',
            },
        );

        const allBookings = facade.getAllBookings();
        expect(allBookings.length).toBeGreaterThan(0);
        expect(allBookings[0]).toHaveProperty('bookingId');
        expect(allBookings[0]).toHaveProperty('details');
        expect(allBookings[0]).toHaveProperty('status');
    });
});
