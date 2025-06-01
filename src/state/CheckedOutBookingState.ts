import { BookingStatus } from "../types";
import { BookingState } from "./BookingState";


export class CheckedOutBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CHECKED_OUT;
    }

    getAvailableActions(): string[] {
        return [];
    }

    confirm(): void {
        this.throwInvalidAction('confirm', 'checked out');
    }

    checkIn(): void {
        this.throwInvalidAction('check in', 'checked out');
    }

    checkOut(): void {
        console.log('Guest is already checked out');
    }

    cancel(): void {
        this.throwInvalidAction('cancel', 'checked out');
    }
}
