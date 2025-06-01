import { BookingDetails, BookingStatus, BookingAction, BookingActionInfo } from "../types";
import { BookingState } from "./BookingState";
import { NewBookingState } from "./NewBookingState";


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

    public getAvailableActions(): BookingAction[] {
        return this.state.getAvailableActions();
    }

    public getAvailableActionInfos(): BookingActionInfo[] {
        return this.state.getAvailableActionInfos();
    }
}
