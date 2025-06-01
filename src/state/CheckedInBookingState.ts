import { BookingStatus } from "../types";
import { Booking } from "./Booking";
import { BookingState } from "./BookingState";
import { CheckedOutBookingState } from "./CheckedOutBookingState";


export class CheckedInBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CHECKED_IN;
    }

    getAvailableActions(): string[] {
        return ['checkOut'];
    }

    confirm(): void {
        console.log('Guest is already checked in');
    }

    checkIn(): void {
        console.log('Guest is already checked in');
    }

    checkOut(booking: Booking): void {
        console.log('Guest checked out');
        booking.setState(new CheckedOutBookingState());
    }

    cancel(): void {
        this.throwInvalidAction('cancel', 'checked in');
    }
}
