import { BookingStatus, BookingAction, BookingActionInfo } from "../types";
import { Booking } from "./Booking";
import { BookingState } from "./BookingState";
import { CancelledBookingState } from "./CancelledBookingState";
import { ConfirmedBookingState } from "./ConfirmedBookingState";


export class NewBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.NEW;
    }

    getAvailableActions(): BookingAction[] {
        return [BookingAction.CONFIRM, BookingAction.CANCEL];
    }

    getAvailableActionInfos(): BookingActionInfo[] {
        return this.getAvailableActions().map(action => this.createActionInfo(action));
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
