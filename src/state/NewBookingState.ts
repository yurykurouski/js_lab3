import { BookingStatus } from "../types";
import { Booking } from "./Booking";
import { BookingState } from "./BookingState";
import { CancelledBookingState } from "./CancelledBookingState";
import { ConfirmedBookingState } from "./ConfirmedBookingState";


export class NewBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.NEW;
    }

    getAvailableActions(): string[] {
        return ['confirm', 'cancel'];
    }

    confirm(booking: Booking): void {
        console.log('Booking confirmed');
        booking.setState(new ConfirmedBookingState());
    }

    checkIn(): void {
        this.throwInvalidAction('check in', 'new');
    }

    checkOut(): void {
        this.throwInvalidAction('check out', 'new');
    }

    cancel(booking: Booking): void {
        console.log('Booking cancelled');
        booking.setState(new CancelledBookingState());
    }
}
