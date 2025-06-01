import { BookingStatus } from "../types";
import { BookingState } from "./BookingState";


export class CancelledBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CANCELLED;
    }

    getAvailableActions(): string[] {
        return [];
    }

    confirm(): void {
        this.throwInvalidAction('confirm', 'cancelled');
    }

    checkIn(): void {
        this.throwInvalidAction('check in', 'cancelled');
    }

    checkOut(): void {
        this.throwInvalidAction('check out', 'cancelled');
    }

    cancel(): void {
        console.log('Booking is already cancelled');
    }
}
