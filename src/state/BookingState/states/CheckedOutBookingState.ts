import { BookingStatus, BookingAction, BookingActionInfo } from '@/types';
import { BookingState } from '@/state/BookingState';


export class CheckedOutBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CHECKED_OUT;
    }

    getAvailableActions(): BookingAction[] {
        return [];
    }

    getAvailableActionInfos(): BookingActionInfo[] {
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
