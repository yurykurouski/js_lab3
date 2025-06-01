import { Booking } from "../state/BookingState";
import { BookingDetails, BookingStatus } from "../types";


export class BookingService {
    private bookings: Map<string, Booking> = new Map();
    private bookingCounter: number = 1;

    createBooking(bookingDetails: BookingDetails): Booking {
        const booking = new Booking(bookingDetails);
        this.bookings.set(bookingDetails.id, booking);
        console.log(`Booking ${bookingDetails.id} created successfully`);
        return booking;
    }

    getBooking(bookingId: string): Booking | undefined {
        return this.bookings.get(bookingId);
    }

    getAllBookings(): Booking[] {
        return Array.from(this.bookings.values());
    }

    deleteBooking(bookingId: string): boolean {
        const deleted = this.bookings.delete(bookingId);
        if (deleted) {
            console.log(`Booking ${bookingId} deleted successfully`);
        }
        return deleted;
    }

    generateBookingId(): string {
        return `BK${String(this.bookingCounter++).padStart(3, '0')}`;
    }

    getBookingsByGuest(guestId: string): Booking[] {
        return Array.from(this.bookings.values()).filter(
            booking => booking.getDetails().guestId === guestId
        );
    }

    getBookingsByRoom(roomId: string): Booking[] {
        return Array.from(this.bookings.values()).filter(
            booking => booking.getDetails().roomId === roomId
        );
    }

    hasActiveBookings(roomId: string): boolean {
        return this.getBookingsByRoom(roomId).some(booking => {
            const status = booking.getStatus();
            return status !== BookingStatus.CANCELLED && status !== BookingStatus.CHECKED_OUT;
        });
    }
}