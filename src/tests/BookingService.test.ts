import { BookingService } from '../services';
import { BookingDetails, BookingStatus } from '../types';

describe('BookingService', () => {
    let bookingService: BookingService;
    let mockBookingDetails: BookingDetails;

    beforeEach(() => {
        bookingService = new BookingService();
        mockBookingDetails = {
            id: 'TEST001',
            guestId: 'guest1',
            roomId: 'room1',
            checkInDate: new Date('2024-01-15'),
            checkOutDate: new Date('2024-01-18'),
            totalPrice: 300,
            createdAt: new Date('2024-01-10')
        };
    });

    describe('generateBookingId', () => {
        it('should generate sequential booking IDs', () => {
            const id1 = bookingService.generateBookingId();
            const id2 = bookingService.generateBookingId();
            const id3 = bookingService.generateBookingId();

            expect(id1).toBe('BK001');
            expect(id2).toBe('BK002');
            expect(id3).toBe('BK003');
        });

        it('should pad booking IDs with zeros', () => {
            for (let i = 1; i <= 9; i++) {
                bookingService.generateBookingId();
            }
            const id10 = bookingService.generateBookingId();
            expect(id10).toBe('BK010');
        });
    });

    describe('createBooking', () => {
        it('should create and store a new booking', () => {
            const booking = bookingService.createBooking(mockBookingDetails);

            expect(booking).toBeDefined();
            expect(booking.getDetails()).toEqual(mockBookingDetails);
            expect(booking.getStatus()).toBe(BookingStatus.NEW);
        });

        it('should store booking and make it retrievable', () => {
            bookingService.createBooking(mockBookingDetails);
            const retrievedBooking = bookingService.getBooking('TEST001');

            expect(retrievedBooking).toBeDefined();
            expect(retrievedBooking!.getDetails().id).toBe('TEST001');
        });
    });

    describe('getBooking', () => {
        it('should return booking when it exists', () => {
            bookingService.createBooking(mockBookingDetails);
            const booking = bookingService.getBooking('TEST001');

            expect(booking).toBeDefined();
            expect(booking!.getDetails().id).toBe('TEST001');
        });

        it('should return undefined when booking does not exist', () => {
            const booking = bookingService.getBooking('NONEXISTENT');
            expect(booking).toBeUndefined();
        });
    });

    describe('getAllBookings', () => {
        it('should return empty array when no bookings exist', () => {
            const bookings = bookingService.getAllBookings();
            expect(bookings).toEqual([]);
        });

        it('should return all bookings', () => {
            const booking1Details = { ...mockBookingDetails, id: 'TEST001' };
            const booking2Details = { ...mockBookingDetails, id: 'TEST002', guestId: 'guest2' };

            bookingService.createBooking(booking1Details);
            bookingService.createBooking(booking2Details);

            const bookings = bookingService.getAllBookings();
            expect(bookings).toHaveLength(2);
            expect(bookings[0].getDetails().id).toBe('TEST001');
            expect(bookings[1].getDetails().id).toBe('TEST002');
        });
    });

    describe('deleteBooking', () => {
        it('should delete existing booking and return true', () => {
            bookingService.createBooking(mockBookingDetails);
            const deleted = bookingService.deleteBooking('TEST001');

            expect(deleted).toBe(true);
            expect(bookingService.getBooking('TEST001')).toBeUndefined();
        });

        it('should return false when trying to delete non-existent booking', () => {
            const deleted = bookingService.deleteBooking('NONEXISTENT');
            expect(deleted).toBe(false);
        });
    });

    describe('getBookingsByGuest', () => {
        beforeEach(() => {
            const booking1 = { ...mockBookingDetails, id: 'TEST001', guestId: 'guest1' };
            const booking2 = { ...mockBookingDetails, id: 'TEST002', guestId: 'guest2' };
            const booking3 = { ...mockBookingDetails, id: 'TEST003', guestId: 'guest1' };

            bookingService.createBooking(booking1);
            bookingService.createBooking(booking2);
            bookingService.createBooking(booking3);
        });

        it('should return bookings for specific guest', () => {
            const guest1Bookings = bookingService.getBookingsByGuest('guest1');
            expect(guest1Bookings).toHaveLength(2);
            expect(guest1Bookings[0].getDetails().guestId).toBe('guest1');
            expect(guest1Bookings[1].getDetails().guestId).toBe('guest1');
        });

        it('should return empty array for guest with no bookings', () => {
            const bookings = bookingService.getBookingsByGuest('nonexistent');
            expect(bookings).toEqual([]);
        });
    });

    describe('getBookingsByRoom', () => {
        beforeEach(() => {
            const booking1 = { ...mockBookingDetails, id: 'TEST001', roomId: 'room1' };
            const booking2 = { ...mockBookingDetails, id: 'TEST002', roomId: 'room2' };
            const booking3 = { ...mockBookingDetails, id: 'TEST003', roomId: 'room1' };

            bookingService.createBooking(booking1);
            bookingService.createBooking(booking2);
            bookingService.createBooking(booking3);
        });

        it('should return bookings for specific room', () => {
            const room1Bookings = bookingService.getBookingsByRoom('room1');
            expect(room1Bookings).toHaveLength(2);
            expect(room1Bookings[0].getDetails().roomId).toBe('room1');
            expect(room1Bookings[1].getDetails().roomId).toBe('room1');
        });

        it('should return empty array for room with no bookings', () => {
            const bookings = bookingService.getBookingsByRoom('nonexistent');
            expect(bookings).toEqual([]);
        });
    });

    describe('hasActiveBookings', () => {
        it('should return true when room has active bookings (NEW)', () => {
            bookingService.createBooking(mockBookingDetails);
            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(true);
        });

        it('should return true when room has active bookings (CONFIRMED)', () => {
            const booking = bookingService.createBooking(mockBookingDetails);
            booking.confirm();
            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(true);
        });

        it('should return true when room has active bookings (CHECKED_IN)', () => {
            const booking = bookingService.createBooking(mockBookingDetails);
            booking.confirm();
            booking.checkIn();
            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(true);
        });

        it('should return false when room has only cancelled bookings', () => {
            const booking = bookingService.createBooking(mockBookingDetails);
            booking.cancel();
            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(false);
        });

        it('should return false when room has only checked out bookings', () => {
            const booking = bookingService.createBooking(mockBookingDetails);
            booking.confirm();
            booking.checkIn();
            booking.checkOut();
            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(false);
        });

        it('should return false when room has no bookings', () => {
            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(false);
        });

        it('should handle mixed booking states correctly', () => {
            const booking1 = { ...mockBookingDetails, id: 'TEST001', roomId: 'room1' };
            const booking2 = { ...mockBookingDetails, id: 'TEST002', roomId: 'room1' };

            const b1 = bookingService.createBooking(booking1);
            const b2 = bookingService.createBooking(booking2);

            // Cancel first booking
            b1.cancel();
            // Keep second booking active
            b2.confirm();

            const hasActive = bookingService.hasActiveBookings('room1');
            expect(hasActive).toBe(true);
        });
    });
});
