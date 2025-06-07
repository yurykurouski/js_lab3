import { BookingDetails, BookingStatus, BookingAction, BookingActionInfo } from '@/types';
import { BookingState, NewBookingState } from '@/state';
import { BookingEventManager, BookingEventType } from '@/observers';


export class Booking {
    private state: BookingState;
    private details: BookingDetails;
    private eventManager: BookingEventManager;

    constructor(details: BookingDetails) {
        this.details = details;
        this.state = new NewBookingState();
        this.eventManager = BookingEventManager.getInstance();

        this.eventManager.publishBookingStateChange(
            this.details.id,
            BookingEventType.BOOKING_CREATED,
            this.details,
            BookingStatus.NEW,
        );
    }

    public setState(state: BookingState): void {
        const previousStatus = this.state.getStatus();
        this.state = state;
        const newStatus = this.state.getStatus();

        let eventType: BookingEventType;
        switch (newStatus) {
            case BookingStatus.CONFIRMED:
                eventType = BookingEventType.BOOKING_CONFIRMED;
                break;
            case BookingStatus.CANCELLED:
                eventType = BookingEventType.BOOKING_CANCELLED;
                break;
            case BookingStatus.CHECKED_IN:
                eventType = BookingEventType.GUEST_CHECKED_IN;
                break;
            case BookingStatus.CHECKED_OUT:
                eventType = BookingEventType.GUEST_CHECKED_OUT;
                break;
            default:
                return; // No event for unknown states
        }

        this.eventManager.publishBookingStateChange(
            this.details.id,
            eventType,
            this.details,
            newStatus,
            previousStatus,
        );
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
