import { BookingStatus, BookingAction, BookingActionInfo } from '../types';
import { Booking } from '../entities';


export abstract class BookingState {
    abstract getStatus(): BookingStatus;
    abstract getAvailableActions(): BookingAction[];
    abstract getAvailableActionInfos(): BookingActionInfo[];

    abstract confirm(booking: Booking): void;
    abstract checkIn(booking: Booking): void;
    abstract checkOut(booking: Booking): void;
    abstract cancel(booking: Booking): void;

    protected throwInvalidAction(action: string, currentState: string): void {
        throw new Error(`Cannot ${action} booking in ${currentState} state`);
    }

    protected createActionInfo(action: BookingAction): BookingActionInfo {
        const actionInfoMap: Record<BookingAction, { label: string; description: string }> = {
            [BookingAction.CONFIRM]: {
                label: 'Confirm',
                description: 'Confirm the booking',
            },
            [BookingAction.CANCEL]: {
                label: 'Cancel',
                description: 'Cancel the booking',
            },
            [BookingAction.CHECK_IN]: {
                label: 'Check In',
                description: 'Check in to the room',
            },
            [BookingAction.CHECK_OUT]: {
                label: 'Check Out',
                description: 'Check out from the room',
            },
        };

        return {
            action,
            ...actionInfoMap[action],
        };
    }
}
