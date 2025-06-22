import { HotelBookingFacade } from '../facade/HotelBookingFacade';
import { ServiceFactory } from '../factories/ServiceFactory';

describe('Facade Pattern - Hotel Booking Facade', () => {
    let facade: HotelBookingFacade;

    beforeEach(async () => {
        facade = await ServiceFactory.initializeServices({ localMode: true });
    });

    test('should get available rooms', async () => {
        const rooms = await facade.getAvailableRooms();
        expect(rooms.length).toBeGreaterThan(0);
        expect(rooms[0]).toHaveProperty('id');
        expect(rooms[0]).toHaveProperty('number');
        expect(rooms[0]).toHaveProperty('isDeluxe');
        expect(rooms[0]).toHaveProperty('isAvailable');
        expect(rooms[0]).toHaveProperty('price');
        expect(rooms[0].isAvailable).toBe(true);
    });

    test('should successfully book a room', async () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const result = await facade.bookRoom(
            false,
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

    test('should confirm booking successfully', async () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = await facade.bookRoom(
            false,
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

        const confirmResult = facade.confirmBooking(bookingId);
        expect(confirmResult.success).toBe(true);
        expect(confirmResult.message).toContain('confirmed successfully');
    });

    test('should handle check-in process', async () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = await facade.bookRoom(
            false,
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

        const checkInResult = facade.checkIn(bookingId);
        expect(checkInResult.success).toBe(true);
        expect(checkInResult.message).toContain('Check-in completed successfully');
    });

    test('should handle complete booking lifecycle', async () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = await facade.bookRoom(
            true,
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

        const confirmResult = facade.confirmBooking(bookingId);
        expect(confirmResult.success).toBe(true);

        const checkInResult = facade.checkIn(bookingId);
        expect(checkInResult.success).toBe(true);

        const checkOutResult = await facade.checkOut(bookingId);
        expect(checkOutResult.success).toBe(true);

        const bookingInfo = facade.getBookingInfo(bookingId);
        expect(bookingInfo.status).toBe('checked_out');
        expect(bookingInfo.availableActions).toEqual([]);
    });

    test('should cancel booking successfully', async () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        const bookingResult = await facade.bookRoom(
            false,
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

        const cancelResult = await facade.cancelBooking(bookingId);
        expect(cancelResult.success).toBe(true);
        expect(cancelResult.message).toContain('cancelled successfully');

        const bookingInfo = facade.getBookingInfo(bookingId);
        expect(bookingInfo.status).toBe('cancelled');
    });

    test('should handle booking not found error', () => {
        const result = facade.getBookingInfo('INVALID_BOOKING_ID');
        expect(result.message).toBe('Booking not found');
        expect(result.booking).toBeUndefined();
    });

    test('should get all bookings', async () => {
        const checkIn = new Date('2025-06-15');
        const checkOut = new Date('2025-06-18');

        await facade.bookRoom(
            false,
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
