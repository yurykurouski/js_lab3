import { BookingStatus, BookingAction, BookingActionInfo } from '@/types';
import { Booking } from '@/entities';
import { BookingState } from '@/state/BookingState';
import { CancelledBookingState, CheckedInBookingState } from './';


export class ConfirmedBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CONFIRMED;
    }

    getAvailableActions(): BookingAction[] {
        return [BookingAction.CHECK_IN, BookingAction.CANCEL];
    }

    getAvailableActionInfos(): BookingActionInfo[] {
        return this.getAvailableActions().map(action => this.createActionInfo(action));
    }

    confirm(): void {
        console.log('Booking is already confirmed');
    }

    checkIn(booking: Booking): void {
        console.log('Guest checked in');
        booking.setState(new CheckedInBookingState());
    }

    checkOut(): void {
        this.throwInvalidAction('check out', 'confirmed');
    }

    cancel(booking: Booking): void {
        console.log('Booking cancelled');
        booking.setState(new CancelledBookingState());
    }
}
