import { BookingStatus } from '../types';
import { Booking } from './Booking';


export abstract class BookingState {
    abstract getStatus(): BookingStatus;
    abstract getAvailableActions(): string[];

    abstract confirm(booking: Booking): void;
    abstract checkIn(booking: Booking): void;
    abstract checkOut(booking: Booking): void;
    abstract cancel(booking: Booking): void;

    protected throwInvalidAction(action: string, currentState: string): void {
        throw new Error(`Cannot ${action} booking in ${currentState} state`);
    }
}
