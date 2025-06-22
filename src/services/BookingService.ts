import { Booking } from '../entities';
import { BookingDetails, BookingStatus } from '../types';
import { Log } from '@/decorators';


export class BookingService {
    private bookings: Map<string, Booking> = new Map();
    private bookingCounter: number = 1;

    @Log
    createBooking(bookingDetails: BookingDetails): Booking {
        const booking = new Booking(bookingDetails);
        this.bookings.set(bookingDetails.id, booking);
        console.log(`Booking ${bookingDetails.id} created successfully`);
        return booking;
    }

    @Log
    getBooking(bookingId: string): Booking | undefined {
        return this.bookings.get(bookingId);
    }

    @Log
    getAllBookings(): Booking[] {
        return Array.from(this.bookings.values());
    }

    @Log
    deleteBooking(bookingId: string): boolean {
        const deleted = this.bookings.delete(bookingId);
        if (deleted) {
            console.log(`Booking ${bookingId} deleted successfully`);
        }
        return deleted;
    }

    @Log
    generateBookingId(): string {
        return `BK${String(this.bookingCounter++).padStart(3, '0')}`;
    }

    @Log
    getBookingsByRoom(roomId: string): Booking[] {
        return Array.from(this.bookings.values()).filter(
            booking => booking.getDetails().roomId === roomId,
        );
    }

    @Log
    hasActiveBookings(roomId: string): boolean {
        return this.getBookingsByRoom(roomId).some(booking => {
            const status = booking.getStatus();
            return status !== BookingStatus.CANCELLED && status !== BookingStatus.CHECKED_OUT;
        });
    }
}
