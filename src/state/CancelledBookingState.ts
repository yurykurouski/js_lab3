import { BookingStatus, BookingAction, BookingActionInfo } from "../types";
import { BookingState } from "./BookingState";


export class CancelledBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CANCELLED;
    }

    getAvailableActions(): BookingAction[] {
        return [];
    }

    getAvailableActionInfos(): BookingActionInfo[] {
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
