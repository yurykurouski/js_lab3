import { BookingDetails, BookingStatus } from '../types';

export class Booking {
    private state: BookingState;
    private details: BookingDetails;

    constructor(details: BookingDetails) {
        this.details = details;
        this.state = new NewBookingState();
    }

    public setState(state: BookingState): void {
        this.state = state;
    }

    public getState(): BookingState {
        return this.state;
    }

    public getDetails(): BookingDetails {
        return { ...this.details };
    }

    public getStatus(): BookingStatus {
        return this.state.getStatus();
    }

    public confirm(): void {
        this.state.confirm(this);
    }

    public checkIn(): void {
        this.state.checkIn(this);
    }

    public checkOut(): void {
        this.state.checkOut(this);
    }

    public cancel(): void {
        this.state.cancel(this);
    }

    public getAvailableActions(): string[] {
        return this.state.getAvailableActions();
    }
}

// State Pattern: Abstract state interface
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

// Concrete state: New booking
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

// Concrete state: Confirmed booking
export class ConfirmedBookingState extends BookingState {
    getStatus(): BookingStatus {
        return BookingStatus.CONFIRMED;
    }

    getAvailableActions(): string[] {
        return ['checkIn', 'cancel'];
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

// Concrete state: Checked in
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

// Concrete state: Checked out
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

// Concrete state: Cancelled
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
